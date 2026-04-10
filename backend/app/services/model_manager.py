import os
import torch
import diffusers

# Reduces CUDA memory fragmentation, must be set before any CUDA allocations
os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"

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


class ModelManager:
    """
    Singleton-style service that owns both pipelines. Loaded once at startup, reused across all requests.

    Loading takes ~30-60 seconds. Doing it at startup means the first user request isn't penalized. 

    VRAM strategy (for ~12GB GPUs):
    Both SDXL pipelines together exceed 11GB at float16, so we never keep both on GPU simultaneously. Instead we swap on demand —
    calling use_base() or use_inpaint() before inference moves the active pipeline to GPU and offloads the other to CPU RAM. The swap costs ~2-4 seconds but prevents OOM entirely.
    """
    def __init__(self):
        self.base_pipeline: diffusers.StableDiffusionXLPipeline | None = None
        self.inpaint_pipeline: diffusers.StableDiffusionXLInpaintPipeline | None = None
        self.is_loaded = False
        self._active: str | None = None  # tracks which pipeline is currently on GPU
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        if self.device == "cpu":
            print("WARNING: No GPU detected. Inference will be extremely slow.")

    def load(self):
        print(f"Loading models on {self.device}...")

        # Base model — downloads from HuggingFace Hub on first run then caches to ~/.cache/huggingface. Subsequent starts are fast.
        print("Loading base model from HuggingFace Hub...")
        self.base_pipeline = diffusers.StableDiffusionXLPipeline.from_pretrained(
            BASE_MODEL_ID,
            torch_dtype=torch.float16,  # float16 is required for GPU VRAM efficiency
            use_safetensors=True,
            variant="fp16",
        )

        # Inpainting model — loaded from local .safetensors file (CivitAI download).
        # config= provides the architecture scaffold so from_single_file knows the exact UNet shape, avoiding the proj_in weight shape mismatch.
        print(f"Loading inpainting model from {INPAINT_MODEL_PATH}...")
        self.inpaint_pipeline = diffusers.StableDiffusionXLInpaintPipeline.from_single_file(
            INPAINT_MODEL_PATH,
            torch_dtype=torch.float16,
            use_safetensors=True,
            config="diffusers/stable-diffusion-xl-1.0-inpainting-0.1",
            low_cpu_mem_usage=False,
            ignore_mismatched_sizes=True,
        )

        self.inpaint_pipeline.enable_attention_slicing()

        self.is_loaded = True
        print("Both models loaded successfully.")

    # VRAM swap
    def use_base(self):
        """Offload inpaint pipeline to CPU, move base pipeline to GPU."""
        if self._active == "base":
            return  # already active, nothing to do

        if self.inpaint_pipeline is not None:
            self.inpaint_pipeline.to("cpu")

        torch.cuda.empty_cache()
        self.base_pipeline.to(self.device)
        self.base_pipeline.enable_attention_slicing()
        self.base_pipeline.enable_vae_slicing()
        self._active = "base"
        print("Swapped to base pipeline.")

    def use_inpaint(self):
        """Offload base pipeline to CPU, move inpaint pipeline to GPU."""
        if self._active == "inpaint":
            return  # already active, nothing to do

        if self.base_pipeline is not None:
            self.base_pipeline.to("cpu")

        torch.cuda.empty_cache()
        self.inpaint_pipeline.to(self.device)
        self._active = "inpaint"
        print("Swapped to inpaint pipeline.")

    # Sampler
    def set_sampler(self, pipeline, sampler_name: str):
        """
        Swaps the scheduler on a pipeline in-place. Diffusers pipelines use a scheduler (sampler) that can be swapped without reloading the model weights.
        """
        if sampler_name not in SAMPLERS:
            print(f"Unknown sampler '{sampler_name}', using default.")
            return

        scheduler_class_name, kwargs = SAMPLERS[sampler_name]

        # Dynamically import the scheduler class by name
        SchedulerClass = getattr(diffusers, scheduler_class_name)
        pipeline.scheduler = SchedulerClass.from_config(
            pipeline.scheduler.config,
            **kwargs
        )

    # Getters
    def get_base(self) -> diffusers.StableDiffusionXLPipeline:
        if not self.is_loaded:
            raise RuntimeError("Models not loaded. Call load() first.")
        return self.base_pipeline

    def get_inpaint(self) -> diffusers.StableDiffusionXLInpaintPipeline:
        if not self.is_loaded:
            raise RuntimeError("Models not loaded. Call load() first.")
        return self.inpaint_pipeline


# Module-level singleton — imported by routers
# Same pattern as versionStore on the frontend
model_manager = ModelManager()