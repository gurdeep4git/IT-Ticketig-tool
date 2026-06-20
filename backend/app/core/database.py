from fastapi import Depends
from typing_extensions import Annotated
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker


# If your password contains special characters like '@', URL-encode them.
SQLALCHEMY_DB_URL = "postgresql://postgres:admin%402026@localhost/TicketingDatabse"

engine = create_engine(SQLALCHEMY_DB_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Define the reusable dependency alias here!
db_dependency = Annotated[Session, Depends(get_db)]        