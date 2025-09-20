from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, database

router = APIRouter()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total_logs = db.query(models.AllocationLog).count()
    total_recipients = db.query(models.Recipient).count()
    pending_matches = db.query(models.AllocationLog).filter(models.AllocationLog.match_score < 80).count()
    successful_transplants = db.query(models.AllocationLog).filter(models.AllocationLog.match_score >= 80).count()

    return {
        "total_logs": total_logs,
        "active_recipients": total_recipients,
        "pending_matches": pending_matches,
        "successful_transplants": successful_transplants
    }

@router.get("/recent-matches")
def get_recent_matches(db: Session = Depends(get_db)):
    logs = db.query(models.AllocationLog).all()
    results = []

    for log in logs:
        donor = db.query(models.Donor).filter(models.Donor.id == log.donor_id).first()
        recipient = db.query(models.Recipient).filter(models.Recipient.id == log.recipient_id).first()
        results.append({
            "id": log.id,
            "donor": donor.name if donor else "Unknown",
            "recipient": recipient.name if recipient else "Unknown",
            "score": log.match_score,
            "time": log.timestamp.isoformat()  # send ISO string
        })

    return results
