"""update public contact email

Revision ID: 0006_update_public_contact_email
Revises: 0005_florist_fields
Create Date: 2026-06-19 00:00:00.000000
"""
from alembic import op

revision = "0006_update_public_contact_email"
down_revision = "0005_florist_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        UPDATE store_settings
        SET value = 'cvecaralotos022@gmail.com'
        WHERE key = 'store_email'
          AND (value IS NULL OR value = '' OR lower(value) IN ('info@cvecarairig.rs', 'info@cvecara.irig.rs'))
        """
    )


def downgrade() -> None:
    op.execute(
        """
        UPDATE store_settings
        SET value = 'info@cvecarairig.rs'
        WHERE key = 'store_email'
          AND lower(value) = 'cvecaralotos022@gmail.com'
        """
    )
