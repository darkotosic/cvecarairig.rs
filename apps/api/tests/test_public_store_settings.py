from app.models.store_setting import StoreSetting


def test_public_store_settings_filters_private_and_needs_no_auth(client, db):
    db.add(StoreSetting(key="store_email", value="cvecaralotos022@gmail.com", is_public=True))
    db.add(StoreSetting(key="jwt_secret_note", value="private", is_public=True))
    db.add(StoreSetting(key="company_tax_id", value="123", is_public=False))
    db.add(StoreSetting(key="store_phone", value="+381 11 123 456", is_public=False))
    db.commit()

    response = client.get("/api/v1/store/settings")

    assert response.status_code == 200, response.text
    assert response.json() == {
        "store_phone": None,
        "store_email": "cvecaralotos022@gmail.com",
        "instagram_url": None,
        "facebook_url": None,
        "delivery_note": None,
        "return_policy_short": None,
        "company_name": None,
        "company_address": None,
        "company_registration_number": None,
        "company_tax_id": None,
        "logo_url": None,
        "business_hours": None,
        "service_area": None,
        "same_day_cutoff": None,
        "payment_methods": None,
        "google_maps_url": None,
        "whatsapp_url": None,
    }


def test_public_store_settings_empty_object_is_valid(client):
    response = client.get("/api/v1/store/settings")

    assert response.status_code == 200, response.text
    assert set(response.json()) == {
        "store_phone",
        "store_email",
        "instagram_url",
        "facebook_url",
        "delivery_note",
        "return_policy_short",
        "company_name",
        "company_address",
        "company_registration_number",
        "company_tax_id",
        "logo_url",
        "business_hours",
        "service_area",
        "same_day_cutoff",
        "payment_methods",
        "google_maps_url",
        "whatsapp_url",
    }
