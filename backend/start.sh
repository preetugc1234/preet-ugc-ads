#!/bin/bash

echo "🚀 Starting UGC AI Backend..."

# Use gunicorn instead of uvicorn
echo "📦 Using gunicorn (no compilation required)"
gunicorn main:app -c gunicorn.conf.py

# Fallback to Python if gunicorn fails
if [ $? -ne 0 ]; then
    echo "⚠️ Gunicorn failed, using Python fallback"
    python main.py
fi