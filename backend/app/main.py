from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .core.database import engine
from .api import auth_router, tickets_router, user_router, dashboard_router

app = FastAPI()

models.Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router) 
app.include_router(tickets_router) 
app.include_router(user_router) 
app.include_router(dashboard_router) 