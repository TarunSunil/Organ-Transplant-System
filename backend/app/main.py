from fastapi import FastAPI
from app import models, database
from app.routes import donors, recipients, match, logs
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Organ Transplant System")

# Allow frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
models.Base.metadata.create_all(bind=database.engine)

# Include routers
app.include_router(donors.router, prefix="/donors", tags=["Donors"])
app.include_router(recipients.router, prefix="/recipients", tags=["Recipients"])
app.include_router(match.router, prefix="/match", tags=["Matching"])
app.include_router(logs.router, prefix="/logs", tags=["Logs"])
