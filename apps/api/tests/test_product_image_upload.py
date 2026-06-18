import json
from io import BytesIO

from app.core.config import settings
from app.core.security import create_access_token
from app.crud.product import create_product
from app.crud.user import create_user
from app.models.audit_log import AuditLog
from app.models.product_image import ProductImage
from app.schemas.product import ProductCreate
from app.schemas.user import UserCreate


def _enable_cloudinary():
    settings.MEDIA_PROVIDER = "cloudinary"
    settings.CLOUDINARY_CLOUD_NAME = "demo"
    settings.CLOUDINARY_API_KEY = "key"
    settings.CLOUDINARY_API_SECRET = "secret"


def _create_product_and_admin(db, slug="upload-majica", email="upload-admin@example.com"):
    product = create_product(db, ProductCreate(name="Upload majica", slug=slug, price_cents=1000, stock_quantity=2))
    user = create_user(db, UserCreate(email=email, full_name="Upload Admin", password="Secret123!"), is_admin=True)
    return product, user


def _error_message(response):
    body = response.json()
    if "detail" in body:
        return body["detail"]
    return body["error"]["message"]


def _upload(client, product_id, user_id, filename="test.jpg", content=b"image-bytes", content_type="image/jpeg"):
    return client.post(
        f"/api/v1/admin/products/{product_id}/images/upload",
        headers={"Authorization": f"Bearer {create_access_token(user_id)}"},
        files={"file": (filename, BytesIO(content), content_type)},
        data={"alt_text": "Alt", "sort_order": "5", "is_primary": "true"},
    )


def test_admin_uploads_product_image_to_cloudinary(client, db, monkeypatch):
    _enable_cloudinary()
    product, user = _create_product_and_admin(db)

    def fake_upload(content, folder, resource_type, overwrite):
        assert content == b"image-bytes"
        assert folder == f"simeonshop/products/{product.id}"
        assert resource_type == "image"
        assert overwrite is False
        return {"secure_url": "https://res.cloudinary.com/demo/image/upload/test.jpg"}

    monkeypatch.setattr("cloudinary.uploader.upload", fake_upload)

    response = _upload(client, product.id, user.id)

    assert response.status_code == 201, response.text
    data = response.json()
    assert data["image_url"] == "https://res.cloudinary.com/demo/image/upload/test.jpg"
    assert data["is_primary"] is True
    assert db.query(ProductImage).filter(ProductImage.product_id == product.id).count() == 1
    log = db.query(AuditLog).filter(AuditLog.action == "upload", AuditLog.entity_type == "product_image").first()
    assert log is not None


def test_admin_upload_rejects_unsupported_mime_type(client, db):
    _enable_cloudinary()
    product, user = _create_product_and_admin(db)

    response = _upload(client, product.id, user.id, filename="test.gif", content_type="image/gif")

    assert response.status_code == 400
    assert _error_message(response) == "Unsupported image type."
    assert db.query(ProductImage).filter(ProductImage.product_id == product.id).count() == 0


def test_admin_upload_rejects_file_larger_than_5mb(client, db):
    _enable_cloudinary()
    product, user = _create_product_and_admin(db)

    response = _upload(client, product.id, user.id, content=b"0" * (5 * 1024 * 1024 + 1))

    assert response.status_code == 400
    assert _error_message(response) == "Image is larger than 5MB."
    assert db.query(ProductImage).filter(ProductImage.product_id == product.id).count() == 0


def test_admin_upload_rejects_unsupported_extension(client, db):
    _enable_cloudinary()
    product, user = _create_product_and_admin(db)

    response = _upload(client, product.id, user.id, filename="test.gif", content_type="image/jpeg")

    assert response.status_code == 400
    assert _error_message(response) == "Unsupported image extension."
    assert db.query(ProductImage).filter(ProductImage.product_id == product.id).count() == 0


def test_admin_upload_writes_audit_metadata(client, db, monkeypatch):
    _enable_cloudinary()
    product, user = _create_product_and_admin(db)
    image_url = "https://res.cloudinary.com/demo/image/upload/test.webp"

    def fake_upload(content, folder, resource_type, overwrite):
        assert overwrite is False
        return {"secure_url": image_url}

    monkeypatch.setattr("cloudinary.uploader.upload", fake_upload)

    response = _upload(client, product.id, user.id, filename="test.webp", content=b"webp-bytes", content_type="image/webp")

    assert response.status_code == 201, response.text
    log = db.query(AuditLog).filter(AuditLog.action == "upload", AuditLog.entity_type == "product_image").first()
    assert log is not None
    assert json.loads(log.metadata_json) == {
        "product_id": product.id,
        "image_url": image_url,
        "content_type": "image/webp",
        "size_bytes": len(b"webp-bytes"),
    }


def test_admin_upload_rejects_when_cloudinary_provider_is_disabled(client, db):
    settings.MEDIA_PROVIDER = "local"
    product, user = _create_product_and_admin(db)

    response = _upload(client, product.id, user.id)

    assert response.status_code == 400
    assert _error_message(response) == "Cloudinary media provider is not enabled."


def test_admin_upload_rejects_when_cloudinary_is_not_configured(client, db):
    settings.MEDIA_PROVIDER = "cloudinary"
    settings.CLOUDINARY_CLOUD_NAME = ""
    settings.CLOUDINARY_API_KEY = "key"
    settings.CLOUDINARY_API_SECRET = "secret"
    product, user = _create_product_and_admin(db)

    response = _upload(client, product.id, user.id)

    assert response.status_code == 500
    assert _error_message(response) == "Cloudinary is not configured."
