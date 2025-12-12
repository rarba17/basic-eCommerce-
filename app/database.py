from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

class Database:
  client: AsyncIOMotorClient = None
  database = None

  async def connect(self):
    self.client = AsyncIOMotorClient(settings.mongodb_url)
    self.database = self.client(settings.database_name)
    print("connected to mongo")

  async def disconnect(self):
    if self.client:
      self.client.close()
    print("disconnected from mongo")

  def get_collections(self, collection_name: str):
    return self.database[collection_name]

db = Database()



