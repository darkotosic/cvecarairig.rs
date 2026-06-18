from sqlalchemy.orm import Session

from app.models.product_image import ProductImage
from app.models.product_variant import ProductVariant
from app.schemas.product import ProductImageCreate, ProductImageUpdate, ProductVariantCreate, ProductVariantUpdate


def _clear_primary_images(db: Session, product_id: int) -> None:
    db.query(ProductImage).filter(ProductImage.product_id == product_id).update({ProductImage.is_primary: False})


def create_product_image(db: Session, product_id: int, payload: ProductImageCreate) -> ProductImage:
    if payload.is_primary:
        _clear_primary_images(db, product_id)
    image = ProductImage(product_id=product_id, **payload.model_dump())
    db.add(image)
    db.commit()
    db.refresh(image)
    return image


def update_product_image(db: Session, image: ProductImage, payload: ProductImageUpdate) -> ProductImage:
    data = payload.model_dump(exclude_unset=True)
    if data.get("is_primary") is True:
        _clear_primary_images(db, image.product_id)
    for field, value in data.items():
        setattr(image, field, value)
    db.add(image)
    db.commit()
    db.refresh(image)
    return image


def delete_product_image(db: Session, image: ProductImage) -> None:
    db.delete(image)
    db.commit()


def set_primary_product_image(db: Session, image: ProductImage) -> ProductImage:
    _clear_primary_images(db, image.product_id)
    image.is_primary = True
    db.add(image)
    db.commit()
    db.refresh(image)
    return image


def create_product_variant(db: Session, product_id: int, payload: ProductVariantCreate) -> ProductVariant:
    variant = ProductVariant(product_id=product_id, **payload.model_dump())
    db.add(variant)
    db.commit()
    db.refresh(variant)
    return variant


def update_product_variant(db: Session, variant: ProductVariant, payload: ProductVariantUpdate) -> ProductVariant:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(variant, field, value)
    db.add(variant)
    db.commit()
    db.refresh(variant)
    return variant


def delete_product_variant(db: Session, variant: ProductVariant) -> ProductVariant:
    variant.is_active = False
    db.add(variant)
    db.commit()
    db.refresh(variant)
    return variant
