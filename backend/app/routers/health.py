import os
from fastapi import APIRouter

USE_FAKE = os.getenv("USE_FAKE_INFERENCE", "true").lower() == "true"

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
async def health():
    if USE_FAKE:
        return {"status": "ok", "mode": "fake", "models_loaded": False}

    from app.services.model_manager import model_manager
    return {
        "status": "ok",
        "mode": "real",
        "models_loaded": model_manager.is_loaded,
    }