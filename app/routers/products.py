from itertools import product
from math import prod
from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from app import routers
from app.models.product import ProductModel
from app.Schemas.product import ProductCreate,ProductUpdate, ProductResponse
from app.utils.dependencies import get_admin_user, get_current_user

router = APIRouter(prefix="/products", tags=["products"])

async def get_product_model():
  return ProductModel()

@router.get("/", response_model= List[ProductResponse])
async def get_products(
  skip: int = Query(0, ge=0),
  limit: int = Query(100,ge=1,le=1000),
  category: Optional[str] = None,
  search: Optional[str] = None,
  product_model: ProductModel = Depends(get_product_model)
  ):

  if search:
    products = await product_model.search_products(search)
  else:
    products = await product_model.get_all_products(skip,limit=limit,category=category)

  # converting objectId to string id

  product_responses = []
  for product in products:
    product_dict = product.copy()
    product_dict["id"] = str(product_dict.pop("_id"))
    product_responses.append(ProductResponse(**product_dict))

  return product_responses

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id:str,product_model: ProductModel = Depends(get_product_model)):
  product = await product_model.get_product_by_id(product_id)
  if not product:
    raise HTTPException(
      status_code= status.HTTP_404_NOT_FOUND,
      detail=" product not found "
    )

  product_dict = product.copy()
  product_dict["id"] = str(product_dict.pop("_id"))
  return ProductResponse(**product_dict)


@router.post("/", response_model= ProductResponse)
async def create_product(
  product: ProductCreate,
  current_user: dict = Depends(get_admin_user),
  product_model: ProductModel = Depends(get_product_model)
  ):
  product_data = product.model_dump()
  product_id = await product_model.create_product(product_data)
  new_product = await product_model.get_product_by_id(product_id)

  product_dict = new_product.copy()
  product_dict["id"] = str(product_dict.pop("_id"))
  return ProductResponse(**product_dict)

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product: ProductCreate,
    product_id: str,
    current_user: dict = Depends(get_current_user),
    product_model: ProductModel = Depends(get_product_model)
):
  update_data = product.model_dump(exclude_unset= True)
  if not update_data:
    raise HTTPException(
      status_code= status.HTTP_400_BAD_REQUEST,
      detail= " no data found "
    )

  updated = await product_model.get_product_by_id(product_id)
  if not updated:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail=" product not found "
    )

  updated_product = await product_model.get_product_by_id(product_id)
  product_dict = updated_product.copy()
  product_dict["id"] = str(product_dict.pop("_id"))
  return ProductResponse(**product_dict)

@router.delete("/{product_id}", response_model= ProductResponse)
async def delete_product(
  product_id: str,
  current_user:  dict = Depends(get_current_user),
  product_model: ProductModel = Depends(get_product_model)
):
  deleted = await product_model.get_product_by_id(product_id)
  if not deleted:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="product not found"
    )
  return {"message":"product deleted successfully"}
