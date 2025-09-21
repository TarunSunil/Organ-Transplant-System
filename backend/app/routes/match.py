from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app import models, schemas, database
import google.generativeai as genai
import os
import json
from dotenv import load_dotenv
load_dotenv()
router = APIRouter()

# Setup Gemini with API Key (set it in your environment variables). Different library versions expose either configure() or set_api_key.
API_KEY = os.getenv("GOOGLE_API_KEY")
if API_KEY:
    # Try both patterns for compatibility
    if hasattr(genai, "configure"):
        try:
            genai.configure(api_key=API_KEY)  # type: ignore[attr-defined]
        except Exception:
            pass
    if hasattr(genai, "set_api_key"):
        try:
            genai.set_api_key(API_KEY)  # type: ignore[attr-defined]
        except Exception:
            pass
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

MATCH_THRESHOLD = 70  # Adjust threshold as needed

@router.post("/ai-match/{donor_id}")
def ai_match_donor(donor_id: int, db: Session = Depends(get_db)):
    donor = db.query(models.Donor).filter(models.Donor.id == donor_id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")
    # Access status via getattr to avoid SQLAlchemy boolean evaluation issues in some analyzers
    if getattr(donor, "status", None) != "available":
        raise HTTPException(status_code=400, detail="Donor not available")

    recipients = db.query(models.Recipient).filter(models.Recipient.status == "waiting").all()
    if not recipients:
        return {"donor": donor.name, "recipient": None, "ai_match": "No waiting recipients found."}

    best_match = None
    best_score = -1
    best_ai_output = None
    candidate_matches = []  # collect all valid matches for top-3 list

    # Some versions use GenerativeModel, others provide generate_content directly via model name; fallback if attribute missing.
    model = None
    if hasattr(genai, "GenerativeModel"):
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")  # type: ignore[attr-defined]
        except Exception:
            model = None

    def generate(prompt: str):
        if model and hasattr(model, "generate_content"):
            return model.generate_content(prompt)  # type: ignore[no-any-return]
        # Fallback attempt if direct function exists
        if hasattr(genai, "generate_content"):
            return genai.generate_content(prompt)  # type: ignore[attr-defined]
        raise RuntimeError("Gemini generation method not available")

    for recipient in recipients:
        prompt = f"""
        You are an AI medical assistant helping with organ transplant matching.
        Here is the donor and recipient information:

        Donor:
        - Name: {donor.name}
        - Blood Type: {donor.blood_type}
        - Organ: {donor.organ}
        - Status: {donor.status}

        Recipient:
        - Name: {recipient.name}
        - Blood Type: {recipient.blood_type}
        - Organ Needed: {recipient.organ_needed}
        - Status: {recipient.status}

        Task: Based on standard organ transplant practices (blood type compatibility,
        same organ type), give me a match score between 0 and 100, and explain briefly why.
        Return JSON in this format:
        {{
          "match_score": <number>,
          "reason": "<short explanation>"
        }}
        """

        try:
            response = generate(prompt)
        except Exception:
            continue
        try:
            cleaned = response.text.strip().replace("```json", "").replace("```", "").strip()
            ai_output = json.loads(cleaned)
            score = int(ai_output.get("match_score", 0))
        except Exception:
            continue  # skip if AI output is invalid

        # add to candidate list
        candidate_matches.append({
            "recipient_id": recipient.id,
            "recipient_name": recipient.name,
            "blood_type": recipient.blood_type,
            "organ_needed": recipient.organ_needed,
            "urgency_level": getattr(recipient, "urgency_level", None),
            "location": getattr(recipient, "location", None),
            "match_score": score,
            "reason": ai_output.get("reason", "")
        })

        if score > best_score:
            best_score = score
            best_match = recipient
            best_ai_output = ai_output

    # sort candidate matches descending by score and slice top 3
    top_matches = sorted(candidate_matches, key=lambda m: m["match_score"], reverse=True)[:3]

    if best_score >= MATCH_THRESHOLD and best_match:
        # Allocate only the best match
        donor.status = "allocated"  # type: ignore[assignment]
        best_match.status = "matched"  # type: ignore[assignment]
        log = models.AllocationLog(
            donor_id=donor.id,
            recipient_id=best_match.id,
            match_score=best_score,
            timestamp=datetime.utcnow()
        )
        db.add(log)
        db.commit()
        db.refresh(log)

        return {
            "donor": donor.name,
            "recipient": best_match.name,
            "ai_match": best_ai_output,
            "top_matches": top_matches
        }

    # If no allocation because below threshold but we have at least one candidate, optionally record as pending (non-allocating log)
    if top_matches:
        top = top_matches[0]
        # Do not change donor/recipient statuses, just record informational log if not already recorded for this donor & recipient combination recently
        existing = db.query(models.AllocationLog).filter(
            models.AllocationLog.donor_id == donor.id,
            models.AllocationLog.recipient_id == top.get("recipient_id")
        ).order_by(models.AllocationLog.timestamp.desc()).first()
        if not existing or (datetime.utcnow() - existing.timestamp).total_seconds() > 300:
            log = models.AllocationLog(
                donor_id=donor.id,
                recipient_id=top.get("recipient_id"),
                match_score=top.get("match_score", 0),
                timestamp=datetime.utcnow()
            )
            db.add(log)
            db.commit()

    return {
        "donor": donor.name,
        "recipient": None,
        "ai_match": "No suitable match found above threshold.",
        "top_matches": top_matches
    }
