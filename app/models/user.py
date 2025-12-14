from datetime import datetime,timezone,UTC
from unittest import result
from bson import ObjectId
from app.Schemas import user
from app.database import db

class UserModel:
  def __init__(self):
    self.collection = db.get_collections("users")

  @property
  def collection(self):
      if self._collection is None:
          self._collection = db.get_collection("users")
      return self._collection

  async def create_user(self, user_data: dict) -> str:
    user_data["created_at"] = datetime.now(timezone.utc)
    user_data["updated_at"] = datetime.now(timezone.utc)
    result = await self.collection.insert_one(user_data)
    return str(result.inserted_id)

  async def get_user_by_email(self,email:str) -> dict:
    return await self.collection.find_one({"email":email})

  async def get_user_by_id(self, user_id:str) -> dict:
    return await self.collection.find_one({"_id":ObjectId(user_id)})

  async def update_user(self, user_id:str, update_data:dict) -> bool:
    update_data["updated_at"] = datetime.now(timezone.utc)
    result = await self.collection.update_one(
      {"_id": ObjectId(user_id)}, {"$set": update_data}
    )
    return result.modified_count > 0

  async def delete_user(self,user_id:str) -> bool:
    result = await self.collection.delete_one(
      {"_id":ObjectId(user_id)}
    )
    return result.deleted_count > 0


