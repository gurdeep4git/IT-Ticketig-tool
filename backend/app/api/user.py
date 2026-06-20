from fastapi import APIRouter, HTTPException
from starlette import status
from ..schemas.user_schema import UserBase
from ..core.security import user_dependency
from ..core.database import db_dependency
from ..models import User

router = APIRouter(
    prefix="/user",
    tags=["User"]
)

@router.get('/agents', status_code=status.HTTP_200_OK, response_model=list[UserBase])
def get_agents(user: user_dependency, db:db_dependency):
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    return db.query(User).filter(User.role == 'agent').all