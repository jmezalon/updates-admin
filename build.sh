#!/bin/bash

# Render build script for updates-admin
echo "Starting build process..."

# Install all dependencies (including dev dependencies)
echo "Installing dependencies..."
npm ci --include=dev

# Verify vite is installed
echo "Checking if vite is available..."
npx vite --version

# Build the project
echo "Building the project..."
npm run build

echo "Build completed successfully!"
