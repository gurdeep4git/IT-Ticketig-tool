from fastapi import APIRouter, HTTPException
from sqlalchemy import func
from starlette import status
from ..schemas.dashboard_schema import DashboardResponse, Stats, SummaryStats
from ..core.security import user_dependency
from ..core.database import db_dependency
from ..models import Ticket, User

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

@router.get('', status_code=status.HTTP_200_OK, response_model=DashboardResponse)
def get_dashboard_stats(user:user_dependency, db:db_dependency):
    base_query = db.query(Ticket)

    if user["role"] == "agent":
        base_query = base_query.filter(Ticket.assigned_to == user['user_id'])

    if user["role"] == "user":
        base_query = base_query.filter(Ticket.created_by == user['user_id']) 

    total_tickets =  base_query.count()
    open_tickets = base_query.filter(Ticket.status == 'open').count()
    progress_tickets = base_query.filter(Ticket.status == 'progress').count()
    done_tickets = base_query.filter(Ticket.status == 'done').count()

    summary = SummaryStats(
        total_tickets=total_tickets,
        open_tickets=open_tickets,
        progress_tickets=progress_tickets,
        done_tickets=done_tickets
    )

    if user["role"] == "user":
        return DashboardResponse(summary=summary)

    # --- tickets_by_status ---
    status_rows = (
        base_query
        .with_entities(Ticket.status, func.count(Ticket.id))
        .group_by(Ticket.status)
        .all()
    )
    tickets_by_status = [Stats(label=s, value=c) for s, c in status_rows]

    priority_rows = (
        base_query
        .with_entities(Ticket.priority, func.count(Ticket.id))
        .group_by(Ticket.priority)
        .all()
    )
    tickets_by_priority = [Stats(label=p, value=c) for p, c in priority_rows]

    top_agents = None
    if user["role"] == "admin":
        agent_rows = (
            db.query(User.email, func.count(Ticket.id))
            .join(Ticket, Ticket.assigned_to == User.id)
            .filter(Ticket.status == "done")
            .group_by(User.email)
            .order_by(func.count(Ticket.id).desc())
            .all()
        )
        top_agents = [
            Stats(label=name, value=cnt)
            for name, cnt in agent_rows
        ]

    return DashboardResponse(
        summary=summary,
        tickets_by_status=tickets_by_status,
        tickets_by_priority=tickets_by_priority,
        top_agents=top_agents,
    )




    
    