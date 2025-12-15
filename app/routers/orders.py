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


@router.get("/{order_id}", response_model= List[OrderResponse])
async def get_my_orders(
  current_user : dict = Depends(get_current_user),
  order_model: OrderModel = Depends(get_order_model)
):
  orders = await order_model.get_user_orders(current_user.id)

  order_responses =[]
  for order in orders:
    order_dict = order.copy()
    order_dict["id"] = str(order_dict.pop("_id"))
    order_responses.append(OrderResponse(**order_dict))

  return order_responses

@router.get("/{order_id}", response_model= OrderResponse)
async def get_order(
  order_id:str,
  order_model: OrderModel=Depends(get_order_model),
  current_user: dict = Depends(get_current_user)
):
  order = await order_model.get_order_by_id(order_id)
  if not order:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail= " order not found "
    )

  if order["user_id"] != current_user.id and not current_user.is_admin:
    raise HTTPException(
      status_code=status.HTTP_403_FORBIDDEN,
      details="not authoraize to view this order"
    )
  order_dict = order.copy()
  order_dict["id"] = str(order_dict.pop("_id"))
  return OrderResponse(**order_dict)

@router.put("/{order_id}/status")
async def update_order_status(
    order_id: str,
    status: str,
    order_model: OrderModel=Depends(get_order_model),
    current_user: dict = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update order status"
        )

    updated = await order_model.update_order_status(order_id, status)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    return {"message": "Order status updated successfully"}

@router.put("/{order_id}/payment")
async def update_payment_status(
    order_id: str,
    is_paid: bool,
    order_model: OrderModel=Depends(get_order_model),
    current_user: dict = Depends(get_current_user)
):
    updated = await order_model.update_payment_status(order_id, is_paid)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    return {"message": "Payment status updated successfully"}




