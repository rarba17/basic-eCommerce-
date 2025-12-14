from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

class Database:
  def __init__(self):

    self.client: AsyncIOMotorClient |None = None
    self.database = None

  async def connect(self):
    self.client = AsyncIOMotorClient(settings.mongodb_url)
    self.database = self.client[settings.database_name]
    print("connected to mongo")

  async def disconnect(self):
    if self.client:
      self.client.close()
    print("disconnected from mongo")

  def get_collections(self, collection_name: str):
    if self.database is None:
            raise RuntimeError("Database not connected. Call connect() first.")
    return self.database[collection_name]

db = Database()



