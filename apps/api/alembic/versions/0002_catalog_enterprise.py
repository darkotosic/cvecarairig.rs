"""catalog enterprise hardening

Revision ID: 0002_catalog_enterprise
Revises: 0001_enterprise_core
Create Date: 2026-05-07 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "0002_catalog_enterprise"
down_revision = "0001_enterprise_core"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "categories",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("sort_order", sa.Integer(), server_default="0", nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index(op.f("ix_categories_id"), "categories", ["id"], unique=False)
    op.create_index(op.f("ix_categories_slug"), "categories", ["slug"], unique=True)
    op.create_index("ix_categories_active_sort", "categories", ["is_active", "sort_order"], unique=False)
    op.create_index(op.f("ix_categories_created_at"), "categories", ["created_at"], unique=False)

    with op.batch_alter_table("products") as batch_op:
        batch_op.add_column(sa.Column("category_id", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("short_description", sa.String(length=500), nullable=True))
        batch_op.add_column(sa.Column("compare_at_price_cents", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("material", sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column("care_instructions", sa.Text(), nullable=True))
        batch_op.add_column(sa.Column("seo_title", sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column("seo_description", sa.String(length=500), nullable=True))
        batch_op.add_column(sa.Column("sort_order", sa.Integer(), server_default="0", nullable=False))
        batch_op.create_foreign_key("fk_products_category_id_categories", "categories", ["category_id"], ["id"], ondelete="SET NULL")
    op.create_index(op.f("ix_products_category_id"), "products", ["category_id"], unique=False)
    op.create_index("ix_products_active_created_at", "products", ["is_active", "created_at"], unique=False)
    op.create_index("ix_products_active_category", "products", ["is_active", "category_id"], unique=False)
    op.create_index("ix_products_sort_order", "products", ["sort_order"], unique=False)

    op.create_table(
        "product_images",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("image_url", sa.String(length=1000), nullable=False),
        sa.Column("alt_text", sa.String(length=255), nullable=True),
        sa.Column("sort_order", sa.Integer(), server_default="0", nullable=False),
        sa.Column("is_primary", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_product_images_id"), "product_images", ["id"], unique=False)
    op.create_index(op.f("ix_product_images_product_id"), "product_images", ["product_id"], unique=False)
    op.create_index("ix_product_images_product_sort", "product_images", ["product_id", "sort_order"], unique=False)
    op.create_index(op.f("ix_product_images_created_at"), "product_images", ["created_at"], unique=False)

    op.create_table(
        "product_variants",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("sku", sa.String(length=120), nullable=True),
        sa.Column("size", sa.String(length=50), nullable=True),
        sa.Column("color", sa.String(length=80), nullable=True),
        sa.Column("price_cents", sa.Integer(), nullable=True),
        sa.Column("stock_quantity", sa.Integer(), server_default="0", nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("sku"),
    )
    op.create_index(op.f("ix_product_variants_id"), "product_variants", ["id"], unique=False)
    op.create_index(op.f("ix_product_variants_product_id"), "product_variants", ["product_id"], unique=False)
    op.create_index(op.f("ix_product_variants_sku"), "product_variants", ["sku"], unique=True)
    op.create_index("ix_product_variants_active", "product_variants", ["is_active"], unique=False)
    op.create_index(op.f("ix_product_variants_created_at"), "product_variants", ["created_at"], unique=False)

    op.create_table(
        "store_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("key", sa.String(length=120), nullable=False),
        sa.Column("value", sa.Text(), nullable=True),
        sa.Column("value_type", sa.String(length=40), server_default="string", nullable=False),
        sa.Column("is_public", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("key"),
    )
    op.create_index(op.f("ix_store_settings_id"), "store_settings", ["id"], unique=False)
    op.create_index(op.f("ix_store_settings_key"), "store_settings", ["key"], unique=True)
    op.create_index("ix_store_settings_public", "store_settings", ["is_public"], unique=False)

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("actor_user_id", sa.Integer(), nullable=True),
        sa.Column("action", sa.String(length=120), nullable=False),
        sa.Column("entity_type", sa.String(length=120), nullable=False),
        sa.Column("entity_id", sa.String(length=120), nullable=True),
        sa.Column("metadata_json", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["actor_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_audit_logs_id"), "audit_logs", ["id"], unique=False)
    op.create_index(op.f("ix_audit_logs_actor_user_id"), "audit_logs", ["actor_user_id"], unique=False)
    op.create_index(op.f("ix_audit_logs_action"), "audit_logs", ["action"], unique=False)
    op.create_index(op.f("ix_audit_logs_entity_type"), "audit_logs", ["entity_type"], unique=False)
    op.create_index(op.f("ix_audit_logs_entity_id"), "audit_logs", ["entity_id"], unique=False)
    op.create_index(op.f("ix_audit_logs_created_at"), "audit_logs", ["created_at"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_audit_logs_created_at"), table_name="audit_logs")
    op.drop_index(op.f("ix_audit_logs_entity_id"), table_name="audit_logs")
    op.drop_index(op.f("ix_audit_logs_entity_type"), table_name="audit_logs")
    op.drop_index(op.f("ix_audit_logs_action"), table_name="audit_logs")
    op.drop_index(op.f("ix_audit_logs_actor_user_id"), table_name="audit_logs")
    op.drop_index(op.f("ix_audit_logs_id"), table_name="audit_logs")
    op.drop_table("audit_logs")
    op.drop_index("ix_store_settings_public", table_name="store_settings")
    op.drop_index(op.f("ix_store_settings_key"), table_name="store_settings")
    op.drop_index(op.f("ix_store_settings_id"), table_name="store_settings")
    op.drop_table("store_settings")
    op.drop_index(op.f("ix_product_variants_created_at"), table_name="product_variants")
    op.drop_index("ix_product_variants_active", table_name="product_variants")
    op.drop_index(op.f("ix_product_variants_sku"), table_name="product_variants")
    op.drop_index(op.f("ix_product_variants_product_id"), table_name="product_variants")
    op.drop_index(op.f("ix_product_variants_id"), table_name="product_variants")
    op.drop_table("product_variants")
    op.drop_index(op.f("ix_product_images_created_at"), table_name="product_images")
    op.drop_index("ix_product_images_product_sort", table_name="product_images")
    op.drop_index(op.f("ix_product_images_product_id"), table_name="product_images")
    op.drop_index(op.f("ix_product_images_id"), table_name="product_images")
    op.drop_table("product_images")
    op.drop_index("ix_products_sort_order", table_name="products")
    op.drop_index("ix_products_active_category", table_name="products")
    op.drop_index("ix_products_active_created_at", table_name="products")
    op.drop_index(op.f("ix_products_category_id"), table_name="products")
    with op.batch_alter_table("products") as batch_op:
        batch_op.drop_constraint("fk_products_category_id_categories", type_="foreignkey")
        for column in ["sort_order", "seo_description", "seo_title", "care_instructions", "material", "compare_at_price_cents", "short_description", "category_id"]:
            batch_op.drop_column(column)
    op.drop_index(op.f("ix_categories_created_at"), table_name="categories")
    op.drop_index("ix_categories_active_sort", table_name="categories")
    op.drop_index(op.f("ix_categories_slug"), table_name="categories")
    op.drop_index(op.f("ix_categories_id"), table_name="categories")
    op.drop_table("categories")
