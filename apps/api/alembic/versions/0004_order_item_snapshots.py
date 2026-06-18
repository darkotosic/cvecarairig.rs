"""order item snapshots

Revision ID: 0004_order_item_snapshots
Revises: 0003_order_hardening
Create Date: 2026-05-07 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "0004_order_item_snapshots"
down_revision = "0003_order_hardening"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("order_items") as batch_op:
        batch_op.add_column(sa.Column("variant_id", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("product_slug", sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column("product_image_url", sa.String(length=1000), nullable=True))
        batch_op.add_column(sa.Column("variant_label", sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column("currency", sa.String(length=3), server_default="RSD", nullable=False))
        batch_op.add_column(sa.Column("discount_cents", sa.Integer(), server_default="0", nullable=False))
        batch_op.add_column(sa.Column("tax_cents", sa.Integer(), server_default="0", nullable=False))
        batch_op.create_foreign_key("fk_order_items_variant_id_product_variants", "product_variants", ["variant_id"], ["id"], ondelete="SET NULL")
        batch_op.create_index("ix_order_items_variant_id", ["variant_id"], unique=False)

    with op.batch_alter_table("orders") as batch_op:
        batch_op.add_column(sa.Column("accepted_terms_at", sa.DateTime(timezone=True), nullable=True))
        batch_op.add_column(sa.Column("customer_ip", sa.String(length=64), nullable=True))
        batch_op.add_column(sa.Column("user_agent", sa.String(length=500), nullable=True))
        batch_op.add_column(sa.Column("source", sa.String(length=80), server_default="web", nullable=False))


def downgrade() -> None:
    with op.batch_alter_table("orders") as batch_op:
        for column in ["source", "user_agent", "customer_ip", "accepted_terms_at"]:
            batch_op.drop_column(column)

    with op.batch_alter_table("order_items") as batch_op:
        batch_op.drop_index("ix_order_items_variant_id")
        batch_op.drop_constraint("fk_order_items_variant_id_product_variants", type_="foreignkey")
        for column in ["tax_cents", "discount_cents", "currency", "variant_label", "product_image_url", "product_slug", "variant_id"]:
            batch_op.drop_column(column)
