from app.crud.product import create_product
from app.crud.product_media import create_product_image, create_product_variant
from app.schemas.product import ProductCreate, ProductImageCreate, ProductVariantCreate


def test_guest_checkout_persists_order_item_snapshot(client, db):
    product = create_product(db, ProductCreate(name="Crna majica", slug="crna-majica", sku="BASE", price_cents=2000, stock_quantity=10, image_url="https://example.com/fallback.jpg"))
    create_product_image(db, product.id, ProductImageCreate(image_url="https://example.com/secondary.jpg", sort_order=1))
    create_product_image(db, product.id, ProductImageCreate(image_url="https://example.com/primary.jpg", sort_order=10, is_primary=True))
    variant = create_product_variant(db, product.id, ProductVariantCreate(sku="M-CRNA", size="M", color="Crna", price_cents=2500, stock_quantity=4))

    response = client.post("/api/v1/orders/guest-checkout", json={
        "customer_name": "Petar Petrović",
        "customer_phone": "+38160111222",
        "shipping_city": "Beograd",
        "shipping_postal_code": "11000",
        "shipping_address": "Test ulica 1",
        "accepted_terms": True,
        "items": [{"product_id": product.id, "variant_id": variant.id, "quantity": 1}],
    })

    assert response.status_code == 201, response.text
    item = response.json()["items"][0]
    assert item["variant_id"] == variant.id
    assert item["variant_label"] == "M / Crna"
    assert item["product_slug"] == "crna-majica"
    assert item["product_image_url"] == "https://example.com/primary.jpg"
    assert item["currency"] == "RSD"
    assert item["discount_cents"] == 0
    assert item["tax_cents"] == 0
