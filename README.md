# scivi-dm

A facial composite generation system. Supports text-to-image generation, inpainting with mask drawing, and full generation history.

---

## Project Structure

```
scivi-dm/
  backend/
    app/
      models/
        schemas.py          # Pydantic request/response models
      services/
        fake_inference.py   # Simulated inference (Phase 2)
        image_processor.py  # Base64 utils, mask blur
      routers/
        generate.py         # POST /generate
        inpaint.py          # POST /inpaint
        health.py           # GET /health
      main.py               # FastAPI app entry
    requirements.txt
    .env.example

  frontend/
    src/
      api/
        client.js           # Axios instance + endpoint functions
      components/
        controls/
          ParameterControl.jsx    # Generation parameters UI
          InpaintParameters.jsx   # Denoising strength + mask blur
        canvas/
          CompositeCanvas.jsx     # Image display + mask drawing
        history/
          VersionControl.jsx      # Generation history panel
        StatusBar.jsx             # Backend health indicator
        GeneratingOverlay.jsx     # Loading state over canvas
      hooks/
        useGeneration.js    # Core hook (params, API calls, saving)
        useVersions.js      # React interface over version store
        useHealth.js        # Backend status polling
      store/
        versionStore.js     # In-memory version history (singleton)
      App.jsx
```

---

## Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, Vite 5, Tailwind CSS 3  |
| Canvas    | react-konva, use-image            |
| Backend   | FastAPI, Uvicorn, Pillow          |
| Models    | JuggernautXL (diffusers)          |

---

## Setup

### Backend

> Requires Python 3.11

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# Mac/Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

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
```

**Frontend** — create `.env` in `frontend/`:

```
VITE_API_URL=http://localhost:8000
```

---

## Roadmap

```
Phase 1 — Colab inference testing         [ skipped for now ]
Phase 2 — Fake backend + Full frontend    [ done ]
Phase 3 — Real model integration (Vast)   [ pending ]
Phase 4 — Containerize + Deploy           [ pending ]
Extra   — Prompt builder, serverless      [ if motivated ]
```