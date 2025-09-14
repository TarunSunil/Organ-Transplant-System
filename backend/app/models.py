from sqlalchemy import Column, Integer, String
from .database import Base

class Donor(Base):
    __tablename__ = "donors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    blood_type = Column(String, nullable=False)
    organ = Column(String, nullable=False)
