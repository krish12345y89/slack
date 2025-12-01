#!/bin/bash

# Enterprise Chat Frontend - Installation Script
# This script sets up and starts the React frontend

set -e

echo "🚀 Enterprise Chat Frontend Setup"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Change to frontend directory
cd "$(dirname "$0")"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Dependencies installed successfully"
echo ""

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
VITE_APP_NAME=Enterprise Chat
VITE_APP_VERSION=1.0.0
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Make sure the backend is running on http://localhost:3000"
echo "   2. Run: npm run dev"
echo "   3. Open http://localhost:5173 in your browser"
echo ""
echo "📚 Available commands:"
echo "   npm run dev      - Start development server"
echo "   npm run build    - Build for production"
echo "   npm run lint     - Run ESLint"
echo "   npm run preview  - Preview production build"
echo ""
