from pydantic import BaseModel, Field
from typing import Optional, Tuple
from datetime import datetime


class GenerationParameters(BaseModel):
    prompt: str
    negative_prompt: str = ""
    width: int = Field(default=512, ge=256, le=1024)
    height: int = Field(default=512, ge=256, le=1024)
    sampler: str = "DPM++ 2M Karras"
    steps: int = Field(default=20, ge=1, le=150)
    cfg_scale: float = Field(default=7.0, ge=1.0, le=30.0)
    seed: int = Field(default=-1)  # -1 = random


class InpaintParameters(BaseModel):
    denoising_strength: float = Field(default=0.75, ge=0.0, le=1.0)
    mask_blur: int = Field(default=4, ge=0, le=64)


class GenerationRequest(BaseModel):
    parameters: GenerationParameters


class InpaintRequest(BaseModel):
    image: str  # base64 encoded
    mask: str   # base64 encoded, white=repaint black=keep
    parameters: GenerationParameters
    inpaint_params: InpaintParameters = InpaintParameters()


class GenerationResponse(BaseModel):
    image_data: str          # base64 encoded
    generation_time: float
    success: bool
    used_parameters: GenerationParameters
    version_id: Optional[str] = None