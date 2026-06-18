from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.api.v1.endpoints import admin, auth, cart, categories, orders, products, store
from app.core.config import settings

router = APIRouter(prefix=settings.API_PREFIX, tags=["v1"])


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {
        "status": "ok",
        "message": "cvecarairig.rs API is running",
        "version": settings.PROJECT_VERSION,
        "environment": settings.APP_ENV,
        "database": "ok",
    }


router.include_router(auth.router, prefix="/auth", tags=["Auth"])
router.include_router(products.router, prefix="/products", tags=["Products"])
router.include_router(categories.router, prefix="/categories", tags=["Categories"])
router.include_router(cart.router, prefix="/cart", tags=["Cart"])
router.include_router(orders.router, prefix="/orders", tags=["Orders"])
router.include_router(store.router, prefix="/store", tags=["Store"])
router.include_router(admin.router, prefix="/admin", tags=["Admin"])
