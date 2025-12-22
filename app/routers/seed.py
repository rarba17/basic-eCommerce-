import asyncio
from fastapi import APIRouter, HTTPException
from app.models.product import ProductModel
# Using app.Schemas based on directory listing
from app.Schemas.product import ProductCreate 
from typing import List

router = APIRouter(prefix="/seed", tags=["seed"])

DUMMY_PRODUCTS: List[dict] = [
    # Electronics
    {"name": "iPhone 15", "description": "Latest Apple smartphone", "price": 999, "category": "Electronics", "brand": "Apple", "stock": 50, "images": ["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop"]},
    {"name": "Samsung Galaxy S24", "description": "Android flagship", "price": 899, "category": "Electronics", "brand": "Samsung", "stock": 40, "images": ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop"]},
    {"name": "MacBook Pro", "description": "14-inch M3 chip", "price": 1999, "category": "Electronics", "brand": "Apple", "stock": 25, "images": ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop"]},
    {"name": "AirPods Pro", "description": "Wireless noise-cancelling earbuds", "price": 249, "category": "Electronics", "brand": "Apple", "stock": 100, "images": ["https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&h=400&fit=crop"]},
    
    # Clothing
    {"name": "Nike Air Max", "description": "Classic running shoes", "price": 120, "category": "Clothing", "brand": "Nike", "stock": 80, "images": ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop"]},
    {"name": "Adidas Hoodie", "description": "Comfortable cotton hoodie", "price": 65, "category": "Clothing", "brand": "Adidas", "stock": 60, "images": ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop"]},
    {"name": "Levi's Jeans", "description": "Classic 501 jeans", "price": 89, "category": "Clothing", "brand": "Levi's", "stock": 45, "images": ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop"]},
    
    # Home & Kitchen
    {"name": "Instant Pot", "description": "Multi-use pressure cooker", "price": 99, "category": "Home & Kitchen", "brand": "Instant Pot", "stock": 30, "images": ["https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&h=400&fit=crop"]},
    {"name": "Dyson Vacuum", "description": "Cordless stick vacuum", "price": 399, "category": "Home & Kitchen", "brand": "Dyson", "stock": 20, "images": ["https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&h=400&fit=crop"]},
    {"name": "Air Fryer", "description": "Digital air fryer oven", "price": 129, "category": "Home & Kitchen", "brand": "Ninja", "stock": 35, "images": ["https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=400&fit=crop"]},
    
    # Sports
    {"name": "Yoga Mat", "description": "Non-slip exercise mat", "price": 29, "category": "Sports", "brand": "Manduka", "stock": 75, "images": ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop"]},
    {"name": "Dumbbells Set", "description": "Adjustable weights 5-50 lbs", "price": 299, "category": "Sports", "brand": "Bowflex", "stock": 15, "images": ["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop"]},
    {"name": "Treadmill", "description": "Folding electric treadmill", "price": 599, "category": "Sports", "brand": "NordicTrack", "stock": 10, "images": ["https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&h=400&fit=crop"]},
    
    # Books
    {"name": "Atomic Habits", "description": "Self-improvement bestseller", "price": 18, "category": "Books", "brand": "Penguin", "stock": 200, "images": ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop"]},
    {"name": "The Great Gatsby", "description": "Classic American novel", "price": 12, "category": "Books", "brand": "Scribner", "stock": 150, "images": ["https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop"]},
    {"name": "Python Crash Course", "description": "Learn Python programming", "price": 35, "category": "Books", "brand": "No Starch Press", "stock": 85, "images": ["https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=400&fit=crop"]},
    
    # Toys
    {"name": "LEGO Classic Set", "description": "Creative building blocks", "price": 39, "category": "Toys", "brand": "LEGO", "stock": 120, "images": ["https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop"]},
    {"name": "Barbie Doll", "description": "Fashion doll with accessories", "price": 25, "category": "Toys", "brand": "Mattel", "stock": 90, "images": ["https://images.unsplash.com/photo-1613682927083-e8c9cc59a44b?w=400&h=400&fit=crop"]},
    {"name": "RC Car", "description": "Remote control racing car", "price": 79, "category": "Toys", "brand": "Traxxas", "stock": 25, "images": ["https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=400&h=400&fit=crop"]},
]

@router.post("/products")
async def seed_products():
    """Seed dummy products into the database"""
    # Note: ProductModel might need async init or similar if not simple class
    # Checking products.py usage: 
    # async def get_product_model(): return ProductModel()
    # It seems ProductModel is a class.
    
    product_model = ProductModel()
    
    try:
        # Check if products already exist
        # Using product_model.collection which usually accesses motor/pymongo path
        existing_count = await product_model.collection.count_documents({})
        if existing_count > 0:
            raise HTTPException(
                status_code=400,
                detail=f"Database already contains {existing_count} products. Clear them first if you want to re-seed."
            )
        
        # Insert all dummy products
        inserted_ids = []
        for product_data in DUMMY_PRODUCTS:
            product_id = await product_model.create_product(product_data)
            inserted_ids.append(product_id)
        
        return {
            "message": f"Successfully seeded {len(inserted_ids)} products",
            "inserted_ids": inserted_ids,
            "categories": list(set(p["category"] for p in DUMMY_PRODUCTS))
        }
        
    except HTTPException:
        raise
    except Exception as e:
        # Log error in console in real app
        print(f"Seed Error: {e}")
        raise HTTPException(status_code=500, detail=f"Error seeding products: {str(e)}")

@router.delete("/products")
async def clear_products():
    """Clear all products from the database"""
    product_model = ProductModel()
    
    try:
        result = await product_model.collection.delete_many({})
        return {
            "message": f"Successfully cleared {result.deleted_count} products",
            "deleted_count": result.deleted_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing products: {str(e)}")

@router.get("/categories")
async def get_categories():
    """Get all unique categories from seeded products"""
    product_model = ProductModel()
    
    try:
        categories = await product_model.collection.distinct("category")
        return {"categories": categories, "count": len(categories)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching categories: {str(e)}")

@router.get("/products/count")
async def get_seeded_count():
    """Get count of seeded products"""
    product_model = ProductModel()
    
    try:
        count = await product_model.collection.count_documents({})
        return {"total_products": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error counting products: {str(e)}")