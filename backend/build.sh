#!/bin/bash

echo "🚀 Starting Render build process..."

# Install core dependencies first
echo "📦 Installing core dependencies..."
pip install -r requirements.txt

# Try to install AI packages separately
echo "🤖 Installing AI packages..."
pip install -r requirements-ai.txt || echo "⚠️ Some AI packages failed, will use fallbacks"

# Run startup script
echo "🔧 Running startup configuration..."
python startup.py || echo "⚠️ Startup script failed, continuing..."

echo "✅ Build complete!"