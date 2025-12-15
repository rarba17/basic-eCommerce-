from os import access
import token
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer
from app.models.user import UserModel
from app.Schemas.user import UserCreate, UserResponse, UserLogin, Token
from app.utils.dependencies import get_current_user
from app.utils.security import verify_password, get_password_hash, create_access_token
from datetime import timedelta
from app.database import db

router = APIRouter(prefix="/auth", tags=["authentication"])
#user_model = UserModel()
security = HTTPBearer()

async def get_user_model():
    return UserModel()

@router.post("/register", response_model= UserResponse)
async def register(user: UserCreate, user_model: UserModel = Depends(get_user_model)):
  existing_user = await user_model.get_user_by_email(user.email)
  if existing_user:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="Email already registered"
    )

  user_data = user.model_dump()
  user_data["password"] =get_password_hash(user.password)

  user_id = await user_model.create_user(user_data)
  new_user = await user_model.get_user_by_id(user_id)

  user_dict = new_user.copy()
  user_dict["id"] = str(user_dict.pop("_id"))

  return UserResponse(**user_dict)

@router.post("/login", response_model=Token)
async def login(user_credentials = UserLogin, user_model: UserModel = Depends(get_user_model)):

   user = await user_model.get_user_by_email(user_credentials.email)
   if not user or not verify_password(user_credentials.password, user["password"]):
      raise HTTPException(
         status_code=status.HTTP_401_UNAUTHORIZED,
         detail="incorrect user id or password"
      )
   access_token_expire = timedelta(minutes= 30)
   access_token = create_access_token(data={"sub":str(user)}, expire_delta=access_token_expire)
   user_dict = user.copy()
   user_dict["id"] = str(user_dict.pop("_id"))
   user_response = UserResponse(**user_dict)
   return Token(access_token= access_token,token_type="bearer",user= user_response)

@router.post("/me", response_model= UserResponse)
async def get_current_user_info(current_user: UserResponse = Depends(get_current_user)):
   return current_user

