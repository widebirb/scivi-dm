from fastapi import APIRouter, HTTPException
from app.models.schemas import InpaintRequest, GenerationResponse
from app.services.fake_inference import fake_inpaint
from app.services.image_processor import (
    decode_base64_image,
    validate_mask_dimensions,
)

router = APIRouter(prefix="/inpaint", tags=["inpainting"])


@router.post("", response_model=GenerationResponse)
async def inpaint(request: InpaintRequest):
    # Validate mask/image dimensions match before doing anything else
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
        result = await fake_inpaint(
            image_b64=request.image,
            mask_b64=request.mask,
            params=request.parameters,
            inpaint_params=request.inpaint_params,
        )
        return GenerationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))