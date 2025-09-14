from fastapi import FastAPI
from .database import Base, engine
from .routes import donors

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Organ Transplant System")

# Include routes
app.include_router(donors.router)

@app.get("/")
def root():
    return {"message": "Organ Transplant System API is running"}
