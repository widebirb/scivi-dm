#!/bin/bash

set -e

# Usage check
if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: $0 <FRONTEND_URL> <CIVITAI_API_KEY>"
  exit 1
fi

FRONTEND_URL="$1"
CIVITAI_API_KEY="$2"

pip install huggingface_hub requests

cat > .env << EOF
USE_FAKE_INFERENCE=false
MODEL_PATH=/workspace/models
INPAINT_MODEL_PATH=/workspace/models/juggernaut-xl-inpainting.safetensors
FRONTEND_URL=$FRONTEND_URL
CIVITAI_API_KEY=$CIVITAI_API_KEY
EOF

pip install python-dotenv
python download_models.py
pip install -r requirements.txt