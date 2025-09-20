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


@router.post("/auto-match/{donor_id}", response_model=schemas.AllocationLog)
def auto_match_donor(donor_id: int, db: Session = Depends(get_db)):
    donor = db.query(models.Donor).filter(models.Donor.id == donor_id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")

    if donor.status != "available":
        raise HTTPException(status_code=400, detail="Donor not available")

    # Get all waiting recipients
    recipients = db.query(models.Recipient).filter(models.Recipient.status == "waiting").all()
    if not recipients:
        raise HTTPException(status_code=404, detail="No waiting recipients found")

    # Simple scoring logic (can be replaced with AI)
    def score_match(recipient: models.Recipient) -> int:
        score = 0
        if donor.blood_type == recipient.blood_type:
            score += 50
        if donor.organ.lower() == recipient.organ_needed.lower():
            score += 50
        if donor.location and recipient.location and donor.location.lower() == recipient.location.lower():
            score += 20
        return score

    # Pick recipient with highest score
    best_recipient = max(recipients, key=score_match)
    best_score = score_match(best_recipient)

    if best_score == 0:
        raise HTTPException(status_code=400, detail="No suitable match found")

    # Update statuses
    donor.status = "allocated"
    best_recipient.status = "matched"

    # Log allocation
    log = models.AllocationLog(
        donor_id=donor.id,
        recipient_id=best_recipient.id,
        match_score=best_score,
        timestamp=datetime.utcnow()
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    return log
