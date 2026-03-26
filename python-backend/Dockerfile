FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies including FFmpeg
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (Render will set $PORT env variable)
EXPOSE 10000

# Use Gunicorn directly - Render sets $PORT automatically
CMD gunicorn --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 300 --log-level info app:app