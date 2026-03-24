#!/bin/bash

# Get PORT from environment or default to 5000
PORT=${PORT:-5000}

echo "Starting server on port $PORT..."

# Start Gunicorn with the port
gunicorn --bind 0.0.0.0:$PORT --workers 2 --timeout 300 --log-level info app:app