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

@router.post("/", response_model=schemas.Donor)
def create_donor(donor: schemas.DonorCreate, db: Session = Depends(get_db)):
    db_donor = models.Donor(**donor.model_dump())
    db.add(db_donor)
    db.commit()
    db.refresh(db_donor)
    return db_donor

@router.get("/", response_model=list[schemas.Donor])
def get_donors(db: Session = Depends(get_db)):
    return db.query(models.Donor).all()
