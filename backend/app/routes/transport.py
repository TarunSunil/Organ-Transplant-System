# app/routes/transport.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app import models, database, schemas
import google.generativeai as genai
import os
from dotenv import load_dotenv
load_dotenv()
router = APIRouter()

# --- Setup Gemini API Key ---
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# --- DB Dependency ---
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- Start Transport with AI ETA & Route ---
@router.post("/start/{allocation_id}", response_model=schemas.TransportLog)
def start_transport_ai(allocation_id: int, db: Session = Depends(get_db)):
    allocation = db.query(models.AllocationLog).filter(models.AllocationLog.id == allocation_id).first()
    if not allocation:
        raise HTTPException(status_code=404, detail="Allocation not found")

    # Check if transport already started
    existing_transport = db.query(models.TransportLog).filter(models.TransportLog.allocation_id == allocation_id).first()
    if existing_transport:
        raise HTTPException(status_code=400, detail="Transport already started for this allocation")

    donor = db.query(models.Donor).filter(models.Donor.id == allocation.donor_id).first()
    recipient = db.query(models.Recipient).filter(models.Recipient.id == allocation.recipient_id).first()

    if not donor or not recipient:
        raise HTTPException(status_code=404, detail="Donor or Recipient not found")

    # Ask AI for route and ETA
    prompt = f"""
    You are an AI logistics assistant.
    Plan the best route to transport an organ from donor to recipient.

    Donor Location: {donor.location}
    Recipient Location: {recipient.location}

    Consider speed, safety, and urgency. Give me:
    - Estimated transport time in minutes
    - Suggested route as text
    Return JSON in this format:
    {{
        "eta_minutes": <number>,
        "route": "<text description>"
    }}
    """

    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)

    try:
        import json
        ai_output = response.text.strip()
        result = json.loads(ai_output)
        eta = result.get("eta_minutes", 60)  # default to 60 min
        route = result.get("route", "No route suggested")
    except Exception:
        raise HTTPException(status_code=500, detail="AI output invalid")

    transport = models.TransportLog(
        allocation_id=allocation.id,
        donor_location=donor.location,
        recipient_location=recipient.location,
        status="in-transit",
        start_time=datetime.utcnow(),
        estimated_time_minutes=eta,
        suggested_route=route
    )
    db.add(transport)
    db.commit()
    db.refresh(transport)
    return transport


# --- Complete Transport ---
@router.post("/complete/{transport_id}", response_model=schemas.TransportLog)
def complete_transport(transport_id: int, db: Session = Depends(get_db)):
    transport = db.query(models.TransportLog).filter(models.TransportLog.id == transport_id).first()
    if not transport:
        raise HTTPException(status_code=404, detail="Transport not found")

    if transport.status == "delivered":
        raise HTTPException(status_code=400, detail="Transport already completed")

    transport.status = "delivered"
    transport.end_time = datetime.utcnow()
    db.commit()
    db.refresh(transport)
    return transport


# --- Get All Transports ---
@router.get("/", response_model=list[schemas.TransportLog])
def get_transports(db: Session = Depends(get_db)):
    return db.query(models.TransportLog).all()