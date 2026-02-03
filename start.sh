#!/bin/bash

# Quick Start Script for Book Analyzer
# This script helps you get started quickly

echo "======================================"
echo "🚀 Book Analyzer - Quick Start"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -d "mcp-server" ]; then
    echo "❌ Error: Please run this script from the book-analyzer-project directory"
    exit 1
fi

# Step 1: Check Node.js
echo "Step 1: Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✓ Node.js installed: $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install Node.js 18+ first"
    echo "   Visit: https://nodejs.org/"
    exit 1
fi
echo ""

# Step 2: Check .env file
echo "Step 2: Checking configuration..."
cd mcp-server

if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found"
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env and add your API keys:"
    echo "   - ANTHROPIC_API_KEY (or OPENAI_API_KEY)"
    echo "   - OPENAI_API_KEY (for TTS)"
    echo ""
    echo "Run: nano .env"
    echo ""
    read -p "Press Enter when you've added your API keys..."
fi

# Check if API keys are set
if grep -q "your_.*_key_here" .env; then
    echo "⚠️  WARNING: API keys not configured in .env"
    echo "Please edit .env and add your actual API keys"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✓ .env file configured"
fi
echo ""

# Step 3: Install dependencies
echo "Step 3: Installing dependencies..."
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm packages..."
    npm install
    if [ $? -eq 0 ]; then
        echo "✓ Dependencies installed"
    else
        echo "❌ Failed to install dependencies"
        exit 1
    fi
else
    echo "✓ Dependencies already installed"
fi
echo ""

# Step 4: Create output directory
echo "Step 4: Creating output directory..."
mkdir -p output/audio
echo "✓ Output directory created"
echo ""

# Step 5: Start server
echo "Step 5: Starting MCP Server..."
echo ""
echo "======================================"
echo "🎉 Setup Complete!"
echo "======================================"
echo ""
echo "The MCP Server will start now."
echo "Press Ctrl+C to stop the server."
echo ""
echo "To test the server, open another terminal and run:"
echo "  cd book-analyzer-project"
echo "  ./test.sh \"Atomic Habits\""
echo ""
echo "======================================"
echo ""

# Start the server
npm start