def test_public_registration_disabled_by_default(client):
    response = client.post("/api/v1/auth/register", json={"email": "user@example.com", "full_name": "Test User", "password": "password123"})
    assert response.status_code == 403


def test_bootstrap_admin_requires_token_and_creates_admin(client):
    response = client.post("/api/v1/auth/bootstrap-admin", json={"email": "admin@example.com", "full_name": "Admin User", "password": "password123", "bootstrap_token": "test-bootstrap-token"})
    assert response.status_code == 201, response.text
    assert response.json()["is_admin"] is True
