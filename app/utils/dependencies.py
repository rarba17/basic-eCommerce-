from collections import UserDict
from tkinter import NO
from fastapi import Depends, HTTPException, status
from fastapi import security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models import user
from app.utils.security import decode_access_token
from app.models.user import UserModel
from app.Schemas.user import UserResponse


security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
  token = credentials.credentials
  payload = decode_access_token(token)

  if payload is None:
    raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
  user_id = payload.get("sub")

  if user_id is None:
    raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

  user_model = UserModel()
  user = await user_model.get_user_by_id(user_id)

  if user is None:
    raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

  user_dict = user.copy()
  user_dict["id"] = str(user_dict.pop("_id"))

  return UserResponse(**user_dict)

async def get_admin_user(current_user: UserResponse = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user


