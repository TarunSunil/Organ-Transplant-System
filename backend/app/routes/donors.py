from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import crud, schemas, database

router = APIRouter(prefix="/donors", tags=["donors"])

@router.post("/", response_model=schemas.Donor)
def create_donor(donor: schemas.DonorCreate, db: Session = Depends(database.get_db)):
    return crud.create_donor(db=db, donor=donor)

@router.get("/", response_model=list[schemas.Donor])
def list_donors(skip: int = 0, limit: int = 10, db: Session = Depends(database.get_db)):
    return crud.get_donors(db, skip=skip, limit=limit)
