from sqlalchemy import Column, Integer, String
from ..core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(50), unique=True, index=True)
    first_name = Column(String(20), nullable=False)
    last_name = Column(String(20), nullable=False)
    password_hash = Column(String(100), nullable=False)
    phone_number = Column(String(15), nullable=False)
    role = Column(String(20), nullable=False)
    is_active = Column(Integer, default=1)