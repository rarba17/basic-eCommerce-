from datetime import datetime,timezone
from bson import ObjectId
from app.database import db

class ProductModel:
    def __init__(self):
        self.collection = db.get_collection("products")

    async def create_product(self, product_data: dict) -> str:
        product_data["created_at"] = datetime.now(timezone.utc)
        product_data["updated_at"] = datetime.now(timezone.utc)
        result = await self.collection.insert_one(product_data)
        return str(result.inserted_id)

    async def get_product_by_id(self, product_id: str) -> dict:
        return await self.collection.find_one({"_id": ObjectId(product_id)})

    async def get_all_products(self, skip: int = 0, limit: int = 100, category: str = None):
        query = {}
        if category:
            query["category"] = category

        cursor = self.collection.find(query).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)

    async def update_product(self, product_id: str, update_data: dict) -> bool:
        update_data["updated_at"] = datetime.now(timezone.utc)
        result = await self.collection.update_one(
            {"_id": ObjectId(product_id)}, {"$set": update_data}
        )
        return result.modified_count > 0

    async def delete_product(self, product_id: str) -> bool:
        result = await self.collection.delete_one({"_id": ObjectId(product_id)})
        return result.deleted_count > 0

    async def search_products(self, search_term: str):
        cursor = self.collection.find({
            "$or": [
                {"name": {"$regex": search_term, "$options": "i"}},
                {"description": {"$regex": search_term, "$options": "i"}}
            ]
        })
        return await cursor.to_list(length=100)