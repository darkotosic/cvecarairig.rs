"""order hardening

Revision ID: 0003_order_hardening
Revises: 0002_catalog_enterprise
Create Date: 2026-05-07 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "0003_order_hardening"
down_revision = "0002_catalog_enterprise"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("orders") as batch_op:
        batch_op.add_column(sa.Column("idempotency_key", sa.String(length=120), nullable=True))
        batch_op.add_column(sa.Column("confirmed_at", sa.DateTime(timezone=True), nullable=True))
        batch_op.add_column(sa.Column("packed_at", sa.DateTime(timezone=True), nullable=True))
        batch_op.add_column(sa.Column("shipped_at", sa.DateTime(timezone=True), nullable=True))
        batch_op.add_column(sa.Column("delivered_at", sa.DateTime(timezone=True), nullable=True))
        batch_op.add_column(sa.Column("cancelled_at", sa.DateTime(timezone=True), nullable=True))
        batch_op.add_column(sa.Column("internal_note", sa.Text(), nullable=True))
        batch_op.create_index("ix_orders_idempotency_key", ["idempotency_key"], unique=True)

    op.create_table(
        "order_status_events",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("order_id", sa.Integer(), nullable=False),
        sa.Column("old_status", sa.String(length=32), nullable=True),
        sa.Column("new_status", sa.String(length=32), nullable=False),
        sa.Column("actor_user_id", sa.Integer(), nullable=True),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["actor_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_order_status_events_id"), "order_status_events", ["id"], unique=False)
    op.create_index(op.f("ix_order_status_events_order_id"), "order_status_events", ["order_id"], unique=False)
    op.create_index(op.f("ix_order_status_events_actor_user_id"), "order_status_events", ["actor_user_id"], unique=False)
    op.create_index(op.f("ix_order_status_events_created_at"), "order_status_events", ["created_at"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_order_status_events_created_at"), table_name="order_status_events")
    op.drop_index(op.f("ix_order_status_events_actor_user_id"), table_name="order_status_events")
    op.drop_index(op.f("ix_order_status_events_order_id"), table_name="order_status_events")
    op.drop_index(op.f("ix_order_status_events_id"), table_name="order_status_events")
    op.drop_table("order_status_events")
    with op.batch_alter_table("orders") as batch_op:
        batch_op.drop_index("ix_orders_idempotency_key")
        for column in ["internal_note", "cancelled_at", "delivered_at", "shipped_at", "packed_at", "confirmed_at", "idempotency_key"]:
            batch_op.drop_column(column)
