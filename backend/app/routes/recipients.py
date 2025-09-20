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

@router.post("/", response_model=schemas.Recipient)
def create_recipient(recipient: schemas.RecipientCreate, db: Session = Depends(get_db)):
    db_recipient = models.Recipient(**recipient.model_dump())
    db.add(db_recipient)
    db.commit()
    db.refresh(db_recipient)
    return db_recipient

@router.get("/", response_model=list[schemas.Recipient])
def get_recipients(db: Session = Depends(get_db)):
    return db.query(models.Recipient).all()
