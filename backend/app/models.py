from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.database import Base


class Donor(Base):
    __tablename__ = "donors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    blood_type = Column(String, nullable=False)
    organ = Column(String, nullable=False)
class Recipient(Base):
    __tablename__ = "recipients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    blood_type = Column(String, nullable=False)
    organ_needed = Column(String, nullable=False)   # 👈 important
    urgency_level = Column(Integer, default=1)
    location = Column(String, nullable=True)
    status = Column(String, default="waiting")

class AllocationLog(Base):
    __tablename__ = "allocation_logs"
    id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer, ForeignKey("donors.id"))
    recipient_id = Column(Integer, ForeignKey("recipients.id"))
    match_score = Column(Integer, nullable=False)
    timestamp = Column(DateTime, nullable=False)