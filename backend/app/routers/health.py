from fastapi import APIRouter
import os

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
async def health():
    return {
        "status": "ok",
        "mode": "fake",  # swap to "real" when models are loaded
        "models_loaded": False,
    }