from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer
from app.models.user import UserModel
from app.Schemas.user import UserCreate, UserResponse, UserLogin, Token
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
   user = await
