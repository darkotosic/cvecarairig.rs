# Backend - cvecarairig.rs API

FastAPI-based REST API for cvecarairig.rs e-commerce platform. Current status: pre-production foundation with PostgreSQL/Alembic models, JWT admin auth, protected admin routes, guest checkout, order lifecycle validation, checkout validation, audit logs, and Cloudinary-ready product image upload.

## 🚀 Quick Start

### Backend local commands (Windows / PowerShell)

```bash
cd apps/api
py -3.12 -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

For macOS/Linux, create a Python 3.12 virtual environment with your local Python launcher and activate it with `source .venv/bin/activate`.

Visit `http://localhost:8000/api/docs` for API documentation.

## 📁 Project Structure

```
api/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py        # Configuration & settings
│   ├── api/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       └── router.py    # API v1 routes
│   └── models/              # Pydantic models (optional)
├── requirements.txt         # Python dependencies
├── .env.example            # Example environment variables
├── .env                    # Environment variables (local)
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## 🛠️ Available Commands

```bash
# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run with uvicorn (with auto-reload)
uvicorn app.main:app --reload --port 8000

# Run with specific host
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Install dependencies
pip install -r requirements.txt

# Add new dependency
pip install package-name
pip freeze > requirements.txt
```

## 📝 API Endpoints

All endpoints are under `/api/v1` prefix.

### Health & Status
- **GET** `/api/v1/health` - Health check endpoint
  - Returns: `{"status": "ok", "message": "...", "version": "1.0.0"}`

### Products
- **GET** `/api/v1/products` - Get active products with pagination/filter parameters.
- **GET** `/api/v1/products/{slug}` - Get active product detail by slug.
- Public product data includes category, images, variants, stock, SEO-ready slugs, and snapshot fields used by checkout.

### Orders
- **POST** `/api/v1/orders/guest-checkout` - Canonical public storefront checkout. Requires `accepted_terms=true`, customer/shipping fields, non-empty items, and captures order item snapshots.
- **POST** `/api/v1/orders/checkout` - Legacy/internal authenticated-user checkout for future logged-in carts only. It requires auth and `accepted_terms=true`; do not expose it publicly until idempotency and full order item snapshots are implemented.
- **GET** `/api/v1/orders/me` - Authenticated user's orders.
- **GET** `/api/v1/orders` - Admin order list.
- **PATCH** `/api/v1/orders/{order_id}/status` - Admin status update with lifecycle validation.

### Auth and Admin
- **POST** `/api/v1/auth/login` - Login and receive a JWT.
- **POST** `/api/v1/auth/bootstrap-admin` - Temporary first-admin creation guarded by `BOOTSTRAP_ADMIN_TOKEN`.
- **GET/PATCH/POST/DELETE** `/api/v1/admin/*` - Protected admin APIs for summary, products, categories, orders, settings, audit logs, variants, and product images.
- **POST** `/api/v1/admin/products/{product_id}/images/upload` - Protected multipart Cloudinary upload with MIME/extension/size validation and audit metadata.

## 🔧 Configuration

### Environment Variables
```env
# .env
APP_ENV=development
DATABASE_URL=sqlite:///./dev.db
JWT_SECRET=replace-with-local-secret
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
HOST=0.0.0.0
PORT=8000
MEDIA_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ADMIN_EMAIL=cvecaralotos022@gmail.com
ADMIN_PASSWORD=<local-admin-password>
ADMIN_FULL_NAME=Online Cvećara Irig Admin
BOOTSTRAP_ADMIN_TOKEN=temporary-local-bootstrap-token
```

When `ADMIN_PASSWORD` is set, startup seeding creates or promotes `ADMIN_EMAIL` as an active admin user and refreshes the password hash. Remove or blank `BOOTSTRAP_ADMIN_TOKEN` after the first admin exists. Production Cloudinary upload requires the Cloudinary variables above.

### CORS Configuration
CORS is configured to allow requests from `ALLOWED_ORIGINS`:
- `http://localhost:3000` (Frontend)
- `http://localhost:8000` (Swagger UI)
- `http://127.0.0.1:3000` (Alternative localhost)

Modify `ALLOWED_ORIGINS` in `.env` to add more origins.

## 📚 API Documentation

Interactive documentation available at:
- **Swagger UI**: `http://localhost:8000/api/docs`
- **ReDoc**: `http://localhost:8000/api/redoc`
- **OpenAPI JSON**: `http://localhost:8000/api/openapi.json`

## 📦 Dependencies

- **fastapi** (^0.104.1) - Web framework
- **uvicorn** (^0.24.0) - ASGI server
- **pydantic** (^2.5.0) - Data validation
- **python-dotenv** (^1.0.0) - Environment management

See `requirements.txt` for all dependencies.

## 🧪 Testing

```bash
python -m compileall app
pytest
alembic upgrade head
```

The test suite covers health checks, checkout validation, guest checkout idempotency, legacy checkout terms/auth requirements, order item snapshots, order status transitions, audit logs, and product image upload validation.

## 🚀 Deployment

### Development
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```


### Docker production start

The production Docker image starts with `/app/start.sh`, which runs `alembic upgrade head` before launching `uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" --proxy-headers`. Keep Render/Docker start commands aligned with this behavior so migrations are not skipped.

### Production with Gunicorn
```bash
pip install gunicorn
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

### Docker

Use the repository `apps/api/Dockerfile`; it sets `CMD ["/app/start.sh"]` so migrations run before Uvicorn.

## 🔐 Security

- ✅ CORS properly configured
- ✅ Environment variables for secrets
- ✅ Pydantic data validation
- ✅ JWT admin authentication

### TODO - Production Security
- [x] JWT authentication
- [x] PostgreSQL via SQLAlchemy and Alembic
- [x] Rate limiting
- [x] Input validation
- [ ] HTTPS enforcement
- [ ] SQL injection prevention

## 🐛 Troubleshooting

### Port 8000 already in use
```bash
# Use different port
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 --port 8001
# Or kill process:
# Windows: netstat -ano | findstr :8000
# macOS/Linux: lsof -i :8000
```

### Module not found errors
```bash
# Ensure venv is activated
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### CORS errors
- Check `ALLOWED_ORIGINS` in `.env`
- Ensure frontend URL is in the list
- Restart API server after changes

## 📖 FastAPI Features Used

- **Async/Await**: Async route handlers
- **Pydantic**: Request/response validation
- **Type Hints**: Full type annotation
- **CORS Middleware**: Cross-origin support
- **OpenAPI Docs**: Auto-generated documentation
- **Path Parameters**: Dynamic route segments
- **Query Parameters**: URL query strings

## 🔄 Adding New Endpoints

1. Add route to `app/api/v1/router.py`:
```python
@router.get("/new-endpoint")
async def new_endpoint():
    return {"message": "Success"}
```

2. Restart server
3. View in Swagger UI at `http://localhost:8000/api/docs`

---

**Status**: Active Development
**Last Updated**: January 2024


## CI checks

Backend CI mora proći:

- `python -m compileall app`
- `pytest`
- `alembic upgrade head` against a clean SQLite migration database in CI


## Inventory rules

- Product without variants uses `Product.stock_quantity`.
- Product with active variants requires `variant_id` during checkout.
- Variant checkout decrements `ProductVariant.stock_quantity`.
- `Product.stock_quantity` is not decremented when `variant_id` is used.
- `ProductRead.effective_stock_quantity` sums active variant stock when variants exist.
