from pydantic import BaseModel

class DonorBase(BaseModel):
    name: str
    blood_type: str
    organ: str

class DonorCreate(DonorBase):
    pass

class Donor(DonorBase):
    id: int

    class Config:
        from_attributes = True
