"""add florist product and order fields

Revision ID: 0005_florist_fields
Revises: 0004_order_item_snapshots
Create Date: 2026-06-18 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "0005_florist_fields"
down_revision = "0004_order_item_snapshots"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("products", sa.Column("arrangement_type", sa.String(length=120), nullable=True))
    op.add_column("products", sa.Column("occasion", sa.String(length=120), nullable=True))
    op.add_column("products", sa.Column("color_palette", sa.String(length=120), nullable=True))
    op.add_column("products", sa.Column("flower_count", sa.Integer(), nullable=True))
    op.add_column("products", sa.Column("is_same_day_delivery", sa.Boolean(), server_default=sa.text("true"), nullable=False))
    op.add_column("products", sa.Column("lead_time_hours", sa.Integer(), server_default="2", nullable=False))
    op.add_column("orders", sa.Column("recipient_name", sa.String(length=255), nullable=True))
    op.add_column("orders", sa.Column("recipient_phone", sa.String(length=80), nullable=True))
    op.add_column("orders", sa.Column("delivery_date", sa.Date(), nullable=True))
    op.add_column("orders", sa.Column("delivery_time_window", sa.String(length=120), nullable=True))
    op.add_column("orders", sa.Column("card_message", sa.Text(), nullable=True))
    op.add_column("orders", sa.Column("occasion", sa.String(length=120), nullable=True))


def downgrade() -> None:
    op.drop_column("orders", "occasion")
    op.drop_column("orders", "card_message")
    op.drop_column("orders", "delivery_time_window")
    op.drop_column("orders", "delivery_date")
    op.drop_column("orders", "recipient_phone")
    op.drop_column("orders", "recipient_name")
    op.drop_column("products", "lead_time_hours")
    op.drop_column("products", "is_same_day_delivery")
    op.drop_column("products", "flower_count")
    op.drop_column("products", "color_palette")
    op.drop_column("products", "occasion")
    op.drop_column("products", "arrangement_type")
