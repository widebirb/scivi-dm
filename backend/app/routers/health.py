from fastapi import APIRouter
from app.services.model_manager import model_manager
import os

USE_FAKE = os.getenv("USE_FAKE_INFERENCE", "true").lower() == "true"
router = APIRouter(prefix="/health", tags=["health"])

@router.get("")
async def health():
    return {
        "status": "ok",
        "mode": "fake" if USE_FAKE else "real",
        "models_loaded": False if USE_FAKE else model_manager.is_loaded(),
    }