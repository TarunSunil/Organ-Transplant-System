from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app import models, schemas, database
import google.generativeai as genai
import os

router = APIRouter()

# Setup Gemini with API Key (set it in your environment variables)
genai.configure(api_key=os.getenv("AIzaSyBHLhfwDH0mpJL3XaeV1---bU2KJIcTVvs"))

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/ai-match")
def ai_match_donor_recipient(donor_id: int, recipient_id: int, db: Session = Depends(get_db)):
    donor = db.query(models.Donor).filter(models.Donor.id == donor_id).first()
    recipient = db.query(models.Recipient).filter(models.Recipient.id == recipient_id).first()

    if not donor or not recipient:
        raise HTTPException(status_code=404, detail="Donor or Recipient not found")

    # Build a prompt for Gemini
    prompt = f"""
    You are an AI medical assistant helping with organ transplant matching.
    Here is the donor and recipient information:

    Donor:
    - Name: {donor.name}
    - Age: {donor.age}
    - Blood Type: {donor.blood_type}
    - Organ: {donor.organ}
    - Status: {donor.status}

    Recipient:
    - Name: {recipient.name}
    - Age: {recipient.age}
    - Blood Type: {recipient.blood_type}
    - Organ Needed: {recipient.organ_needed}
    - Status: {recipient.status}

    Task: Based on standard organ transplant practices (blood type compatibility,
    same organ type, and approximate age compatibility), give me a match score between 0 and 100,
    and explain briefly why.
    Return JSON in this format:
    {{
      "match_score": <number>,
      "reason": "<short explanation>"
    }}
    """

    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)

    try:
        ai_output = response.text.strip()
    except Exception:
        raise HTTPException(status_code=500, detail="AI did not return a valid response")

    return {
        "donor": donor.name,
        "recipient": recipient.name,
        "ai_match": ai_output
    }

@router.post("/ai-allocate/{donor_id}/{recipient_id}", response_model=schemas.AllocationLog)
def ai_allocate_organs(donor_id: int, recipient_id: int, db: Session = Depends(get_db)):
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

    # Ask Gemini for the match score
    prompt = f"""
    Donor: Blood={donor.blood_type}, Organ={donor.organ}, Age={donor.age}
    Recipient: Blood={recipient.blood_type}, Organ Needed={recipient.organ_needed}, Age={recipient.age}

    Give a match score (0-100) for transplant compatibility.
    JSON format only: {{"match_score": <number>}}
    """

    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)

    try:
        ai_output = response.text.strip()
        import json
        result = json.loads(ai_output)
        score = result.get("match_score", 0)
    except Exception:
        raise HTTPException(status_code=500, detail="AI output invalid")

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
