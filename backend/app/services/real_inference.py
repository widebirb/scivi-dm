import time
import uuid
import torch
from PIL import Image


from compel import Compel, ReturnedEmbeddingsType
from app.models.schemas import GenerationParameters, InpaintParameters
from app.services.model_manager import model_manager
from app.services.image_processor import (
    decode_base64_image,
    encode_image_base64,
    resize_image,
    apply_mask_blur,
)


def _resolve_seed(seed: int) -> tuple[int, torch.Generator]:
    """
    If seed is -1, pick a random one.
    Returns both the resolved seed (for storing in version history)
    and a torch Generator (for reproducible inference).
    """
    resolved = seed if seed != -1 else int(torch.randint(0, 2**32, (1,)).item())
    generator = torch.Generator(device=model_manager.device).manual_seed(resolved)
    return resolved, generator


async def real_generate(params: GenerationParameters) -> dict:
    """
    txt2img inference using JuggernautXL base model.
    This runs synchronously inside an async function 
    FastAPI handles this fine for single-worker setups. For production multi-user you'd
    wrap in run_in_executor, but for Vast.ai single-user that's overkill.
    """
    model_manager.use_base()
    pipeline = model_manager.get_base()
    model_manager.set_sampler(pipeline, params.sampler)

    resolved_seed, generator = _resolve_seed(params.seed)

    # Compel handles both text encoders in SDXL, solves the 77 toke nlimitation of clip
    compel = Compel(
        tokenizer=[pipeline.tokenizer, pipeline.tokenizer_2],
        text_encoder=[pipeline.text_encoder, pipeline.text_encoder_2],
        returned_embeddings_type=ReturnedEmbeddingsType.PENULTIMATE_HIDDEN_STATES_NON_NORMALIZED,
        requires_pooled=[False, True],
    )

    conditioning, pooled = compel(params.prompt)
    neg_conditioning, neg_pooled = compel(params.negative_prompt)

    # Pad to same length
    [conditioning, neg_conditioning] = compel.pad_conditioning_tensors_to_same_length(
        [conditioning, neg_conditioning]
    )

    start = time.time()

    result = pipeline(
        prompt=params.prompt,
        negative_prompt=params.negative_prompt,
        width=params.width,
        height=params.height,
        num_inference_steps=params.steps,
        guidance_scale=params.cfg_scale,
        generator=generator,
    )

    generation_time = round(time.time() - start, 2)
    image: Image.Image = result.images[0]

    image_b64 = f"data:image/png;base64,{encode_image_base64(image)}"
    used_params = params.model_copy(update={"seed": resolved_seed})

    return {
        "image_data": image_b64,
        "generation_time": generation_time,
        "success": True,
        "used_parameters": used_params,
        "version_id": str(uuid.uuid4()),
    }


async def real_inpaint(
    image_b64: str,
    mask_b64: str,
    params: GenerationParameters,
    inpaint_params: InpaintParameters,
) -> dict:
    """
    Inpainting inference using JuggernautXL inpainting model.

    Mask expectations (validated in the router before this is called):
    - Grayscale PNG
    - White (255) = repaint this region
    - Black (0) = keep this region
    - Same dimensions as the input image
    """
    model_manager.use_inpaint()
    pipeline = model_manager.get_inpaint()
    model_manager.set_sampler(pipeline, params.sampler)

    resolved_seed, generator = _resolve_seed(params.seed)

    compel = Compel(
        tokenizer=[pipeline.tokenizer, pipeline.tokenizer_2],
        text_encoder=[pipeline.text_encoder, pipeline.text_encoder_2],
        returned_embeddings_type=ReturnedEmbeddingsType.PENULTIMATE_HIDDEN_STATES_NON_NORMALIZED,
        requires_pooled=[False, True],
    )

    conditioning, pooled = compel(params.prompt)
    neg_conditioning, neg_pooled = compel(params.negative_prompt)

    [conditioning, neg_conditioning] = compel.pad_conditioning_tensors_to_same_length(
        [conditioning, neg_conditioning]
    )

    # Decode both images from base64
    image = decode_base64_image(image_b64).convert("RGB")
    mask = decode_base64_image(mask_b64).convert("L")  # L = grayscale

    # Resize both to the target resolution if they differ
    # Keeps image and mask dimensions in sync
    target_size = (params.width, params.height)
    if image.size != target_size:
        image = resize_image(image, params.width, params.height)
    if mask.size != target_size:
        mask = resize_image(mask, params.width, params.height)

    # Soften mask edges to reduce hard seams
    if inpaint_params.mask_blur > 0:
        mask = apply_mask_blur(mask, inpaint_params.mask_blur)

    start = time.time()

    result = pipeline(
        prompt=params.prompt,
        negative_prompt=params.negative_prompt,
        image=image,
        mask_image=mask,
        width=params.width,
        height=params.height,
        num_inference_steps=params.steps,
        guidance_scale=params.cfg_scale,
        strength=inpaint_params.denoising_strength,
        generator=generator,
    )

    generation_time = round(time.time() - start, 2)
    output_image: Image.Image = result.images[0]

    image_b64_out = f"data:image/png;base64,{encode_image_base64(output_image)}"
    used_params = params.model_copy(update={"seed": resolved_seed})

    return {
        "image_data": image_b64_out,
        "generation_time": generation_time,
        "success": True,
        "used_parameters": used_params,
        "version_id": str(uuid.uuid4()),
    }