# Getting Started - SimeonShop.rs Development

Complete guide for setting up and running SimeonShop.rs locally.

## 📋 Prerequisites

Before starting, ensure you have installed:

### For Frontend Development
- **Node.js** 18.x or higher: [Download](https://nodejs.org/)
- **npm** 9.x or higher (comes with Node.js)

### For Backend Development
- **Python** 3.10 or higher: [Download](https://www.python.org/)
- **pip** (comes with Python)

### For All Development
- **Git**: [Download](https://git-scm.com/)

### Optional - For Docker Development
- **Docker**: [Download](https://www.docker.com/)
- **Docker Compose**: [Download](https://docs.docker.com/compose/)

## ✅ Verify Installation

```bash
# Check Node.js and npm
node --version
npm --version

# Check Python
python --version
# or
python3 --version

# Check Git
git --version
```

## 🚀 Quick Start (5 minutes)

### Option 1: Traditional Setup (No Docker)

#### Start Backend (Terminal 1)
```bash
cd apps/api

# Create virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
python app/main.py
```

Backend will be available at: `http://localhost:8000`
API Documentation: `http://localhost:8000/api/docs`

#### Start Frontend (Terminal 2)
```bash
cd apps/web

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will be available at: `http://localhost:3000`

### Option 2: Docker Setup (Recommended)

```bash
# From project root
docker-compose up

# Or in background:
docker-compose up -d
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- API Docs: `http://localhost:8000/api/docs`

Stop services:
```bash
docker-compose down
```

### Option 3: Using Make Commands

```bash
# Install all dependencies
make install

# Start both services
make dev

# Or individually:
make frontend-dev    # Terminal 1
make backend-dev     # Terminal 2
```

## 🧪 Testing the Setup

### Frontend Health Check
Open `http://localhost:3000` in browser. You should see:
- SimeonShop.rs homepage
- Navigation menu
- "API Status: ✓ Online" or "✗ Offline"

### Backend Health Check
```bash
# Direct URL test
curl http://localhost:8000/api/v1/health

# Should return:
# {
#   "status": "ok",
#   "message": "SimeonShop.rs API is running",
#   "version": "1.0.0"
# }
```

### API Documentation
Open `http://localhost:8000/api/docs` to test API endpoints interactively.

## 📝 Environment Configuration

### Frontend - Check .env.local
```bash
cd apps/web
cat .env.local
# Should show:
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Backend - Check .env
```bash
cd apps/api
cat .env
# Should show:
# ENVIRONMENT=development
# ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
# HOST=0.0.0.0
# PORT=8000
```

If missing, copy from examples:
```bash
cd apps/web && cp .env.example .env.local
cd apps/api && cp .env.example .env
```

## 🗂️ Project Structure Overview

```
simeonshop/
├── apps/
│   ├── web/                # Frontend (Next.js)
│   │   ├── pages/         # All 8 main pages + admin pages
│   │   ├── components/    # Reusable React components
│   │   ├── styles/        # Global CSS
│   │   ├── package.json   # npm dependencies
│   │   └── .env.local     # Local environment
│   │
│   └── api/               # Backend (FastAPI)
│       ├── app/
│       │   ├── main.py    # FastAPI app
│       │   ├── core/      # Configuration
│       │   └── api/v1/    # API routes
│       ├── requirements.txt
│       └── .env           # Local environment
│
├── README.md              # Main documentation
├── AGENTS.md             # CI/CD & automation
├── Makefile              # Build commands
├── docker-compose.yml    # Docker orchestration
└── .gitignore            # Git rules
```

## 📚 Available Routes

### Frontend Pages (8 main + 2 admin)
| URL | Page | Description |
|-----|------|-------------|
| `/` | Homepage | Landing page with overview |
| `/products` | Products | Product catalog |
| `/cart` | Cart | Shopping cart |
| `/checkout` | Checkout | Order checkout |
| `/about` | About | Company information |
| `/contact` | Contact | Contact form |
| `/privacy-policy` | Privacy | Privacy policy |
| `/terms-and-conditions` | Terms | Terms & conditions |
| `/admin/login` | Admin Login | Admin authentication |
| `/admin/dashboard` | Dashboard | Admin panel |

### Backend API Endpoints (v1)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/products` | List products |
| GET | `/api/v1/products/{id}` | Get product |
| POST | `/api/v1/orders` | Create order |
| POST | `/api/v1/admin/login` | Admin login |

### Documentation Endpoints
| URL | Purpose |
|-----|---------|
| `/api/docs` | Swagger UI |
| `/api/redoc` | ReDoc documentation |
| `/api/openapi.json` | OpenAPI spec |

## 🔧 Common Commands

### Frontend Development
```bash
cd apps/web

npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run linter
npm run type-check       # Check types
```

### Backend Development
```bash
cd apps/api

# With venv activated:
python app/main.py                      # Start server
uvicorn app.main:app --reload           # With auto-reload
python -m pytest                        # Run tests (when available)
```

### From Root Directory
```bash
make help                # Show all available commands
make install             # Install all dependencies
make dev                 # Start frontend + backend
make build               # Build for production
make clean               # Clean build artifacts
```

## 🐛 Troubleshooting

### Frontend won't start
```bash
cd apps/web

# Clear cache
rm -rf .next node_modules

# Reinstall
npm install
npm run dev
```

### Backend won't start
```bash
cd apps/api

# Activate venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Reinstall
pip install -r requirements.txt
python app/main.py
```

### Port already in use
```bash
# Frontend on different port
cd apps/web && npm run dev -- -p 3001

# Backend on different port
cd apps/api && python app/main.py --port 8001
```

### API connection issues
1. Ensure backend is running on `http://localhost:8000`
2. Check `.env.local` in frontend has correct `NEXT_PUBLIC_API_BASE_URL`
3. Check `.env` in backend has correct CORS origins
4. Restart both services

### Python virtual environment issues
```bash
# Remove old venv
rm -rf apps/api/venv

# Create new one
cd apps/api
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

## 📖 Documentation Files

- **[README.md](../README.md)** - Main project documentation
- **[AGENTS.md](../AGENTS.md)** - CI/CD and automation
- **[apps/web/README.md](../apps/web/README.md)** - Frontend documentation
- **[apps/api/README.md](../apps/api/README.md)** - Backend documentation
- **[Makefile](../Makefile)** - Build and development commands

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and test locally
3. Commit with clear messages: `git commit -m "feat: add feature description"`
4. Push to GitHub: `git push origin feature/my-feature`
5. Create Pull Request

## ❓ Need Help?

1. Check documentation in README files
2. Review API docs at `http://localhost:8000/api/docs`
3. Check error messages in terminal
4. Review troubleshooting section above
5. Create GitHub issue with details

---

**Happy Coding! 🚀**

Last Updated: January 2024
