import json
from typing import Any

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog

SECRET_KEYS = {"password", "token", "jwt", "secret", "smtp_password", "database_url", "api_key"}


def _redact(value: Any) -> Any:
    if isinstance(value, dict):
        return {key: "[REDACTED]" if any(secret in key.lower() for secret in SECRET_KEYS) else _redact(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_redact(item) for item in value]
    return value


def create_audit_log(db: Session, actor_user_id: int | None, action: str, entity_type: str, entity_id: str | int | None = None, metadata: dict[str, Any] | None = None) -> AuditLog:
    log = AuditLog(actor_user_id=actor_user_id, action=action, entity_type=entity_type, entity_id=str(entity_id) if entity_id is not None else None, metadata_json=json.dumps(_redact(metadata or {}), ensure_ascii=False))
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
