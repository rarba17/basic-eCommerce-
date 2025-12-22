from datetime import datetime
from bson import ObjectId
from app.database import db
from typing import List, Optional

class ProductModel:
    @property
    def collection(self):
        return db.get_collection("products")

    async def create_product(self, product_data: dict) -> str:
        product_data["created_at"] = datetime.utcnow()
        product_data["updated_at"] = datetime.utcnow()
        result = await self.collection.insert_one(product_data)
        return str(result.inserted_id)

    async def get_product_by_id(self, product_id: str) -> Optional[dict]:
        return await self.collection.find_one({"_id": ObjectId(product_id)})

    async def get_all_products(self, skip: int = 0, limit: int = 100, category: str = None):
        query = {} if not category else {"category": category}
        cursor = self.collection.find(query).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)

    async def update_product(self, product_id: str, update_data: dict) -> bool:
        update_data["updated_at"] = datetime.utcnow()
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

    async def decrement_stock_atomic(self, product_id: str, quantity: int) -> Optional[dict]:
        """
        Atomically decrement stock only if sufficient stock exists.
        Returns the updated product if successful, None if insufficient stock.
        This prevents race conditions during concurrent orders.
        """
        result = await self.collection.find_one_and_update(
            {
                "_id": ObjectId(product_id),
                "stock": {"$gte": quantity}  # Only update if stock >= quantity
            },
            {
                "$inc": {"stock": -quantity},  # Atomically decrement
                "$set": {"updated_at": datetime.utcnow()}
            },
            return_document=True  # Return the updated document
        )
        return result