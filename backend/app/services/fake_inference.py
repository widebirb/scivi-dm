import asyncio
import base64
import random
import time
import uuid
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
import os

from app.models.schemas import GenerationParameters, InpaintParameters

def _make_placeholder_image(
    width: int,
    height: int,
    label: str,
    seed: int,
    mode: str = "generate"
) -> str:
    """
    Creates a placeholder image that shows what would have been generated.
    """
    random.seed(seed)
    r = random.randint(60, 180)
    g = random.randint(60, 180)
    b = random.randint(60, 180)

    img = Image.new("RGB", (width, height), color=(r, g, b))
    draw = ImageDraw.Draw(img)

    # Overlay text showing key params
    lines = [
        f"[FAKE] {mode.upper()}",
        f"Seed: {seed}",
        f"{width}x{height}",
        f"Prompt: {label[:40]}{'...' if len(label) > 40 else ''}",
    ]

    y = height // 2 - (len(lines) * 50) // 2
    for line in lines:
        draw.text((50, y), line, fill=(255, 255, 255))
        y += 22

    buffer = BytesIO()
    img.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


async def fake_generate(params: GenerationParameters) -> dict:
    """Simulates txt2img inference."""
    seed = params.seed if params.seed != -1 else random.randint(0, 2**32 - 1)

    # Real models scale roughly linearly with steps
    simulated_time = params.steps * 0.15
    await asyncio.sleep(simulated_time)

    image_b64 = _make_placeholder_image(
        width=params.width,
        height=params.height,
        label=params.prompt,
        seed=seed,
        mode="generate"
    )

    # Return the actual seed used so frontend can display/store it
    used_params = params.model_copy(update={"seed": seed})

    return {
        "image_data": f"data:image/png;base64,{image_b64}",
        "generation_time": round(simulated_time, 2),
        "success": True,
        "used_parameters": used_params,
        "version_id": str(uuid.uuid4()),
    }


async def fake_inpaint(
    image_b64: str,
    mask_b64: str,
    params: GenerationParameters,
    inpaint_params: InpaintParameters
) -> dict:
    """Simulates inpainting inference."""
    seed = params.seed if params.seed != -1 else random.randint(0, 2**32 - 1)

    # Inpainting is generally slower than base generation
    simulated_time = params.steps * 0.20
    await asyncio.sleep(simulated_time)

    image_b64_out = _make_placeholder_image(
        width=params.width,
        height=params.height,
        label=f"[INPAINT] {params.prompt}",
        seed=seed,
        mode="inpaint"
    )

    used_params = params.model_copy(update={"seed": seed})

    return {
        "image_data": f"data:image/png;base64,{image_b64_out}",
        "generation_time": round(simulated_time, 2),
        "success": True,
        "used_parameters": used_params,
        "version_id": str(uuid.uuid4()),
    }