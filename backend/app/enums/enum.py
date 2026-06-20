from enum import Enum

class TicketPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

class TicketStatus(str, Enum):
    open = "open",
    progess = "progress",
    done="done"