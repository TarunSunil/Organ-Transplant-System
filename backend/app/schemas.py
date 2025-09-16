from pydantic import BaseModel
from datetime import datetime

# ---------------------------
# Donors
# ---------------------------
class DonorBase(BaseModel):
    name: str
    blood_type: str
    age: int
    organ: str
    location: str | None = None
    status: str = "available"

class DonorCreate(DonorBase):
    pass  # no need to repeat fields

class Donor(DonorBase):
    id: int
    class Config:
        from_attributes = True

# ---------------------------
# Recipients
# ---------------------------
class RecipientBase(BaseModel):
    name: str
    blood_type: str
    organ_needed: str
    urgency_level: int = 1
    location: str | None = None
    status: str = "waiting"

class RecipientCreate(RecipientBase):
    pass

class Recipient(RecipientBase):
    id: int
    class Config:
        from_attributes = True

# ---------------------------
# Allocation Logs
# ---------------------------
class AllocationLog(BaseModel):
    id: int
    donor_id: int
    recipient_id: int
    match_score: int
    timestamp: datetime

    class Config:
        from_attributes = True
