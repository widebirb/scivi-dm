# scivi-dm

A facial composite generation system. Supports text-to-image generation, inpainting with mask drawing, and full generation history.

---

## Project Structure

```
scivi-dm/
  docker-compose.yml
 
  backend/
    app/
      models/
        schemas.py            # Pydantic request/response models
      services/
        fake_inference.py     # Simulated inference (USE_FAKE_INFERENCE=true)
        real_inference.py     # Real diffusers pipeline calls
        model_manager.py      # Loads and holds both pipelines (singleton)
        image_processor.py    # Base64 utils, mask blur
      routers/
        generate.py           # POST /generate
        inpaint.py            # POST /inpaint
        health.py             # GET /health
      main.py                 # FastAPI app entry, lifespan model loading
    Dockerfile
    requirements.txt
    download_models.py        # Run once on Vast.ai to download models
    .env.example
 
  frontend/
    src/
      api/
        client.js              # Axios instance + endpoint functions
      components/
        controls/
          ParameterControl.jsx    # Generation parameters UI
          InpaintParameters.jsx   # Denoising strength + mask blur
        canvas/
          CompositeCanvas.jsx     # Image display and mask drawing
        history/
          VersionControl.jsx      # Generation history panel
        promptbuilder/
          PromptBuilder.jsx       # Modal wrapper and mode toggle
          GenerationMode.jsx      # Chunked generation prompt maker 
          InpaintingMode.jsx      # Inpainting-specific prompt maker 
        Header.jsx                # App header + navigation + theme toggle
        Footer.jsx                # Keyboard shortcuts + version label
        StatusBar.jsx             # Backend health indicator
        GeneratingOverlay.jsx     # Loading state over canvas
      context/
        ThemeContext.jsx          # Theme provider
      hooks/
        useGeneration.js      # Core hook: params, API calls, saving
        useVersions.js        # React interface over version store
        useHealth.js          # Backend status polling
      pages/
        GuidePage.jsx         
        AboutPage.jsx          
      store/
        versionStore.js       # In-memory version history (singleton)
      App.jsx
    Dockerfile
    nginx.conf
```
---

## Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, Vite 5, Tailwind CSS 3  |
| Canvas    | react-konva, use-image            |
| Backend   | FastAPI, Uvicorn, Pillow          |
| Models    | JuggernautXL (diffusers)          |
| Deploy    | Vast.ai + Docker                  |

---

## Current State
### Phase 2 - Complete
- FastAPI backend with fake inference endpoints
  - `POST /generate` — text-to-image
  - `POST /inpaint` — inpainting with mask
  - `GET /health` — server + model status
- Fake inference simulates real response shape, timing, and seed determinism
- Mask dimension validation on inpaint endpoint
- Full React frontend
  - Generation parameters 
  - Inpainting parameters
  - Canvas with paint/erase brush,
  - Version history with thumbnails, expandable parameters, rollback
  - Loading overlay with elapsed timer
 
### ✅ Phase 3 - Complete
- Real inference code written locally
  - `model_manager.py` — loads JuggernautXL base (HuggingFace) + inpainting (CivitAI) pipelines
  - `real_inference.py` — diffusers pipeline calls for txt2img and inpainting
  - Routers switch between fake/real via `USE_FAKE_INFERENCE` env var
  - Model loading happens at startup via FastAPI lifespan
- `download_models.py` — downloads both models to `/workspace/models` on Vast.ai
- Dockerfile + docker-compose written and build-tested locally (16 min first build)
- Two-stage frontend build (Node builder → nginx:alpine)
 
### ✅ UI Enhancement - Complete
- Three-column layout: generation params (left) · canvas + history (center) · inpaint options (right)
- Header with app name, Guide + About navigation, theme toggle
- Footer with something
- Tooltips on all parameter controls
- Guide and About pages
 
### ✅ UX(?) Enhancement (Prompt Maker) - Complete
- Modal popup accessible via **✦ prompt builder** button in the left sidebar
- **Generation mode** — 6 chunked sections mapping to SD's 75-token attention windows
- **Inpainting mode** — focused prompt builder for masked region edits

### ⬜ Vast.ai Testing phase
- Rent Vast.ai instance
- Run `download_models.py` to download models
- `docker-compose up` and confirm real inference works end to end

## Setup

### Backend ( fake inference, no GPU needed )

> Requires Python 3.11

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
 
> Do NOT run `pip install -r requirements.txt` locally, it includes torch and diffusers
> which are only needed in the container.
 
API runs at `http://localhost:8000`
Interactive docs at `http://localhost:8000/docs`

### Frontend

> Requires Node.js 24+

```bash
cd frontend
npm install
npm run dev
```

UI runs at `http://localhost:5173`

Create `frontend/.env`:
```
VITE_API_URL=http://localhost:8000
```

---

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

---

## Version Control

No database. Each generation saves a JSON snapshot of:
- Output image (base64), full parameters used, timestamp, parent version ID (tracks branching chain)
---

## Environment Variables
 
**Backend** — copy `.env.example` to `.env` in `backend/`:
 
```
USE_FAKE_INFERENCE=true
MODEL_PATH=/models
INPAINT_MODEL_PATH=/models/juggernaut-xl-inpainting.safetensors
```

**Frontend** — create `.env` in `frontend/`:

```
VITE_API_URL=http://localhost:8000
```

---
 
## Models
 
| Model | Source | Purpose |
|-------|--------|---------|
| JuggernautXL v9 | HuggingFace — `RunDiffusion/Juggernaut-XL-v9` | Text-to-image generation |
| JuggernautXL Inpainting | CivitAI — model ID 456538 | Inpainting (fine-tuned) |
 
The inpainting model is a separate fine-tuned variant for better seam quality. Using the base model for inpainting produces visible style mismatches between painted and original regions.
 
---

## Roadmap

```
Phase 1 — Colab inference testing         [ skipped ]
Phase 2 — Fake backend + Full frontend    [ done ]
Phase 3 — Real inference code + Docker    [ code done ]
Phase 4 — Deploy + validate on Vast.ai    [ pending ]
UI Revamp                                 [ done ]
Prompt Builder                            [ done ]
Serverless                                [ low priority ]
```