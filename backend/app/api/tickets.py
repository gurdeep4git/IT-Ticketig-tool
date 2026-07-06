
from io import BytesIO
import uuid
from datetime import datetime
from fastapi import APIRouter, File, HTTPException, UploadFile
import pandas as pd
from sqlalchemy.exc import IntegrityError
from starlette import status
from ..enums.enum import TicketStatus, TicketPriority
from ..core.security import user_dependency
from ..core.database import db_dependency
from ..models import Ticket, User
from ..schemas import TicketResponse, TicketCreate, TicketUpdate, AssignUpdate, StatusUpdate, PriorityUpdate

router = APIRouter(
    prefix="/ticket",
    tags=["Ticket"]
)

@router.get('/statuses', response_model=list[str])
def get_statuses():
    return [s.value for s in TicketStatus]

@router.get('/priorities', response_model=list[str])
def get_priorities():
    return [p.value for p in TicketPriority]

##### GET TICKETS #####
@router.get('', status_code=status.HTTP_200_OK, response_model=list[TicketResponse])
def get_tickets(user:user_dependency, db:db_dependency):
    if user["role"] == "admin":
        tickets = db.query(Ticket).all()
    elif user["role"] == "agent":
        tickets = db.query(Ticket).filter(Ticket.assigned_to == user["user_id"]).all()
    elif user["role"] == "user":
        tickets = db.query(Ticket).filter(Ticket.created_by == user["user_id"]).all()
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid role"
        )

    return tickets    

##### CREATE TICKET #####
@router.post('', status_code=status.HTTP_200_OK, response_model=TicketResponse)
def create_ticket(user:user_dependency, db:db_dependency, payload:TicketCreate):
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
     
    new_ticket = Ticket(
        ticket_number = generate_ticket_number(),
        title         = payload.title,
        description   = payload.description,
        priority      = payload.priority,
        status        = "open",               # always open on creation
        created_by    = user["user_id"],      # from JWT
        assigned_to   = None,                 # always None on creation
        created_at    = datetime.utcnow(),
        updated_at    = datetime.utcnow()
    )

    try:
        db.add(new_ticket)
        db.commit()
        db.refresh(new_ticket)
        return new_ticket
    
    except IntegrityError:
        db.rollback()            # always rollback on failure
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ticket number already exists"   # unique constraint failed
        )

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Something went wrong"
        )

def generate_ticket_number() -> str:
    return f"TKT-{uuid.uuid4().hex[:8].upper()}"   

##### GET TICKET BY ID #####
@router.get('/{ticket_id}', status_code=status.HTTP_200_OK, response_model=TicketResponse)
def get_ticket_by_id(ticket_id: int, user:user_dependency, db:db_dependency):
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    query = db.query(Ticket).filter(Ticket.id == ticket_id)

    if user["role"] == "admin":
        pass 
    elif user["role"] == "agent":
        query = query.filter(Ticket.assigned_to == user["user_id"])
    elif user["role"] == "user":
        query = query.filter(Ticket.created_by == user["user_id"])
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid role"
        )

    ticket = query.first()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )

    return ticket     

##### UPDATE TICKET ######
@router.put("/{ticket_id}", status_code=status.HTTP_200_OK)
def update_ticket(ticket_id: int, ticket_request:TicketUpdate,  user: user_dependency, db: db_dependency):
    if user["role"] not in ("user", "admin"):
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Only the ticket creator or admin can edit title/description"
        )
    
    query = db.query(Ticket).filter(Ticket.id == ticket_id)

    if user["role"] == "user":
        query = query.filter(Ticket.created_by == user["user_id"])

    ticket = query.first()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        ) 
    
    if ticket.status != "open":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot edit ticket in '{ticket.status}' state"
        )

    if ticket_request.title is not None:
        ticket.title = ticket_request.title
    
    if ticket_request.description is not None:
        ticket.description = ticket_request.description
    
    ticket.updated_at = datetime.utcnow()

    try:
        db.commit()
        db.refresh(ticket)
        return ticket
    
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Something went wrong"
        )

