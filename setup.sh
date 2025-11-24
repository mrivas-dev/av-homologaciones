#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting clean installation..."

# Navigate to project root
cd "$(dirname "$0")"

# Clean up frontend
echo "🧹 Cleaning up frontend..."
rm -rf frontend/node_modules frontend/.next frontend/package-lock.json

# Clean up backend
echo "🧹 Cleaning up backend..."
rm -f backend/deno.lock

# Clear Deno cache
echo "🔄 Clearing Deno cache..."
if command -v deno &> /dev/null; then
    deno cache --reload /dev/null
else
    echo "⚠️  Deno not found. Please install Deno to continue."
    exit 1
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "✨ Installation complete!"
echo ""
echo "To start the application, run:"
echo "  npm run dev"
echo ""
echo "The application will be available at:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:4000"
echo ""
echo "Happy coding! 🚀"
