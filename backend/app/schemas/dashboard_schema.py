from pydantic import BaseModel

class SummaryStats(BaseModel):
    total_tickets: int
    open_tickets: int
    progress_tickets: int
    done_tickets: int

class Stats(BaseModel):
    label:str
    value:int

class DashboardResponse(BaseModel):
    summary: SummaryStats
    tickets_by_status: list[Stats] | None = None
    tickets_by_priority: list[Stats] | None = None
    top_agents:list[Stats] | None = None

