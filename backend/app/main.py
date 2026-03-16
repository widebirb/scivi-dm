import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import generate, inpaint, health

USE_FAKE = os.getenv("USE_FAKE_INFERENCE", "true").lower() == "true"


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load models at startup if using real inference
    # asynccontextmanager lifespan is the modern FastAPI pattern —
    # replaces the deprecated @app.on_event("startup")
    if not USE_FAKE:
        from app.services.model_manager import model_manager
        model_manager.load()
    yield
    # Cleanup on shutdown (nothing needed for now)


app = FastAPI(
    title="JuggernautXL API",
    description="Facial composite generation API.",
    version="0.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        os.getenv("FRONTEND_URL", ""),  # Vast.ai frontend URL in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generate.router)
app.include_router(inpaint.router)
app.include_router(health.router)


@app.get("/")
async def root():
    return {
        "message": "JuggernautXL API is running",
        "mode": "fake" if USE_FAKE else "real",
        "docs": "/docs",
    }