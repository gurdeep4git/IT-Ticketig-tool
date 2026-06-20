from typing import Annotated
from pydantic import BaseModel, Field

class UserBase(BaseModel):
    email: Annotated[str, Field(..., max_length=20)]
    first_name: Annotated[str, Field(..., max_length=20)]
    last_name: Annotated[str, Field(..., max_length=20)]
    phone_number: Annotated[str, Field(..., max_length=15)]
    role: Annotated[str, Field(..., max_length=20)]
    is_active: Annotated[int, Field(default=1)]

class UserCreate(UserBase):
    password: Annotated[str, Field(..., max_length=10)]   

class LoginRequest(BaseModel):
    email: Annotated[str, Field(..., max_length=20)]
    password: Annotated[str, Field(max_length=15)]    
