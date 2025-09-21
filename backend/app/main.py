from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app import models, database
from app.routes import donors, recipients, match, logs, transport  # ✅ import transport

app = FastAPI(title="Organ Transplant System")

# --- CORS Middleware ---
origins = [
    "http://localhost:3000",  # frontend React app
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Create DB tables ---
models.Base.metadata.create_all(bind=database.engine)

# --- Register Routers ---
app.include_router(donors.router, prefix="/donors", tags=["Donors"])
app.include_router(recipients.router, prefix="/recipients", tags=["Recipients"])
app.include_router(match.router, prefix="/match", tags=["Matching"])
app.include_router(logs.router, prefix="/logs", tags=["Logs"])
app.include_router(transport.router, prefix="/transport", tags=["Transport"])  # ✅ new
