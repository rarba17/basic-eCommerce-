from datetime import datetime,timezone,UTC
from bson import ObjectId
from app.Schemas import user
from app.database import db

class UserModel:
  def __init__(self):
    self.collection = db.get_collections("users")

  async def create_user(self, user_data: dict) -> str:
    user_data["created_at"] = datetime.now(timezone.utc)
    user_data["updated_at"] = datetime.now(timezone.utc)
    result = await self.collection.insert_one(user_data)
    return str(result.inserted_id)

  async def get_user_by_email(self,email:str) -> dict:
    return await self.collection.find_one({"email":email})

  async def get_user_by_id(self, id:str) -> dict:
    return await self.collection.find_one({"_id":ObjectId(user_id)})

