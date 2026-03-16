# Using the official PyTorch image as base — it comes with CUDA,
# cuDNN, and torch pre-installed. This is significantly faster than
# installing torch from scratch in a plain Python image.
# cu124 = CUDA 12.4, which covers most current Vast.ai GPU instances.
FROM pytorch/pytorch:2.4.0-cuda12.4-cudnn9-runtime

WORKDIR /app

# Install system dependencies
# libgl1 and libglib2.0 are required by Pillow for image processing
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
# Copying requirements first so Docker can cache this layer.
# If requirements.txt doesn't change, this layer is reused on rebuild.
COPY requirements.txt .

# torch is already in the base image so we skip it to avoid
# reinstalling a 2GB package. Everything else installs normally.
RUN pip install --no-cache-dir -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cu124

# Copy application code
COPY app/ ./app/

# Expose the API port
EXPOSE 8000

# Start the server
# Workers=1 is intentional — diffusers pipelines are not thread-safe.
# Multiple workers would try to share GPU memory and crash.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]