##### UPDATE PRIORITY #####
@router.patch('/{ticket_id}/priority', status_code=status.HTTP_200_OK, response_model=TicketResponse)
def update_priority(ticket_id: int, payload:PriorityUpdate,  user: user_dependency, db: db_dependency):
    if user["role"] not in ("user", "admin"):
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Only the ticket creator or admin can update priority"
        )
    
    query = db.query(Ticket).filter(Ticket.id == ticket_id)

    if user["role"] == "user":
        query = query.filter(Ticket.created_by == user["user_id"])

    ticket = query.first()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    if ticket.status != "open":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot edit ticket in '{ticket.status}' state"
        )
    
    ticket.priority = payload.priority
    ticket.updated_at = datetime.utcnow()

    try:
        db.commit()
        db.refresh(ticket)
        return ticket
    
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Something went wrong"
        )

##### STATUS UPDATE ######
@router.patch('/{ticket_id}/status', status_code=status.HTTP_200_OK, response_model=TicketResponse)
def update_status(ticket_id: int, payload: StatusUpdate,  user: user_dependency, db: db_dependency):
    if user["role"] not in ("agent", "admin"):
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Only the agent or admin can update status"
        )
    
    query = db.query(Ticket).filter(Ticket.id == ticket_id)

    if user["role"] == "agent":
        query = query.filter(Ticket.assigned_to == user["user_id"])

    ticket = query.first()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    ticket.status = payload.status
    ticket.updated_at = datetime.utcnow()

    try:
        db.commit()
        db.refresh(ticket)
        return ticket
    
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Something went wrong"
        )    

##### ASSIGNED_TO UPDATE #####    
@router.patch('/{ticket_id}/assign', status_code=status.HTTP_200_OK, response_model=TicketResponse)
def update_assign(ticket_id: int, payload:AssignUpdate,  user: user_dependency, db: db_dependency):
    if user["role"] not in ("agent", "admin"):
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Only the agent or admin can update assign"
        )
    
    query = db.query(Ticket).filter(Ticket.id == ticket_id)

    if user["role"] == "agent":
        query = query.filter(
            (Ticket.assigned_to == user["user_id"]) | (Ticket.assigned_to.is_(None))
        )

    ticket = query.first()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    target_user = db.query(User).filter(User.id == payload.assigned_to).first()
    if not target_user or target_user.role not in ("agent", "admin"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only assign tickets to an agent or admin"
    )
    
    ticket.assigned_to = payload.assigned_to
    ticket.updated_at = datetime.utcnow()

    try:
        db.commit()
        db.refresh(ticket)
        return ticket
    
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Something went wrong"
        )    

@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(ticket_id: int, user: user_dependency, db: db_dependency):
    if user["role"] !="admin":
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Only the admin can delete ticket"
        )
    
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )

    try:
        db.delete(ticket)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Something went wrong"
        )
    
@router.post('/bulk-upload', status_code=status.HTTP_200_OK)
async def bulk_upload(user: user_dependency, db: db_dependency, file: UploadFile = File(...)):
    if user['role'] != 'admin':
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail= "Only the admin can bulk upload ticket"
        )
    
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail= "only excel file is allowed"
        )
    
    contents = await file.read()

    try:
        df = pd.read_excel(BytesIO(contents))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail= f"Could not parse Excel file: {e}"
        )
    
    required_cols = {'title', 'description', 'priority'}
    if not required_cols.issubset(set(df.columns.str.lower())):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail= f"Excel must contain columns: {required_cols}"
        )
    
    tickets_created = 0
    for _, row in df.iterrows():
        ticket = Ticket(
            ticket_number=generate_ticket_number(),
            title=row["title"],
            description=row.get("description", ""),
            priority=row.get("priority", "medium"),
            status=row.get("status", "open"),
            created_by= row.get("createdby", ""),      
            assigned_to= None,               
            created_at= datetime.utcnow(),
            updated_at= datetime.utcnow()
        )
        db.add(ticket)
        tickets_created += 1

    db.commit()

    return {"message": f"{tickets_created} tickets uploaded successfully"}

    






