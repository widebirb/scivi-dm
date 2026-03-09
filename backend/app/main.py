from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import generate, inpaint, health

app = FastAPI(
    title="JuggernautXL API",
    description="Fake inference backend for frontend development. Swap fake_inference.py for real model calls later.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generate.router)
app.include_router(inpaint.router)
app.include_router(health.router)


@app.get("/")
async def root():
    return {"message": "JuggernautXL API is running", "docs": "/docs"}