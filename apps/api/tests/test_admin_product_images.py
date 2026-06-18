from app.core.security import create_access_token
from app.crud.product import create_product
from app.crud.user import create_user
from app.models.product_image import ProductImage
from app.schemas.product import ProductCreate
from app.schemas.user import UserCreate


def _auth_headers(db, *, is_admin=True, email="admin@example.com"):
    user = create_user(db, UserCreate(email=email, full_name="Test User", password="Secret123!"), is_admin=is_admin)
    return {"Authorization": f"Bearer {create_access_token(user.id)}"}


def _product(db):
    return create_product(db, ProductCreate(name="Bela majica", slug="bela-majica", price_cents=120000, stock_quantity=5))


def test_admin_can_add_product_image(client, db):
    product = _product(db)
    response = client.post(
        f"/api/v1/admin/products/{product.id}/images",
        json={"image_url": "https://cdn.example.com/bela.jpg", "alt_text": "Bela majica", "sort_order": 1, "is_primary": True},
        headers=_auth_headers(db),
    )

    assert response.status_code == 201
    data = response.json()
    assert data["image_url"] == "https://cdn.example.com/bela.jpg"
    assert data["is_primary"] is True


def test_non_admin_cannot_add_product_image(client, db):
    product = _product(db)
    response = client.post(
        f"/api/v1/admin/products/{product.id}/images",
        json={"image_url": "https://cdn.example.com/bela.jpg"},
        headers=_auth_headers(db, is_admin=False, email="buyer@example.com"),
    )

    assert response.status_code == 403


def test_primary_product_image_resets_other_primary_images(client, db):
    product = _product(db)
    headers = _auth_headers(db)
    first = client.post(
        f"/api/v1/admin/products/{product.id}/images",
        json={"image_url": "https://cdn.example.com/first.jpg", "is_primary": True},
        headers=headers,
    ).json()
    second = client.post(
        f"/api/v1/admin/products/{product.id}/images",
        json={"image_url": "https://cdn.example.com/second.jpg"},
        headers=headers,
    ).json()

    response = client.patch(f"/api/v1/admin/products/{product.id}/images/{second['id']}/primary", headers=headers)

    assert response.status_code == 200
    db.expire_all()
    assert db.get(ProductImage, second["id"]).is_primary is True
    assert db.get(ProductImage, first["id"]).is_primary is False
