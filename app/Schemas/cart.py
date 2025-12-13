from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class CartItem(BaseModel):
    product_id: str
    quantity: int = Field(..., gt=0)
    price: float = Field(..., gt=0)
    subtotal: float = Field(..., gt=0)

class CartBase(BaseModel):
    items: List[CartItem] = []
    total_amount: float = 0.0

class CartResponse(CartBase):
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

class CartItemAdd(BaseModel):
    product_id: str
    quantity: int = Field(..., gt=0)

class CartItemUpdate(BaseModel):
    quantity: int = Field(..., gt=0)

class CartCheckout(BaseModel):
    items: List[CartItem]
    shipping_address: dict
    payment_method: str
    total_price: float