from tkinter import NO
from turtle import update
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ProductBase(BaseModel):
  name: str = Field(..., min_length=1, max_length=200)
  description : str
  price: float = Field(..., gt=0)
  category: str
  brand: Optional[str]
  stock: int = Field(default=0,ge=0)
  images: List[str] = []
  rating: float = Field(default=0, ge=0, le=5)
  num_reviews : int = Field(default=0,ge=0)

class ProductCreate(ProductBase):
  pass

class ProductUpdate(ProductBase):
  name:Optional[str] = None
  price:Optional[str] = None
  category:Optional[str] = None

class ProductInDB(ProductBase):
  id: str = Field(alias="_id")
  created_at: datetime
  updated_at: Optional[datetime] = None

  class config:
    populate_by_name = True

class ProductResponse(ProductBase):
  id: str
  created_at: datetime



