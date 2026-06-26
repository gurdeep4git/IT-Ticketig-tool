from datetime import datetime
from typing import Annotated, Optional
from pydantic import BaseModel, ConfigDict, Field

class TicketCreate(BaseModel):
    title:Annotated[str, Field(..., max_length=50)]
    description : Annotated[str, Field(..., max_length=200)]
    priority : Annotated[str, Field(..., max_length=10)]

class TicketUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=50)
    description: str | None = Field(default=None, max_length=200)


class AssigneeResponse(BaseModel):
    id: int
    first_name: str
    last_name:str
    email:str

    model_config = ConfigDict(from_attributes=True)
    
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
    assignee: Optional[AssigneeResponse] = None

    model_config = {"from_attributes": True} 



