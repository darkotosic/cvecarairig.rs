from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.crud.cart import add_item_to_cart, get_or_create_active_cart, remove_cart_item, update_cart_item
from app.models.user import User
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartRead

router = APIRouter()


@router.get("/", response_model=CartRead)
def read_cart(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_or_create_active_cart(db, current_user.id)


@router.post("/items", response_model=CartRead, status_code=status.HTTP_201_CREATED)
def add_cart_item(
    payload: CartItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return add_item_to_cart(db, current_user.id, payload)


@router.patch("/items/{item_id}", response_model=CartRead)
def edit_cart_item(
    item_id: int,
    payload: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_cart_item(db, current_user.id, item_id, payload)


@router.delete("/items/{item_id}", response_model=CartRead)
def delete_cart_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return remove_cart_item(db, current_user.id, item_id)
