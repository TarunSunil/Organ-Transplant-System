from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import models, database

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
def get_recent_matches(db: Session = Depends(get_db), limit: int = 50):
    # newest first
    q = db.query(models.AllocationLog).order_by(models.AllocationLog.timestamp.desc())
    if limit:
        q = q.limit(limit)
    logs = q.all()
    results = []
    donor_cache = {}
    recipient_cache = {}
    for log in logs:
        donor = donor_cache.get(log.donor_id) or db.query(models.Donor).filter(models.Donor.id == log.donor_id).first()
        donor_cache[log.donor_id] = donor
        recipient = recipient_cache.get(log.recipient_id) or db.query(models.Recipient).filter(models.Recipient.id == log.recipient_id).first()
        recipient_cache[log.recipient_id] = recipient
        results.append({
            "id": log.id,
            "donor": donor.name if donor else "Unknown",
            "recipient": recipient.name if recipient else "Unknown",
            "score": log.match_score,
            "time": log.timestamp.isoformat()
        })
    return results
