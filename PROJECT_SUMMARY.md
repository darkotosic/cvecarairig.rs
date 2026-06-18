# Project Summary - SimeonShop.rs

## 🎯 Project Overview

**SimeonShop.rs** je enterprise-ready e-commerce monorepo platforma sa modernom Next.js frontend aplikacijom i FastAPI backend servisom.

## 📦 What's Included

### Frontend Application (Next.js + TypeScript + Tailwind CSS)

Located in: `apps/web/`

#### Pages (10 total)
- **Public Pages:**
  - `/` - Homepage sa pregledom
  - `/products` - Katalog proizvoda (grid sa 6 proizvoda)
  - `/cart` - Korpa sa order summary
  - `/checkout` - Checkout forma sa validacijom
  - `/about` - O nama stranica
  - `/contact` - Kontakt forma
  - `/privacy-policy` - Politika privatnosti
  - `/terms-and-conditions` - Uslovi korišćenja

- **Admin Pages:**
  - `/admin/login` - Admin login forma sa API pozivom
  - `/admin/dashboard` - Admin panel sa dashboard statistikom

#### Features
- ✅ TypeScript za type safety
- ✅ Tailwind CSS za styling
- ✅ Responsive design
- ✅ API integracijom (čita iz NEXT_PUBLIC_API_BASE_URL)
- ✅ Navigation komponente
- ✅ Forms sa validacijom
- ✅ Production-ready build konfiguracija

#### Files
```
pages/              - 8 JSX stranica
styles/             - globals.css
.env.local          - Lokalne promenljive
.env.example        - Primer .env fajla
next.config.js      - Next.js konfiguracija
tailwind.config.js  - Tailwind konfiguracija
tsconfig.json       - TypeScript konfiguracija
package.json        - npm zavisnosti
```

### Backend API (FastAPI)

Located in: `apps/api/`

#### Endpoints (6 operational + documentation)

**Health & Status:**
- `GET /api/v1/health` - Health check

**Products:**
- `GET /api/v1/products` - Get all products (sa paginacijom)
- `GET /api/v1/products/{id}` - Get product by ID

**Orders:**
- `POST /api/v1/orders` - Create new order

**Admin:**
- `POST /api/v1/admin/login` - Admin login (demo)

**Documentation:**
- `GET /api/docs` - Swagger UI
- `GET /api/redoc` - ReDoc documentation
- `GET /api/openapi.json` - OpenAPI spec

#### Features
- ✅ CORS konfiguriran sa ALLOWED_ORIGINS
- ✅ Environment varijable (.env)
- ✅ Pydantic data validation
- ✅ Auto-generated API dokumentacija
- ✅ Async/await endpoints

#### Files
```
app/
  ├── main.py           - FastAPI aplikacija
  ├── core/
  │   └── config.py     - Settings i konfiguracija
  └── api/v1/
      └── router.py     - API v1 endpoints
      
requirements.txt       - Python zavisnosti
.env                   - Environment promenljive
.env.example          - Primer .env fajla
```

### Configuration Files

#### Root Level
```
README.md             - Glavna dokumentacija
GETTING_STARTED.md    - Uputstvo za početak
DEPLOYMENT.md         - Deployment guide
AGENTS.md             - CI/CD & automation
.gitignore            - Git ignore rules
.editorconfig         - Editor konfiguracija
Makefile              - Build komande
docker-compose.yml    - Docker orkestracija
netlify.toml          - Netlify deployment
```

#### Frontend Config
```
apps/web/
  ├── .env.local              - Lokalne env varijable
  ├── .env.example           - Primer env
  ├── .gitignore             - Git ignore
  ├── .dockerignore          - Docker ignore
  ├── Dockerfile             - Docker image
  ├── .prettierrc.json       - Code formatting
  ├── next.config.js         - Next.js config
  ├── tailwind.config.js     - Tailwind config
  ├── tsconfig.json          - TypeScript config
  └── package.json           - npm dependencies
```

#### Backend Config
```
apps/api/
  ├── .env                    - Environment varijable
  ├── .env.example           - Primer env
  ├── .gitignore             - Git ignore
  ├── .dockerignore          - Docker ignore
  ├── Dockerfile             - Docker image
  ├── requirements.txt       - Python zavisnosti
  └── app/
      ├── main.py            - FastAPI app
      ├── core/
      │   └── config.py      - Config
      └── api/v1/
          └── router.py      - Routes
```

### GitHub Integration

Located in: `.github/`

