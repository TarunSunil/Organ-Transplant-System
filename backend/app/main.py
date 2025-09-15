from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app import models, schemas, database

# Create tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Organ Transplant System")

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------------------
# Donors
# ---------------------------
@app.post("/donors/", response_model=schemas.Donor)
def create_donor(donor: schemas.DonorCreate, db: Session = Depends(get_db)):
    db_donor = models.Donor(**donor.model_dump())
    db.add(db_donor)
    db.commit()
    db.refresh(db_donor)
    return db_donor

@app.get("/donors/", response_model=list[schemas.Donor])
def get_donors(db: Session = Depends(get_db)):
    return db.query(models.Donor).all()

# ---------------------------
# Recipients
# ---------------------------
@app.post("/recipients/", response_model=schemas.Recipient)
def create_recipient(recipient: schemas.RecipientCreate, db: Session = Depends(get_db)):
    db_recipient = models.Recipient(**recipient.model_dump())
    db.add(db_recipient)
    db.commit()
    db.refresh(db_recipient)
    return db_recipient

@app.get("/recipients/", response_model=list[schemas.Recipient])
def get_recipients(db: Session = Depends(get_db)):
    return db.query(models.Recipient).all()

# ---------------------------
# Matching (basic placeholder)
# ---------------------------
@app.post("/match/")
def match_donor_recipient(donor_id: int, recipient_id: int, db: Session = Depends(get_db)):
    donor = db.query(models.Donor).filter(models.Donor.id == donor_id).first()
    recipient = db.query(models.Recipient).filter(models.Recipient.id == recipient_id).first()

    if not donor or not recipient:
        raise HTTPException(status_code=404, detail="Donor or Recipient not found")

    # Simple score: +50 if blood matches, +50 if organ matches
    score = 0
    if donor.blood_type == recipient.blood_type:
        score += 50
    if donor.organ == recipient.organ_needed:
        score += 50

    # Log allocation
    log = models.AllocationLog(
        donor_id=donor.id,
        recipient_id=recipient.id,
        match_score=score,
        timestamp=datetime.utcnow()
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    return {"donor": donor.name, "recipient": recipient.name, "match_score": score}

# ---------------------------
# Logs
# ---------------------------
@app.get("/logs/", response_model=list[schemas.AllocationLog])
def get_logs(db: Session = Depends(get_db)):
    return db.query(models.AllocationLog).all()
