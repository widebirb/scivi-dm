# scivi-dm

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Final University project in fulfillment of Capstone 2. A facial composite generation system. Supports text-to-image generation, inpainting with mask drawing, allows accessibility with prompt maker and full generation history.

## Table of Contents
- [Features](#features)
- [Installation / Getting Started](#installation--getting-started)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [License](#license)

## Features 
- **Generation:** Text-to-image generation utilizing SDXL checkpoint model JuggernautXL.
- **Inpainting:** Deep integration of a painting canvas for masking exact regions to be re-drawn by the inference model.
- **History:** Generation history capturing snapshots of base64 images, parameters, branching chains, and immediate rollback.
- **Prompt Maker:** Modal interface for focused prompt building schemas for both generation and inpainting.
- **Fake and Real Inference Swapping:** Toggle between a simulated backend for rapid UI prototyping and real local/cloud diffusion inference.

## Installation / Getting Started

### Backend (For Fake Inference Testing)
A setup strictly for testing frontend features without GPU overhead. Requires Python 3.11.

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# Mac/Linux
source .venv/bin/activate
 
pip install fastapi uvicorn pillow pydantic python-dotenv
python -m uvicorn app.main:app --reload
```
> API runs at `http://localhost:8000`
> Interactive docs at `http://localhost:8000/docs`

### Backend (For Real Inference Testing)
Setup for full generation requiring GPU computing power.

```bash
cd backend
# Linux/Mac
chmod +x backend-setup.sh
./backend-setup.sh <FRONTEND_URL> <CIVITAI_API_KEY>

# Windows (Bash/WSL/Git Bash)
bash backend-setup.sh <FRONTEND_URL> <CIVITAI_API_KEY>

python -m uvicorn app.main:app --reload
```

### Frontend
> Requires Node.js 24+

```bash
cd frontend
npm install
npm run dev
```
> UI runs at `http://localhost:5173`

## Configuration

**Backend** — copy `.env.example` to `.env` in `backend/`:
```env
USE_FAKE_INFERENCE=true
MODEL_PATH=/workspace/models
INPAINT_MODEL_PATH=/workspace/models/juggernaut-xl-inpainting.safetensors
FRONTEND_URL=http://localhost:5173
CIVITAI_API_KEY=your_key_here
```

**Frontend** — create `.env` in `frontend/`:
```env
VITE_API_URL=http://localhost:8000
```

## API Reference

### POST `/generate`
```json
{
  "parameters": {
    "prompt": "a young woman, neutral expression",
    "negative_prompt": "blurry, deformed",
    "width": 512,
    "height": 512,
    "sampler": "DPM++ 2M Karras",
    "steps": 20,
    "cfg_scale": 7.0,
    "seed": -1
  }
}
```

### POST `/inpaint`
```json
{
  "image": "data:image/png;base64,...",
  "mask": "data:image/png;base64,...",
  "parameters": { "...": "same as above" },
  "inpaint_params": {
    "denoising_strength": 0.75,
    "mask_blur": 4
  }
}
```
> Mask format: grayscale PNG, **white = repaint**, **black = keep**. Must match image dimensions exactly.

### GET `/health`
```json
{
  "status": "ok",
  "mode": "fake",
  "models_loaded": false
}
```

## License 

### Project Code License
This project's original source code is released under the **MIT License**. You are free to use, modify, and distribute the code for both commercial and non-commercial purposes, provided that you include the original copyright notice.

### Open Source AI Models
This application integrates third-party, open-source AI models subject to varying licenses:
- **JuggernautXL v9** (Base Text-to-Image Generation)
  - Hosted at: [RunDiffusion/Juggernaut-XL-v9](https://huggingface.co/RunDiffusion/Juggernaut-XL-v9)
  - Governed by an Open RAIL++-M style license, which permits commercial use but prohibits the production of illegal or unethical content (e.g., non-consensual deepfakes, copyright-infringing content, etc.).
- **JuggernautXL Inpainting** (Inpainting Variant)
  - Sourced from [CivitAI](https://civitai.com/) (Model ID `456538`).
  - Usage must abide by both CivitAI's terms of service and the specific permissive open-source license provided by the model creator, disallowing generation of explicitly prohibited material.

### Core Open Source Dependencies
Key external libraries used under permissive licenses:
- **[diffusers](https://github.com/huggingface/diffusers)**, **[transformers](https://github.com/huggingface/transformers)**: Apache License 2.0
- **FastAPI**, **React**, **Vite**: MIT License

### Credits
Thank you to Egorpolyakov (https://www.flaticon.com/authors/egorpolyakov) for the favicon
