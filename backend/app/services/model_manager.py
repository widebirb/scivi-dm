import os
import torch
from diffusers import StableDiffusionXLPipeline, StableDiffusionXLInpaintPipeline

# These paths match the volume mount you'll set up in docker-compose
# /models is mounted from /workspace/models on Vast.ai
BASE_MODEL_ID = "RunDiffusion/Juggernaut-XL-v9"
INPAINT_MODEL_PATH = os.getenv("INPAINT_MODEL_PATH", "/models/juggernaut-xl-inpainting.safetensors")

SAMPLERS = {
    "DPM++ 2M Karras":  ("DPMSolverMultistepScheduler", {"use_karras_sigmas": True}),
    "DPM++ SDE Karras": ("DPMSolverSDEScheduler",       {"use_karras_sigmas": True}),
    "Euler a":          ("EulerAncestralDiscreteScheduler", {}),
    "Euler":            ("EulerDiscreteScheduler",       {}),
    "DDIM":             ("DDIMScheduler",                {}),
}

# real vibe coded cause I don't have gpu to test
class ModelManager:
    """
    Singleton-style service that owns both pipelines.
    Loaded once at startup, reused across all requests.

    Why not load on first request?
    Loading takes ~30-60 seconds. Doing it at startup means the first
    user request isn't penalized. The health endpoint reports
    models_loaded=False until both pipelines are ready.
    """

    def __init__(self):
        self.base_pipeline: StableDiffusionXLPipeline | None = None
        self.inpaint_pipeline: StableDiffusionXLInpaintPipeline | None = None
        self.is_loaded = False
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        if self.device == "cpu":
            print("WARNING: No GPU detected. Inference will be extremely slow.")

    def load(self):
        print(f"Loading models on {self.device}...")

        # Base model — downloads from HuggingFace Hub on first run,
        # then caches to ~/.cache/huggingface. Subsequent starts are fast.
        print("Loading base model from HuggingFace Hub...")
        self.base_pipeline = StableDiffusionXLPipeline.from_pretrained(
            BASE_MODEL_ID,
            torch_dtype=torch.float16,  # float16 is required for GPU VRAM efficiency
            use_safetensors=True,
            variant="fp16",
        ).to(self.device)

        # Enable attention slicing to reduce VRAM usage.
        # Slight speed tradeoff but necessary for 512/768 on most GPUs.
        self.base_pipeline.enable_attention_slicing()

        # Inpainting model — loaded from local .safetensors file (CivitAI download)
        # from_single_file handles the safetensors format directly
        print(f"Loading inpainting model from {INPAINT_MODEL_PATH}...")
        self.inpaint_pipeline = StableDiffusionXLInpaintPipeline.from_single_file(
            INPAINT_MODEL_PATH,
            torch_dtype=torch.float16,
            use_safetensors=True,
        ).to(self.device)

        self.inpaint_pipeline.enable_attention_slicing()

        self.is_loaded = True
        print("Both models loaded successfully.")

    def set_sampler(self, pipeline, sampler_name: str):
        """
        Swaps the scheduler on a pipeline in-place.
        Diffusers pipelines use a scheduler (sampler) that can be
        swapped without reloading the model weights.
        """
        if sampler_name not in SAMPLERS:
            print(f"Unknown sampler '{sampler_name}', using default.")
            return

        scheduler_class_name, kwargs = SAMPLERS[sampler_name]

        # Dynamically import the scheduler class by name
        import diffusers
        SchedulerClass = getattr(diffusers, scheduler_class_name)
        pipeline.scheduler = SchedulerClass.from_config(
            pipeline.scheduler.config,
            **kwargs
        )

    def get_base(self) -> StableDiffusionXLPipeline:
        if not self.is_loaded:
            raise RuntimeError("Models not loaded. Call load() first.")
        return self.base_pipeline

    def get_inpaint(self) -> StableDiffusionXLInpaintPipeline:
        if not self.is_loaded:
            raise RuntimeError("Models not loaded. Call load() first.")
        return self.inpaint_pipeline


# Module-level singleton — imported by routers
# Same pattern as versionStore on the frontend
model_manager = ModelManager()