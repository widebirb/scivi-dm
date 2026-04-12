"""
download_models.py

Run this ONCE on Vast.ai before starting the backend container.
Models are saved to /workspace/models which is mounted as a volume
so they persist across container restarts.

Usage:
    python download_models.py

Requirements:
    pip install huggingface_hub requests
"""

import os
import sys
import requests
from pathlib import Path
from huggingface_hub import snapshot_download

from dotenv import load_dotenv
load_dotenv()

MODELS_DIR = Path(os.getenv("MODEL_PATH", "/workspace/models"))
MODELS_DIR.mkdir(parents=True, exist_ok=True)

CIVITAI_API_KEY = os.getenv("CIVITAI_API_KEY", "API_KEY")

CIVITAI_INPAINT_URL = (
    "https://civitai.com/api/download/models/456538"
    "?type=Model&format=SafeTensor&size=pruned&fp=fp16"
)
INPAINT_FILENAME = "juggernaut-xl-inpainting.safetensors"


def download_base_model():
    print("Downloading JuggernautXL base model from HuggingFace Hub...")
    print("This will be cached to ~/.cache/huggingface and reused on future runs.")

    snapshot_download(
        repo_id="RunDiffusion/Juggernaut-XL-v9",
        local_dir=MODELS_DIR / "juggernaut-xl-base",
        ignore_patterns=["*.msgpack", "*.bin"],  # prefer safetensors
    )
    print("Base model downloaded.")


def download_inpaint_model():
    if CIVITAI_API_KEY == "API_KEY":
        print("ERROR: CIVITAI_API_KEY is not set.")
        print("Replace 'API_KEY' in this file or set the env var:")
        print("  export CIVITAI_API_KEY='API_KEY'")
        sys.exit(1)

    output_path = MODELS_DIR / INPAINT_FILENAME

    if output_path.exists():
        print(f"Inpainting model already exists at {output_path}, skipping.")
        return

    print(f"Downloading inpainting model from CivitAI to {output_path}...")

    headers = {"Authorization": f"Bearer {CIVITAI_API_KEY}"}

    # Stream download so large files don't blow RAM
    response = requests.get(CIVITAI_INPAINT_URL, headers=headers, stream=True)

    if response.status_code == 401:
        print("ERROR: CivitAI API key is invalid or expired.")
        sys.exit(1)

    response.raise_for_status()

    total = int(response.headers.get("content-length", 0))
    downloaded = 0

    with open(output_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
            downloaded += len(chunk)
            if total:
                pct = downloaded / total * 100
                print(f"\r  {pct:.1f}% ({downloaded / 1e9:.2f} GB)", end="", flush=True)

    print(f"\nInpainting model downloaded to {output_path}")


if __name__ == "__main__":
    print(f"Saving models to {MODELS_DIR}\n")
    download_base_model()
    download_inpaint_model()
    print("\nAll models ready.")