from fastapi import FastAPI
from app import models, database
from app.routes import donors, recipients, match, logs

# Create tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Organ Transplant System")

# Include routers
app.include_router(donors.router, prefix="/donors", tags=["Donors"])
app.include_router(recipients.router, prefix="/recipients", tags=["Recipients"])
app.include_router(match.router, prefix="/match", tags=["Matching"])
app.include_router(logs.router, prefix="/logs", tags=["Logs"])
