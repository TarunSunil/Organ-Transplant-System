from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, schemas, database

router = APIRouter()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=list[schemas.AllocationLog])
def get_logs(db: Session = Depends(get_db)):
    return db.query(models.AllocationLog).all()
