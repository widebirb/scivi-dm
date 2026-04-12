from fastapi import APIRouter, HTTPException
from app.models.schemas import InpaintRequest, GenerationResponse
from app.services.image_processor import (
    decode_base64_image,
    validate_mask_dimensions,
)
import os

USE_FAKE = os.getenv("USE_FAKE_INFERENCE", "true").lower() == "true"
if USE_FAKE:
    from app.services.fake_inference import fake_inpaint as inpaint_fn
else:
    from app.services.real_inference import real_inpaint as inpaint_fn

router = APIRouter(prefix="/inpaint", tags=["inpainting"])


@router.post("", response_model=GenerationResponse)
async def inpaint(request: InpaintRequest):
    try:
        image = decode_base64_image(request.image)
        mask = decode_base64_image(request.mask)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 image or mask data.")

    if not validate_mask_dimensions(image, mask):
        raise HTTPException(
            status_code=400,
            detail=f"Mask size {mask.size} does not match image size {image.size}."
        )

    try:
        result = await inpaint_fn(
            image_b64=request.image,
            mask_b64=request.mask,
            params=request.parameters,
            inpaint_params=request.inpaint_params,
        )
        return GenerationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))