from fastapi import APIRouter, HTTPException
from app.models.schemas import GenerationRequest, GenerationResponse
from app.services.fake_inference import fake_generate

router = APIRouter(prefix="/generate", tags=["generation"])


@router.post("", response_model=GenerationResponse)
async def generate(request: GenerationRequest):
    try:
        result = await fake_generate(request.parameters)
        return GenerationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))