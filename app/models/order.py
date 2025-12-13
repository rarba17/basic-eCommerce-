from datetime import datetime
from bson import ObjectId
from app.database import db

class OrderModel:
    def __init__(self):
        self.collection = db.get_collection("orders")

    async def create_order(self, order_data: dict) -> str:
        order_data["created_at"] = datetime.utcnow()
        result = await self.collection.insert_one(order_data)
        return str(result.inserted_id)

    async def get_order_by_id(self, order_id: str) -> dict:
        return await self.collection.find_one({"_id": ObjectId(order_id)})

    async def get_user_orders(self, user_id: str):
        cursor = self.collection.find({"user_id": user_id}).sort("created_at", -1)
        return await cursor.to_list(length=100)

    async def update_order_status(self, order_id: str, status: str) -> bool:
        update_data = {
            "status": status,
            "updated_at": datetime.utcnow()
        }
        if status == "delivered":
            update_data["is_delivered"] = True
            update_data["delivered_at"] = datetime.utcnow()

        result = await self.collection.update_one(
            {"_id": ObjectId(order_id)}, {"$set": update_data}
        )
        return result.modified_count > 0

    async def update_payment_status(self, order_id: str, is_paid: bool) -> bool:
        update_data = {
            "is_paid": is_paid,
            "paid_at": datetime.utcnow() if is_paid else None
        }
        result = await self.collection.update_one(
            {"_id": ObjectId(order_id)}, {"$set": update_data}
        )
        return result.modified_count > 0