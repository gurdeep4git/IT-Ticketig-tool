from datetime import datetime
from typing import Annotated
from pydantic import BaseModel, Field

class TicketCreate(BaseModel):
    title:Annotated[str, Field(..., max_length=50)]
    description : Annotated[str, Field(..., max_length=200)]
    priority : Annotated[str, Field(..., max_length=10)]

class TicketUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=50)
    description: str | None = Field(default=None, max_length=200)

class AssignUpdate(BaseModel):
    assigned_to: int    

class PriorityUpdate(BaseModel):
    priority: str 

class StatusUpdate(BaseModel):
    status: str

class TicketResponse(TicketCreate):
    """For returning a ticket — includes server-generated fields"""
    id: int
    ticket_number: str
    status: str
    assigned_to:int | None = None 
    created_by: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True} 



