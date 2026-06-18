from fastapi import HTTPException, status
from sqlalchemy.orm import Session, selectinload

from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.schemas.cart import CartItemCreate, CartItemUpdate


def get_active_cart(db: Session, user_id: int) -> Cart | None:
    return (
        db.query(Cart)
        .options(selectinload(Cart.items).selectinload(CartItem.product))
        .filter(Cart.user_id == user_id, Cart.status == "active")
        .first()
    )


def get_or_create_active_cart(db: Session, user_id: int) -> Cart:
    cart = get_active_cart(db, user_id)
    if cart:
        return cart

    cart = Cart(user_id=user_id, status="active")
    db.add(cart)
    db.commit()
    db.refresh(cart)
    return get_active_cart(db, user_id) or cart


def add_item_to_cart(db: Session, user_id: int, payload: CartItemCreate) -> Cart:
    product = db.get(Product, payload.product_id)
    if not product or not product.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    if product.stock_quantity < payload.quantity:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient stock.")

    cart = get_or_create_active_cart(db, user_id)

    item = (
        db.query(CartItem)
        .filter(CartItem.cart_id == cart.id, CartItem.product_id == payload.product_id)
        .first()
    )

    if item:
        new_quantity = item.quantity + payload.quantity
        if product.stock_quantity < new_quantity:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient stock.")
        item.quantity = new_quantity
    else:
        item = CartItem(cart_id=cart.id, product_id=payload.product_id, quantity=payload.quantity)
        db.add(item)

    db.commit()
    return get_or_create_active_cart(db, user_id)


def update_cart_item(db: Session, user_id: int, item_id: int, payload: CartItemUpdate) -> Cart:
    cart = get_or_create_active_cart(db, user_id)

    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found.")

    product = db.get(Product, item.product_id)
    if product and product.stock_quantity < payload.quantity:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient stock.")

    item.quantity = payload.quantity
    db.commit()
    return get_or_create_active_cart(db, user_id)


def remove_cart_item(db: Session, user_id: int, item_id: int) -> Cart:
    cart = get_or_create_active_cart(db, user_id)

    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found.")

    db.delete(item)
    db.commit()
    return get_or_create_active_cart(db, user_id)
