#!/bin/bash
set -e

# Get PORT from environment or default to 5000
PORT="${PORT:-5000}"

echo "Starting server on port $PORT..."

# Start Gunicorn with the PORT variable properly expanded
exec gunicorn --bind "0.0.0.0:$PORT" --workers 1 --threads 2 --timeout 300 --log-level info app:app