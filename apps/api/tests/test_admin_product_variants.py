from app.core.security import create_access_token
from app.crud.product import create_product, get_product_by_id
from app.crud.user import create_user
from app.schemas.product import ProductCreate
from app.schemas.user import UserCreate


def _auth_headers(db, *, is_admin=True, email="admin@example.com"):
    user = create_user(db, UserCreate(email=email, full_name="Test User", password="Secret123!"), is_admin=is_admin)
    return {"Authorization": f"Bearer {create_access_token(user.id)}"}


def _product(db):
    return create_product(db, ProductCreate(name="Crni duks", slug="crni-duks", price_cents=300000, stock_quantity=10))


def test_admin_can_add_product_variant(client, db):
    product = _product(db)
    response = client.post(
        f"/api/v1/admin/products/{product.id}/variants",
        json={"sku": "DUKS-BLK-M", "size": "M", "color": "Crna", "price_cents": 310000, "stock_quantity": 4},
        headers=_auth_headers(db),
    )

    assert response.status_code == 201
    data = response.json()
    assert data["sku"] == "DUKS-BLK-M"
    assert data["stock_quantity"] == 4
    assert data["is_active"] is True


def test_duplicate_variant_sku_returns_conflict(client, db):
    product = _product(db)
    headers = _auth_headers(db)
    payload = {"sku": "DUKS-BLK-M", "size": "M", "stock_quantity": 4}
    first = client.post(f"/api/v1/admin/products/{product.id}/variants", json=payload, headers=headers)
    second = client.post(f"/api/v1/admin/products/{product.id}/variants", json=payload, headers=headers)

    assert first.status_code == 201
    assert second.status_code == 409


def test_inactive_variant_is_not_counted_in_effective_stock_quantity(client, db):
    product = _product(db)
    headers = _auth_headers(db)
    active = client.post(
        f"/api/v1/admin/products/{product.id}/variants",
        json={"sku": "DUKS-BLK-M", "size": "M", "stock_quantity": 4},
        headers=headers,
    ).json()
    inactive = client.post(
        f"/api/v1/admin/products/{product.id}/variants",
        json={"sku": "DUKS-BLK-L", "size": "L", "stock_quantity": 7},
        headers=headers,
    ).json()

    response = client.delete(f"/api/v1/admin/products/{product.id}/variants/{inactive['id']}", headers=headers)

    assert response.status_code == 200
    refreshed = get_product_by_id(db, product.id)
    assert refreshed is not None
    assert refreshed.variants[0].id == active["id"] or refreshed.variants[1].id == active["id"]
    assert sum(variant.stock_quantity for variant in refreshed.variants if variant.is_active) == 4
