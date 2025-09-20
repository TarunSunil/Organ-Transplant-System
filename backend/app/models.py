from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.database import Base
from datetime import datetime

class Donor(Base):
    __tablename__ = "donors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    blood_type = Column(String, index=True)
    age = Column(Integer)
    location = Column(String, nullable=True)  # ✅ add this line
    organ = Column(String, index=True)
    status = Column(String, default="available")
class Recipient(Base):
    __tablename__ = "recipients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    blood_type = Column(String, nullable=False)
    organ_needed = Column(String, nullable=False)   # 👈 important
    urgency_level = Column(Integer, default=1)
    location = Column(String, nullable=True)
    status = Column(String, default="waiting")
    age = Column(Integer, nullable=True)

class AllocationLog(Base):
    __tablename__ = "allocation_logs"
    id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer, ForeignKey("donors.id"))
    recipient_id = Column(Integer, ForeignKey("recipients.id"))
    match_score = Column(Integer, nullable=False)
    timestamp = Column(DateTime, nullable=False)


class TransportLog(Base):
    __tablename__ = "transport_logs"

    id = Column(Integer, primary_key=True, index=True)
    allocation_id = Column(Integer, ForeignKey("allocation_logs.id"))
    donor_location = Column(String)
    recipient_location = Column(String)
    status = Column(String, default="pending")  # pending, in-transit, delivered
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)

    # NEW fields for AI logistics
    estimated_time_minutes = Column(Integer, nullable=True)
    suggested_route = Column(String, nullable=True)