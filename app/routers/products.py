from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from app.models.product import ProductModel
from app.Schemas.product import ProductCreate,ProductUpdate, ProductResponse