```
.github/
  ├── workflows/
  │   ├── frontend-ci.yml      - Frontend CI/CD
  │   └── backend-ci.yml       - Backend CI/CD
  └── ISSUE_TEMPLATE/
      ├── bug_report.md        - Bug report template
      └── feature_request.md   - Feature request template
```

### Docker Support

```
docker-compose.yml      - Multi-container setup
apps/web/Dockerfile     - Frontend image
apps/api/Dockerfile     - Backend image
.dockerignore files     - Reduce image size
```

## 🚀 Quick Start Commands

### Installation
```bash
make install                    # Instaliraj sve zavisnosti
make frontend-install          # Samo frontend
make backend-install           # Samo backend
```

### Development
```bash
make dev                       # Start frontend + backend
make frontend-dev              # Start frontend (port 3000)
make backend-dev               # Start backend (port 8000)
```

### Build
```bash
make build                     # Build za production
make frontend-build            # Build frontend
```

### Docker
```bash
docker-compose up              # Start sve servise
docker-compose down            # Stop sve servise
```

## 🔧 Technology Stack

### Frontend
- **Next.js 16** - React framework
- **TypeScript 5** - Type-safe JavaScript
- **Tailwind CSS 3.4** - Utility CSS
- **React 19** - UI library
- **Fetch API** - HTTP client through typed reusable API helpers

### Backend
- **FastAPI 0.104.1** - Web framework
- **Uvicorn 0.24.0** - ASGI server
- **Pydantic 2.5.0** - Data validation
- **Python 3.12** - Language

### Development Tools
- **Node.js 18+** - JavaScript runtime
- **npm 9+** - Package manager
- **Git** - Version control
- **Docker** - Containerization
- **Make** - Build automation

## 📊 Architecture

```
┌─────────────────┐         ┌──────────────────┐
│    Frontend     │         │     Backend      │
│   (Next.js)     │────────▶│    (FastAPI)     │
│  Port: 3000     │         │   Port: 8000     │
└─────────────────┘         └──────────────────┘
       │                            │
       │                            │
   .env.local                    .env
   - API_URL                  - CORS Origins
   - Environment              - Port: 8000
                               - Settings
```

## 🎯 Deployment Targets

### Frontend
- **Netlify** (Recommended)
- **Vercel**
- **Traditional servers** (AWS, DigitalOcean, Linode)

### Backend
- **Render** (primary)
- **Render PostgreSQL** (managed production database)
- **Traditional servers** (Docker)

## 📋 Port Configuration

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend API | 8000 | http://localhost:8000 |
| API Docs | 8000 | http://localhost:8000/api/docs |

## 🔐 Environment Variables

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

## 📚 Documentation

1. **[README.md](./README.md)** - Glavna dokumentacija
2. **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Setup & početak
3. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment
4. **[AGENTS.md](./AGENTS.md)** - CI/CD & automation
5. **[apps/web/README.md](./apps/web/README.md)** - Frontend docs
6. **[apps/api/README.md](./apps/api/README.md)** - Backend docs

## ✅ Features Implemented

### Frontend
- ✅ 8 javnih stranica (Home, Products, Cart, Checkout, About, Contact, Privacy, Terms)
- ✅ 2 admin stranice (Login, Dashboard)
- ✅ Responsive design
- ✅ API integracijom
- ✅ Navigation menu
- ✅ Form validacijom
- ✅ Tailwind CSS styling
- ✅ TypeScript type safety

### Backend
- ✅ 6 operational endpoints
- ✅ CORS konfiguracija
- ✅ Health check endpoint
- ✅ Product endpoints
- ✅ Order endpoints
- ✅ Admin login
- ✅ Auto-generated API docs
- ✅ Environment configuration

### DevOps & Infrastructure
- ✅ Docker & Docker Compose
- ✅ GitHub Actions CI/CD
- ✅ Netlify configuration
- ✅ Make commands
- ✅ Code formatting (.editorconfig, .prettierrc)
- ✅ Git ignore patterns
- ✅ Issue templates
- ✅ Deployment documentation

## 🎓 Learning Resources

- Next.js: https://nextjs.org/docs
- FastAPI: https://fastapi.tiangolo.com
- Tailwind CSS: https://tailwindcss.com/docs
- Docker: https://docs.docker.com
- GitHub Actions: https://docs.github.com/en/actions

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Push to branch
5. Create Pull Request

## 📞 Support

- Documentation: See README files
- API Docs: http://localhost:8000/api/docs
- GitHub Issues: Report bugs or request features

## 📝 Status

**🚀 Production Ready**
- All core features implemented
- Documentation complete
- CI/CD configured
- Deployment options documented

---

**Created**: January 2024
**Status**: Active Development
**Version**: 1.0.0
