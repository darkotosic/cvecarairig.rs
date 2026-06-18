from app.core.security import create_access_token
from app.crud.user import create_user
from app.models.audit_log import AuditLog
from app.schemas.user import UserCreate
from app.services.audit import create_audit_log


def _auth_headers(db):
    user = create_user(db, UserCreate(email="audit-admin@example.com", full_name="Audit Admin", password="Secret123!"), is_admin=True)
    return {"Authorization": f"Bearer {create_access_token(user.id)}"}


def test_create_audit_log_redacts_secret_metadata(db):
    log = create_audit_log(db, actor_user_id=None, action="update", entity_type="setting", entity_id="smtp", metadata={"SMTP_PASSWORD": "secret", "safe": "ok"})

    stored = db.get(AuditLog, log.id)
    assert stored is not None
    assert '"SMTP_PASSWORD": "[REDACTED]"' in stored.metadata_json
    assert '"safe": "ok"' in stored.metadata_json


def test_admin_can_filter_audit_logs(client, db):
    create_audit_log(db, actor_user_id=None, action="update", entity_type="product", entity_id="1")
    create_audit_log(db, actor_user_id=None, action="delete", entity_type="category", entity_id="2")

    response = client.get("/api/v1/admin/audit-logs?action=update&entity_type=product", headers=_auth_headers(db))

    assert response.status_code == 200, response.text
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["action"] == "update"
    assert data["items"][0]["entity_type"] == "product"
