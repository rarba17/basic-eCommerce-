import email
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
  email : EmailStr
  username: str
  full_name: Optional[str] = None
  is_admin : bool = False

class UserCreate(UserBase):
  password: str = Field(..., min_length=6)

class UserInDB(UserBase):
  id: str = Field(alias="_id")
  created_at : datetime
  updated_at : Optional[datetime]

  class config:
    populate_by_name = True

class UserResponse(UserBase):
  id: str
  created_at : datetime

class UserLogin(BaseModel):
  email: EmailStr
  password : str

class Token(BaseModel):
  access_token  : str
  token_type : str = "bearer"
  user: UserResponse
