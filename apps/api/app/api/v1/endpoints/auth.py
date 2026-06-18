from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.config import settings
from app.core.rate_limit import limiter
from app.core.security import create_access_token
from app.crud.user import authenticate_user, create_user, get_user_by_email
from app.models.user import User
from app.schemas.user import BootstrapAdminCreate, Token, UserCreate, UserRead

router = APIRouter()


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
@limiter.limit(settings.RATE_LIMIT_AUTH)
def register(request: Request, payload: UserCreate, db: Session = Depends(get_db)):
    if not settings.ALLOW_PUBLIC_REGISTRATION:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Public registration is disabled.")
    if get_user_by_email(db, payload.email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered.")
    return create_user(db, payload, is_admin=False)


@router.post("/bootstrap-admin", response_model=UserRead, status_code=status.HTTP_201_CREATED)
@limiter.limit(settings.RATE_LIMIT_AUTH)
def bootstrap_admin(request: Request, payload: BootstrapAdminCreate, db: Session = Depends(get_db)):
    if not settings.BOOTSTRAP_ADMIN_TOKEN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bootstrap admin token is not configured.")
    if payload.bootstrap_token != settings.BOOTSTRAP_ADMIN_TOKEN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid bootstrap token.")
    if db.query(User).filter(User.is_admin.is_(True)).count() > 0:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Admin user already exists.")
    if get_user_by_email(db, payload.email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered.")
    user_payload = UserCreate(email=payload.email, full_name=payload.full_name, password=payload.password)
    return create_user(db, user_payload, is_admin=True)


@router.post("/login", response_model=Token)
@limiter.limit(settings.RATE_LIMIT_AUTH)
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = authenticate_user(db, form_data.username, form_data.password)

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

    return Token(access_token=create_access_token(subject=user.id))


@router.get("/me", response_model=UserRead)
def read_me(current_user: User = Depends(get_current_user)):
    return current_user
