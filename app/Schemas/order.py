from tkinter import NO
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class OrderStatus(str, Enum):
  PENDING ="pending"
  PROCESSING = "processing"
  SHIPPED = "shipped"
  DELIVERED = "delivered"
  CANCELLED = "cancelled"

class OrderItem(BaseModel):
  product_id: str
  name: str
  quantity: int = Field(..., gt=0)
  price: float = Field(..., gt=0)
  image: Optional[str] = None

class ShippingAddress(BaseModel):
  full_name: str
  address: str
  city: str
  postal_code: str
  country: str
  phone_no: Optional[str] = None

class OrderBase(BaseModel):
  order_items: List[OrderItem]
  shipping_address: ShippingAddress
  payment_method: str
  items_price: float = Field(...,gt=0)
  shipping_price: float = Field(default=0, gt=0)
  total_price: float = Field(...,gt=0)

class OrderCreate(OrderBase):
  pass

class OrderInDB(OrderBase):
  id: str = Field(alias="_id")
  user_id: str
  status: OrderStatus
  is_paid: bool = False
  paid_at: Optional[datetime] = None
  is_delivered: bool = False
  delivered_at: Optional[datetime]= None
  created_at: datetime

  class config:
    populate_by_name: True

class OrderResponse(OrderInDB):
  pass






