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

# --- Blood type compatibility helper ---
def is_blood_compatible(donor_bt: str, recipient_bt: str) -> bool:
    compatibility = {
        "O": ["O", "A", "B", "AB"],   # universal donor
        "A": ["A", "AB"],
        "B": ["B", "AB"],
        "AB": ["AB"]                  # universal recipient
    }
    return recipient_bt in compatibility.get(donor_bt, [])


# --- Match Donor and Recipient ---
@router.post("/")
def match_donor_recipient(donor_id: int, recipient_id: int, db: Session = Depends(get_db)):
    donor = db.query(models.Donor).filter(models.Donor.id == donor_id).first()
    recipient = db.query(models.Recipient).filter(models.Recipient.id == recipient_id).first()

    if not donor or not recipient:
        raise HTTPException(status_code=404, detail="Donor or Recipient not found")

    score = 0

    # Blood type
    if donor.blood_type == recipient.blood_type:
        score += 50
    elif is_blood_compatible(donor.blood_type, recipient.blood_type):
        score += 30

    # Organ match
    if donor.organ.lower() == recipient.organ_needed.lower():
        score += 50

    # Urgency bonus
    if hasattr(recipient, "urgency_level") and recipient.urgency_level:
        score += min(recipient.urgency_level * 10, 50)

    # Location bonus
    if donor.location and recipient.location:
        if donor.location.lower() == recipient.location.lower():
            score += 20

    return {"donor": donor.name, "recipient": recipient.name, "match_score": score}


# --- Allocate Organ ---
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
    elif is_blood_compatible(donor.blood_type, recipient.blood_type):
        score += 30

    if donor.organ.lower() == recipient.organ_needed.lower():
        score += 50

    if hasattr(recipient, "urgency_level") and recipient.urgency_level:
        score += min(recipient.urgency_level * 10, 50)

    if donor.location and recipient.location:
        if donor.location.lower() == recipient.location.lower():
            score += 20

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


# --- Find Best Match for a Recipient ---
@router.get("/best-match/{recipient_id}")
def best_match(recipient_id: int, db: Session = Depends(get_db)):
    recipient = db.query(models.Recipient).filter(models.Recipient.id == recipient_id).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")

    available_donors = db.query(models.Donor).filter(models.Donor.status == "available").all()
    if not available_donors:
        raise HTTPException(status_code=404, detail="No available donors")

    best_donor = None
    best_score = -1

    for donor in available_donors:
        score = 0
        if donor.blood_type == recipient.blood_type:
            score += 50
        elif is_blood_compatible(donor.blood_type, recipient.blood_type):
            score += 30

        if donor.organ.lower() == recipient.organ_needed.lower():
            score += 50

        if hasattr(recipient, "urgency_level") and recipient.urgency_level:
            score += min(recipient.urgency_level * 10, 50)

        if donor.location and recipient.location:
            if donor.location.lower() == recipient.location.lower():
                score += 20

        if score > best_score:
            best_score = score
            best_donor = donor

    if not best_donor:
        raise HTTPException(status_code=404, detail="No suitable donor found")

    return {
        "recipient": recipient.name,
        "best_donor": best_donor.name,
        "match_score": best_score
    }
