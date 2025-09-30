from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import os, json
from dotenv import load_dotenv

from .. import models, database  # type: ignore
from . import logs  # noqa: F401  (ensure router dependencies loaded)
from . import donors, recipients  # noqa: F401
from ..utils.enhanced_matching import EnhancedMatcher

load_dotenv()
router = APIRouter()

# Optional AI (fallback / legacy) -------------------------------------------------
try:
    import google.generativeai as genai  # type: ignore
except Exception:  # pragma: no cover
    genai = None  # type: ignore

API_KEY = os.getenv("GOOGLE_API_KEY")
AI_ENABLED = bool(API_KEY and genai)
MODEL = None
if AI_ENABLED and genai:
    try:
        if hasattr(genai, "configure"):
            genai.configure(api_key=API_KEY)  # type: ignore
        MODEL = getattr(genai, "GenerativeModel", lambda *_a, **_k: None)("gemini-1.5-flash")
    except Exception:  # pragma: no cover
        AI_ENABLED = False
        MODEL = None
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

MATCH_THRESHOLD = 70


@router.get("/top-matches/{donor_id}")
def top_matches(donor_id: int, db: Session = Depends(get_db)):
    """Return structured top matches using deterministic EnhancedMatcher.
    Also auto-log the best overall match (threshold >=50)."""
    donor = db.query(models.Donor).filter(models.Donor.id == donor_id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")

    waiting = db.query(models.Recipient).filter(models.Recipient.status == "waiting").all()
    if not waiting:
        return {"donor_id": donor.id, "donor_name": donor.name, "matches": [], "log_message": "No waiting recipients."}

    scored = EnhancedMatcher.find_best_matches(donor, waiting, limit=5)
    if not scored:
        return {"donor_id": donor.id, "donor_name": donor.name, "matches": [], "log_message": "No medically compatible recipients."}

    # Build response list
    response_matches = []
    top_rec = None
    top_score = -1.0
    for rec, scores in scored:
        entry = {
            "recipient_id": rec.id,
            "recipient_name": rec.name,
            "blood_type": rec.blood_type,
            "organ_needed": rec.organ_needed,
            "location": rec.location,
            "urgency_level": getattr(rec, "urgency_level", None),
            **scores,
        }
        response_matches.append(entry)
        if scores["overall_score"] > top_score:
            top_score = scores["overall_score"]
            top_rec = rec

    log_message = ""
    if top_rec and top_score >= 50:
        log = models.AllocationLog(
            donor_id=donor.id,
            recipient_id=top_rec.id,
            match_score=int(round(top_score)),
            timestamp=datetime.utcnow()
        )
        db.add(log)
        db.commit()
        log_message = f"Top match automatically logged: Donor {donor.name} -> Recipient {top_rec.name} (Score: {top_score:.1f}%)"
    elif top_rec:
        log_message = f"Top match below logging threshold: {top_score:.1f}%"
    else:
        log_message = "No viable matches."  # Should not occur if scored non-empty

    return {
        "donor_id": donor.id,
        "donor_name": donor.name,
        "matches": response_matches[:3],  # only show top 3 to client
        "log_message": log_message
    }


@router.post("/ai-match/{donor_id}")
def ai_match_legacy(donor_id: int, db: Session = Depends(get_db)):
    """Legacy AI-driven endpoint (optional). Prefer /top-matches for deterministic scoring."""
    if not AI_ENABLED:
        raise HTTPException(status_code=503, detail="AI matching disabled")
    donor = db.query(models.Donor).filter(models.Donor.id == donor_id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")
    # Explicit string comparison to avoid SQLAlchemy ColumnElement truthiness issues
    if str(getattr(donor, "status", "")) != "available":
        raise HTTPException(status_code=400, detail="Donor not available")

    recipients = db.query(models.Recipient).filter(models.Recipient.status == "waiting").all()
    if not recipients:
        return {"donor": donor.name, "recipient": None, "ai_match": "No waiting recipients found."}

    best = None
    best_score = -1
    best_payload = None
    for r in recipients:
        prompt = f"Donor BT {donor.blood_type} organ {donor.organ} vs Recipient BT {r.blood_type} organ {r.organ_needed}. Return JSON: {{'match_score': <0-100>, 'reason': '<why>'}}"
        try:
            resp = MODEL.generate_content(prompt)  # type: ignore
            cleaned = resp.text.replace("```json", "").replace("```", "").strip()  # type: ignore
            data = json.loads(cleaned)
            score = int(data.get("match_score", 0))
        except Exception:
            continue
        if score > best_score:
            best_score = score
            best = r
            best_payload = data

    if best and best_score >= MATCH_THRESHOLD:
        donor.status = "allocated"  # type: ignore
        best.status = "matched"  # type: ignore
        log = models.AllocationLog(
            donor_id=donor.id,
            recipient_id=best.id,
            match_score=best_score,
            timestamp=datetime.utcnow()
        )
        db.add(log)
        db.commit()
        return {"donor": donor.name, "recipient": best.name, "ai_match": best_payload}

    return {"donor": donor.name, "recipient": None, "ai_match": "No suitable match found above threshold."}
