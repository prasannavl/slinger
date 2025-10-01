#!/bin/bash

# Quick start script for Slinger

echo "🎯 Slinger - AI-Powered Crypto Trading Platform"
echo "================================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please edit it with your API keys before running."
    echo ""
fi

echo "📦 Caching Deno dependencies..."
deno cache --reload main.ts dev.ts

echo ""
echo "✅ Dependencies cached!"
echo ""
echo "To start the development server, run:"
echo "  deno task start"
echo ""
echo "The app will be available at http://localhost:8000"
echo ""
