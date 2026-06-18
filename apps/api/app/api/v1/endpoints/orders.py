import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin, get_current_user, get_db
from app.core.config import settings
from app.core.rate_limit import limiter
from app.crud.order import create_guest_order, create_order_from_cart, get_order_by_id, get_orders, get_user_orders, update_order_status
from app.models.user import User
from app.schemas.order import CheckoutCreate, GuestCheckoutCreate, OrderRead, OrderStatusUpdate
from app.services.email import send_admin_new_order_email, send_order_confirmation_email

router = APIRouter()
logger = logging.getLogger(__name__)


def _send_order_emails(order):
    try:
        send_order_confirmation_email(order)
        send_admin_new_order_email(order)
    except Exception:
        logger.exception("Order email failed; checkout remains successful.")


# Legacy/internal logged-in checkout. This endpoint is kept only for future authenticated-user carts.
# Public storefront must use /api/v1/orders/guest-checkout.
# Do not expose this endpoint in the frontend before idempotency and full order item snapshots are implemented.
@router.post("/checkout", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def checkout(
    payload: CheckoutCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = create_order_from_cart(db, current_user.id, payload)
    _send_order_emails(order)
    return order


@router.post("/guest-checkout", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
@limiter.limit(settings.RATE_LIMIT_CHECKOUT)
def guest_checkout(request: Request, payload: GuestCheckoutCreate, db: Session = Depends(get_db)):
    order = create_guest_order(db, payload, customer_ip=request.client.host if request.client else None, user_agent=request.headers.get("user-agent"))
    _send_order_emails(order)
    return order


@router.get("/me", response_model=list[OrderRead])
def read_my_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_user_orders(db, current_user.id)


@router.get("/", response_model=list[OrderRead])
def read_orders(db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    return get_orders(db)


@router.patch("/{order_id}/status", response_model=OrderRead)
def change_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    order = get_order_by_id(db, order_id)

    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")

    return update_order_status(db, order, payload.status, actor_user_id=current_admin.id)
