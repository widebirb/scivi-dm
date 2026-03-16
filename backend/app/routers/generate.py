import os
from fastapi import APIRouter, HTTPException
from app.models.schemas import GenerationRequest, GenerationResponse

USE_FAKE = os.getenv("USE_FAKE_INFERENCE", "true").lower() == "true"

if USE_FAKE:
    from app.services.fake_inference import fake_generate as _generate
else:
    from app.services.real_inference import real_generate as _generate

router = APIRouter(prefix="/generate", tags=["generation"])


@router.post("", response_model=GenerationResponse)
async def generate(request: GenerationRequest):
    try:
        result = await _generate(request.parameters)
        return GenerationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))