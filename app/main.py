
from fastapi import FastAPI, HTTPException,requests
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import app
from app.config import settings
from app.database import db
from app.routers import products, orders, auth, cart

@asynccontextmanager
async def lifespan(app: FastAPI):
  await db.connect()
  try:
    yield
  finally:
    await db.disconnect()


app = FastAPI (
  title="E-commerce API",
  description="FastAPI E-commerce Backend",
  version="1.0.0",
  lifespan=lifespan
)

app.add_middleware(
  CORSMiddleware,
  allow_origins = ["*"],
  allow_credentials = True,
  allow_methods = ["*"],
  allow_headers = ["*"],
)

app.include_router(auth.router)
#app.include_router(products.router)
#app.include_router(orders.router)
#app.include_router(cart.router)


@app.get("/")
async def root():
  return {"message": "Welcome to FastAPI E-commerce API", "version": "1.0.0"}

@app.get("/health")
async def check():
  return {"status": "healthy", "database": "connected"}