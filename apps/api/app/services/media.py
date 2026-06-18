from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlparse

import cloudinary
import cloudinary.uploader
from fastapi import HTTPException, UploadFile, status

from app.core.config import settings

BLOCKED_SCHEMES = {"javascript", "data", "file"}
ALLOWED_IMAGE_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/avif"}
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".avif"}
MAX_IMAGE_BYTES = 5 * 1024 * 1024


@dataclass(frozen=True)
class UploadedProductImage:
    image_url: str
    content_type: str | None
    size_bytes: int


def get_media_provider() -> str:
    return settings.MEDIA_PROVIDER


def validate_image_url(image_url: str) -> str:
    value = image_url.strip()
    parsed = urlparse(value)
    if parsed.scheme.lower() in BLOCKED_SCHEMES:
        raise ValueError("Image URL scheme is not allowed.")
    if settings.APP_ENV.lower() == "production" and parsed.scheme.lower() != "https":
        raise ValueError("Image URL must use https in production.")
    if parsed.scheme.lower() not in {"http", "https"} or not parsed.netloc:
        raise ValueError("Image URL must be an absolute HTTP(S) URL.")
    return value


async def upload_product_image(file: UploadFile, product_id: int) -> UploadedProductImage:
    if file.content_type not in ALLOWED_IMAGE_MIME_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported image type.")

    if Path(file.filename or "").suffix.lower() not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported image extension.")

    content = await file.read()
    if len(content) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Image is larger than 5MB.")

    if get_media_provider() != "cloudinary":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cloudinary media provider is not enabled.")
    if not (settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET):
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Cloudinary is not configured.")

    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )
    result = cloudinary.uploader.upload(
        content,
        folder=f"simeonshop/products/{product_id}",
        resource_type="image",
        overwrite=False,
    )
    secure_url = result.get("secure_url")
    if not secure_url:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Cloudinary upload did not return a secure URL.")
    return UploadedProductImage(image_url=str(secure_url), content_type=file.content_type, size_bytes=len(content))


def create_signed_upload_placeholder() -> None:
    raise NotImplementedError("Signed uploads will be implemented later if direct browser uploads are needed.")
