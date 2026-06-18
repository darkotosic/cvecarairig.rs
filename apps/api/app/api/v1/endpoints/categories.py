from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.crud.category import get_categories
from app.schemas.category import CategoryRead

router = APIRouter()


@router.get("/", response_model=list[CategoryRead])
def read_categories(db: Session = Depends(get_db)):
    return get_categories(db)
