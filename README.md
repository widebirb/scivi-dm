# scivi-dm

A facial composite generation system. Supports text-to-image generation, inpainting with mask drawing, and full generation history.

---

## Project Structure

```
scivi-dm/
  backend/       # FastAPI — inference API
  frontend/      # React + Vite — UI
```

---

## Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 19, Vite 5, Tailwind CSS 3  |
| Canvas    | react-konva                       |
| Backend   | FastAPI, Uvicorn                  |
| Models    | JuggernautXL (diffusers)          |
| Deploy    | Vast.ai + Docker                  |

---

## Current State

### Done
- FastAPI backend with fake inference endpoints
  - `POST /generate` — text-to-image
  - `POST /inpaint` — inpainting with mask
  - `GET /health` — server + model status
- Fake inference which simulates real response shape, timing, and seed simulation 
- Mask dimension validation on inpaint endpoint
- Frontend scaffolded (Vite + React 18 + Tailwind v3 + react-konva)
- Frontend folder structure established

### In Progress
- React UI components (ParameterControl, CompositeCanvas, VersionControl)

### Pending
- Real JuggernautXL inference (Phase 3 — Vast.ai)
- Inpainting pipeline integration
- Dockerize + deployment
- Model auto-download script

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

## Roadmap

```
Phase 1 — Colab inference testing         [ skipped for now ]
Phase 2 — Fake backend + Full frontend    [ in progress ]
Phase 3 — Real model integration (Vast)   [ pending ]
Phase 4 — Containerize + Deploy           [ pending ]
Extra    — Prompt builder, serverless      [ if time allows ]
```