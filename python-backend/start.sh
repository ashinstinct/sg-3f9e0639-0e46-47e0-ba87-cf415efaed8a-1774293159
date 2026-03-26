#!/bin/bash
set -e

# Get PORT from environment or default to 10000 (Render's default)
PORT="${PORT:-10000}"

echo "Starting Back2Life.Studio audio processing server on port $PORT..."
echo "Backend endpoints available:"
echo "  - GET  /health"
echo "  - POST /api/split-video"
echo "  - POST /api/convert-audio"
echo "  - POST /api/edit-audio"

# Start Gunicorn with optimized settings for Render
exec gunicorn --bind "0.0.0.0:$PORT" \
  --workers 2 \
  --threads 4 \
  --timeout 300 \
  --keepalive 5 \
  --log-level info \
  --access-logfile - \
  --error-logfile - \
  app:app