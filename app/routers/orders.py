from itertools import product
from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from app.models.product import ProductModel
from app.models.order import OrderModel
from app.Schemas.order import OrderCreate, OrderResponse
from app.utils.dependencies import get_current_user
from datetime import datetime, timezone

router = APIRouter(prefix="/orders", tags=["orders"])


async def get_product_model():
  return ProductModel()

async def get_order_model():
  return OrderModel()

@router.post("/", response_model=OrderResponse)
async def create_order(
  order: OrderCreate,
  current_user: dict = Depends(get_current_user),
  product_model: ProductModel = Depends(get_product_model),
  order_model: OrderModel = Depends(get_order_model)
):
  for item in order.order_items:
    product = await product_model.get_product_by_id(item.product_id)
    if not product:
      raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail= f"Product {item.product_id} not found"
      )
    if product["stock"] < item.quantity:
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"Insufficient stock for product {item.name}"
      )

    order_data = order.model_dump()
    order_data["user_id"] = current_user.id
    order_data["status"] = "pending"

    order_id = await order_model.create_order(order_data)
    new_order = await order_model.get_order_by_id(order_id)

    for item in order.order_items:
      await product_model.update_product(
        item.product_id,
            {"$inc": {"stock": -item.quantity}}

      )
      order_dict = new_order.copy()
      order_dict["id"] = str(order_dict.pop("_id"))
      return OrderResponse(**order_dict)


#@router.get("/{order_id}", response_model= OrderResponse)
#async def get_my_order():


