from fastapi import APIRouter, HTTPException, Response
from sqlalchemy.exc import SQLAlchemyError
from starlette import status
from ..core.database import db_dependency
from ..core.security import hash_password, create_access_token, verify_password, set_auth_cookie, clear_auth_cookie
from ..schemas import UserCreate, LoginRequest
from ..models import User

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

# REGISTER
@router.post('/register', status_code=status.HTTP_201_CREATED)
def register(db:db_dependency, user:UserCreate, response: Response):
    # check if email already exists
    exisiting_user = db.query(User).filter(User.email == user.email).first()
    if exisiting_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")
    
    hashed_password = hash_password(user.password)

    new_user = User(
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        password_hash=hashed_password,
        phone_number=user.phone_number,
        role=user.role,
        is_active=1
    )

    try:
        db.add(new_user)
        db.commit()          # Triggers actual SQL database engine write
        db.refresh(new_user) # Fetches generated user.id back into Python
    except SQLAlchemyError as e:
        db.rollback()        # CRITICAL: Reverts transaction to prevent db corruption
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database transaction failed. Please try again."
        )

    token = create_access_token(
        user.email,
        new_user.id,
        user.role
    )

    set_auth_cookie(response=response, token=token)

    return {
        "username": new_user.email,
        "role": new_user.role
    }


#LOGIN
@router.post('/login', status_code=status.HTTP_200_OK)
def login(db:db_dependency, login_request: LoginRequest, response:Response):
    user = db.query(User).filter(User.email == login_request.email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    
    if not verify_password(login_request.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    
    token = create_access_token(
        user.email,
        user.id,
        user.role
    )

    set_auth_cookie(response=response, token=token)

    return {
        "status": True,
        "data":{
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role
        }
    }

#LOGOUT
@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(response: Response):
    clear_auth_cookie(response=response)
    return {
        "status": True,
        "message":"Logged out successfully"
    }

#ME

#RESET_PASSWORD
