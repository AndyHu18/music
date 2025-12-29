# Python 3.11 with FFmpeg
FROM python:3.11-slim

# Install FFmpeg
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for caching
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy frontend code
COPY frontend/ ./frontend/

# Railway uses PORT env variable
ENV PORT=8000

# Expose port
EXPOSE $PORT

# Start command - use shell form to expand $PORT
CMD uvicorn backend.main:app --host 0.0.0.0 --port $PORT
