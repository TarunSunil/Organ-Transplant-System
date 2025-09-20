from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models, database
from .routes import donors, recipients, match, logs

app = FastAPI(title="Organ Transplant System")

# CORS Middleware
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
