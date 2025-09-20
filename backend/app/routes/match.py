from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app import models, schemas, database
import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()  # loads variables from .env
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

router = APIRouter()

# Setup Gemini with API Key (set it in your environment variables)
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

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
    if donor.status != "available":
        raise HTTPException(status_code=400, detail="Donor not available")

    recipients = db.query(models.Recipient).filter(models.Recipient.status == "waiting").all()
    if not recipients:
        return {"donor": donor.name, "recipient": None, "ai_match": "No waiting recipients found."}

    best_match = None
    best_score = -1
    best_ai_output = None

    model = genai.GenerativeModel("gemini-1.5-flash")

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

        response = model.generate_content(prompt)
        try:
            ai_output = json.loads(response.text.strip().replace("```json", "").replace("```", "").strip())
            score = ai_output.get("match_score", 0)
        except Exception:
            continue  # skip if AI output is invalid

        if score > best_score:
            best_score = score
            best_match = recipient
            best_ai_output = ai_output

    if best_score >= MATCH_THRESHOLD and best_match:
        # Allocate
        donor.status = "allocated"
        best_match.status = "matched"
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
            "ai_match": best_ai_output
        }

    return {
        "donor": donor.name,
        "recipient": None,
        "ai_match": "No suitable match found above threshold."
    }
