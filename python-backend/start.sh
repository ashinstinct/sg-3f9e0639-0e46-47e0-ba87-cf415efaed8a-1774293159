#!/bin/bash
set -e

# Backup start script - render.yaml now uses direct gunicorn command
# This file is kept for manual/local testing

PORT="${PORT:-5000}"

echo "Starting Back2Life.Studio audio processing server..."
echo "Backend endpoints: /health, /api/split-video, /api/convert-audio, /api/edit-audio"

exec gunicorn --bind "0.0.0.0:$PORT" \
  --workers 2 \
  --threads 4 \
  --timeout 300 \
  --log-level info \
  app:app