# SimeonShop.rs Makefile - Build & Development Commands

.PHONY: help install frontend-install backend-install dev frontend-dev backend-dev build frontend-build backend-build clean

help:
	@echo "SimeonShop.rs - Available Commands"
	@echo "===================================="
	@echo ""
	@echo "Installation:"
	@echo "  make install              - Install all dependencies"
	@echo "  make frontend-install     - Install frontend dependencies"
	@echo "  make backend-install      - Install backend dependencies"
	@echo ""
	@echo "Development:"
	@echo "  make dev                  - Start both frontend and backend"
	@echo "  make frontend-dev         - Start frontend only (port 3000)"
	@echo "  make backend-dev          - Start backend only (port 8000)"
	@echo ""
	@echo "Build:"
	@echo "  make build                - Build both applications"
	@echo "  make frontend-build       - Build frontend for production"
	@echo "  make backend-build        - Prepare backend for production"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean                - Clean build artifacts and caches"
	@echo ""

# Installation targets
install: frontend-install backend-install
	@echo "✅ All dependencies installed!"

frontend-install:
	@echo "📦 Installing frontend dependencies..."
	cd apps/web && npm install
	@echo "✅ Frontend dependencies installed!"

backend-install:
	@echo "📦 Installing backend dependencies..."
	cd apps/api && python -m pip install -r requirements.txt
	@echo "✅ Backend dependencies installed!"

# Development targets
dev:
	@echo "🚀 Starting SimeonShop.rs (Frontend & Backend)..."
	@echo "Frontend will run on: http://localhost:3000"
	@echo "Backend will run on:  http://localhost:8000"
	@echo "API Docs at:          http://localhost:8000/api/docs"
	@echo ""
	@echo "Press Ctrl+C to stop"
	@echo ""
	@cd apps/web && npm run dev & \
	cd apps/api && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

frontend-dev:
	@echo "🚀 Starting frontend development server..."
	@echo "Frontend running on: http://localhost:3000"
	cd apps/web && npm run dev

backend-dev:
	@echo "🚀 Starting backend development server..."
	@echo "API running on: http://localhost:8000"
	@echo "API Docs at:    http://localhost:8000/api/docs"
	cd apps/api && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Build targets
build: frontend-build
	@echo "✅ Build complete!"

frontend-build:
	@echo "🔨 Building frontend for production..."
	cd apps/web && npm run build
	@echo "✅ Frontend built successfully!"

backend-build:
	@echo "🔨 Preparing backend for production..."
	cd apps/api && pip install -r requirements.txt
	@echo "✅ Backend ready for production!"

# Cleanup targets
clean:
	@echo "🧹 Cleaning build artifacts..."
	cd apps/web && rm -rf .next dist build node_modules/.cache
	cd apps/api && find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	@echo "✅ Cleanup complete!"
