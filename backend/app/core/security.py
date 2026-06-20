from datetime import datetime, timedelta, timezone
from fastapi.security import APIKeyCookie, HTTPAuthorizationCredentials, HTTPBearer
from typing_extensions import Annotated
from fastapi import Cookie, Depends, HTTPException, Response
from passlib.context import CryptContext
from jose import JWTError, jwt
from starlette import status

SECRET_KEY = "063t18vxq8vpazjc0tktwlimcfcszkk3l8n9y5u7g1h2o4r5s6a7d8f9b0"
ALGORITHM = "HS256"
COOKIE_EXPIRY_SECONDS = 1800  # 30 minutes

cookie_scheme = APIKeyCookie(name="access_token", auto_error=False)

# Define the password hashing context once globally
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(
    email:str,
    user_id: int,
    role: str,
    expires_delta: timedelta | None = None
):
    payload = {
        "sub": email,
        "user_id": user_id,
        "role": role
    }

    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=30)
    )

    payload['exp'] = expire

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )  

def set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False, 
        samesite="lax",
        max_age=COOKIE_EXPIRY_SECONDS,
    )

def clear_auth_cookie(response: Response) -> None:
    response.set_cookie(
        key="access_token",
        value="",
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=0,
        expires=0,
    )   

def get_current_user(token: str = Depends(cookie_scheme)):
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Not authenticated"
        )
    
    try:
        print("DEBUG: Received Token String ->", token) 

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user_id: int  = payload.get("user_id")
        role: str     = payload.get("role")

        if not email or not user_id or not role:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        
        return {"email": email, "user_id": user_id, "role": role}

    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

# Define the type alias
user_dependency = Annotated[dict, Depends(get_current_user)]