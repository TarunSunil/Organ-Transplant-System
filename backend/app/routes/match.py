from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app import models, schemas, database

router = APIRouter()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def match_donor_recipient(donor_id: int, recipient_id: int, db: Session = Depends(get_db)):
    donor = db.query(models.Donor).filter(models.Donor.id == donor_id).first()
    recipient = db.query(models.Recipient).filter(models.Recipient.id == recipient_id).first()

    if not donor or not recipient:
        raise HTTPException(status_code=404, detail="Donor or Recipient not found")

    score = 0
    if donor.blood_type == recipient.blood_type:
        score += 50
    if donor.organ.lower() == recipient.organ_needed.lower():
        score += 50

    return {"donor": donor.name, "recipient": recipient.name, "match_score": score}

@router.post("/allocate/{donor_id}/{recipient_id}", response_model=schemas.AllocationLog)
def allocate_organs(donor_id: int, recipient_id: int, db: Session = Depends(get_db)):
    donor = db.query(models.Donor).filter(models.Donor.id == donor_id).first()
    recipient = db.query(models.Recipient).filter(models.Recipient.id == recipient_id).first()

    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")

    if donor.status != "available":
        raise HTTPException(status_code=400, detail="Donor not available")
    if recipient.status != "waiting":
        raise HTTPException(status_code=400, detail="Recipient not waiting")

    score = 0
    if donor.blood_type == recipient.blood_type:
        score += 50
    if donor.organ.lower() == recipient.organ_needed.lower():
        score += 50

    donor.status = "allocated"
    recipient.status = "matched"

    log = models.AllocationLog(
        donor_id=donor.id,
        recipient_id=recipient.id,
        match_score=score,
        timestamp=datetime.utcnow()
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    return log
