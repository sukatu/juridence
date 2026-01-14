#!/bin/bash
# Startup script for Render deployment

# Start the FastAPI server
exec uvicorn main:app --host 0.0.0.0 --port $PORT
