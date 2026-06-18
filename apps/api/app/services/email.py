import logging
import smtplib
from email.message import EmailMessage

from app.core.config import settings
from app.models.order import Order

logger = logging.getLogger(__name__)


def _smtp_configured() -> bool:
    return bool(settings.SMTP_HOST and settings.SMTP_FROM_EMAIL)


def _send_email(to_email: str, subject: str, body: str) -> None:
    if not _smtp_configured():
        logger.info("SMTP not configured; skipped order email")
        return

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    message["To"] = to_email
    message.set_content(body)

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as smtp:
        if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
            smtp.starttls()
            smtp.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        smtp.send_message(message)


def send_order_confirmation_email(order: Order) -> None:
    if not order.customer_email:
        logger.info("SMTP not configured; skipped order email" if not _smtp_configured() else "Customer email missing; skipped order email")
        return
    _send_email(
        order.customer_email,
        f"Potvrda porudžbine {order.order_number}",
        f"Poštovani {order.customer_name},\n\nPrimili smo porudžbinu {order.order_number}. Kontaktiraćemo vas radi potvrde.\n",
    )


def send_admin_new_order_email(order: Order) -> None:
    if not settings.SMTP_FROM_EMAIL:
        logger.info("SMTP not configured; skipped order email")
        return
    _send_email(
        settings.SMTP_FROM_EMAIL,
        f"Nova porudžbina {order.order_number}",
        f"Nova porudžbina {order.order_number} ukupno {order.total_cents / 100:.2f} {order.currency}.",
    )
