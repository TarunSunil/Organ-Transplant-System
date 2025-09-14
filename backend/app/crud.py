from sqlalchemy.orm import Session
from . import models, schemas

def create_donor(db: Session, donor: schemas.DonorCreate):
    db_donor = models.Donor(name=donor.name, blood_type=donor.blood_type, organ=donor.organ)
    db.add(db_donor)
    db.commit()
    db.refresh(db_donor)
    return db_donor

def get_donors(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.Donor).offset(skip).limit(limit).all()
