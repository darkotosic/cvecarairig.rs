# Quick Reference - SimeonShop.rs

Brz pregled komandi i važnih informacija.

## 🚀 Start Services (3 načina)

### 1. Make Commands (Preporučeno)
```bash
make dev                # Start oba servisa
make frontend-dev       # Terminal 1: Frontend (port 3000)
make backend-dev        # Terminal 2: Backend (port 8000)
make install            # Instaliraj sve zavisnosti
make build              # Build za production
make clean              # Očisti build fajlove
```

### 2. Manual Setup
```bash
# Frontend (Terminal 1)
cd apps/web
npm install
npm run dev

# Backend (Terminal 2)
cd apps/api
python -m venv venv
source venv/bin/activate    # ili venv\Scripts\activate na Windows
pip install -r requirements.txt
python app/main.py
```

### 3. Docker Setup
```bash
docker-compose up              # Start sve servise
docker-compose up -d           # Start u background
docker-compose down            # Stop sve servise
docker-compose logs -f         # Prati logove
```

## 🌐 Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Web aplikacija |
| Backend | http://localhost:8000 | API server |
| API Docs | http://localhost:8000/api/docs | Swagger UI |
| API ReDoc | http://localhost:8000/api/redoc | ReDoc docs |

## 📁 Key Directories

```
simeonshop/
├── apps/web/                  # Frontend (Next.js)
│   ├── pages/                # React stranice
│   ├── components/           # React komponente
│   ├── styles/              # CSS fajlovi
│   └── package.json         # npm zavisnosti
│
├── apps/api/                 # Backend (FastAPI)
│   ├── app/
│   │   ├── main.py          # FastAPI app
│   │   ├── core/config.py   # Settings
│   │   └── api/v1/router.py # Endpoints
│   └── requirements.txt      # Python zavisnosti
│
└── docs/
    ├── README.md                 # Main docs
    ├── GETTING_STARTED.md        # Setup guide
    ├── DEPLOYMENT.md             # Deployment
    └── DEVELOPMENT_CHECKLIST.md  # Progress tracker
```

## 🛠️ Common Commands

### Frontend Commands
```bash
cd apps/web

npm run dev              # Development server
npm run build            # Build za production
npm start                # Production server
npm run lint             # Lint kodu
npm run type-check       # Type checking
```

### Backend Commands
```bash
cd apps/api

# With venv activated:
python app/main.py                      # Start server
uvicorn app.main:app --reload           # With auto-reload
uvicorn app.main:app --host 0.0.0.0     # Bind all interfaces
```

## 🔧 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Backend (.env)
```env
ENVIRONMENT=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
HOST=0.0.0.0
PORT=8000
```

## 📍 Frontend Routes

```
/                          - Homepage
/products                  - Products listing
/cart                      - Shopping cart
/checkout                  - Checkout page
/about                     - About page
/contact                   - Contact page
/privacy-policy            - Privacy policy
/terms-and-conditions      - Terms & conditions
/admin/login               - Admin login
/admin/dashboard           - Admin dashboard
```

## 📍 Backend API Routes

```
GET  /api/v1/health              - Health check
GET  /api/v1/products            - All products
GET  /api/v1/products/{id}       - Single product
POST /api/v1/orders              - Create order
POST /api/v1/admin/login         - Admin login
GET  /api/docs                   - Swagger UI
GET  /api/redoc                  - ReDoc
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :8000
kill -9 <PID>
```

### Frontend Build Error
```bash
cd apps/web
rm -rf .next node_modules
npm install
npm run dev
```

### Backend Import Error
```bash
cd apps/api
source venv/bin/activate
pip install -r requirements.txt
python app/main.py
```

### CORS Error
- Check `.env` file has correct `ALLOWED_ORIGINS`
- Ensure frontend URL is in the list
- Restart backend server

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| README.md | Main documentation |
| GETTING_STARTED.md | Setup instructions |
| DEPLOYMENT.md | Production deployment |
| AGENTS.md | CI/CD & automation |
| PROJECT_SUMMARY.md | Project overview |
| DEVELOPMENT_CHECKLIST.md | Progress tracking |
| apps/web/README.md | Frontend documentation |
| apps/api/README.md | Backend documentation |

## 🔍 API Testing

### Using curl
```bash
# Health check
curl http://localhost:8000/api/v1/health

# Get products
curl http://localhost:8000/api/v1/products

# Get single product
curl http://localhost:8000/api/v1/products/1
```

### Using Swagger UI
Visit: http://localhost:8000/api/docs

### Using Postman
1. Import OpenAPI: http://localhost:8000/api/openapi.json
2. Create requests and test

## 📦 Install Dependencies

### Frontend
```bash
cd apps/web
npm install package-name
npm list                  # Show all dependencies
npm update               # Update dependencies
```

### Backend
```bash
cd apps/api
source venv/bin/activate
pip install package-name
pip freeze > requirements.txt
```

## 🚀 Build for Production

### Frontend
```bash
cd apps/web
npm run build
# Output: .next/ directory
```

### Backend
```bash
cd apps/api
pip install -r requirements.txt
# Ready for deployment
```

## 🐳 Docker Commands

```bash
# Build images
docker-compose build

# Start services
docker-compose up

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart service
docker-compose restart web

# Remove containers and volumes
docker-compose down -v
```

## 📊 Project Statistics

- **Frontend Pages**: 10 (8 public + 2 admin)
- **Frontend Components**: Reusable UI components
- **Backend Endpoints**: 6 operational + docs
- **Configuration Files**: 15+
- **Documentation Files**: 8
- **GitHub Workflows**: 2 CI/CD

## 🎯 First Week Goals

1. ✅ Monorepo setup complete
2. ✅ Frontend & backend scaffolding
3. ✅ Documentation created
4. Next: Local development & testing
5. Next: Database integration
6. Next: User authentication

## 💡 Tips & Tricks

### Speed Up Development
```bash
# Watch mode for frontend
npm run dev

# Watch mode for backend
uvicorn app.main:app --reload

# Use Make commands for everything
make <command>
```

### Debugging
```bash
# Frontend: Use browser DevTools
# Open http://localhost:3000 and press F12

# Backend: Check API docs
# Open http://localhost:8000/api/docs
```

### Code Quality
```bash
# Format code (frontend)
npm run lint

# Type checking (frontend)
npm run type-check

# Format code (backend)
black app/
```

## 🔗 Useful Links

- Next.js Docs: https://nextjs.org/docs
- FastAPI Docs: https://fastapi.tiangolo.com
- Tailwind CSS: https://tailwindcss.com/docs
- TypeScript: https://www.typescriptlang.org/docs/
- Python: https://docs.python.org/3/
- Docker: https://docs.docker.com
- Git: https://git-scm.com/doc

## 📞 Quick Help

```bash
# Show all available commands
make help

# Show file structure
tree -L 2 apps/

# Count lines of code
find apps -name "*.tsx" -o -name "*.py" | xargs wc -l

# List all API endpoints
curl -s http://localhost:8000/api/openapi.json | grep "operationId"
```

---

**Last Updated**: January 2024
**Quick Reference Version**: 1.0
