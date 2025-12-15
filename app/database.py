from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

class Database:
    client: AsyncIOMotorClient = None
    database = None

    async def connect(self):
        self.client = AsyncIOMotorClient(settings.mongodb_url)
        self.database = self.client[settings.database_name]
        print("Connected to MongoDB")

    async def disconnect(self):
        if self.client:
            self.client.close()
            print("Disconnected from MongoDB")

    def get_collection(self, name: str):
        if self.database is None:
            raise RuntimeError("Database not connected")
        return self.database[name]

db = Database()