import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime
from auth import get_password_hash

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def create_admin():
    print("Creating admin user...")
    
    # Check if admin already exists
    existing_admin = await db.users.find_one({"email": "admin@influxier.com"})
    if existing_admin:
        print("Admin user already exists!")
        return
    
    # Create admin user
    admin_data = {
        "name": "Admin User",
        "email": "admin@influxier.com",
        "password": get_password_hash("admin123"),
        "userType": "admin",
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
        "username": "@admin",
        "level": "Admin",
        "rating": 5.0,
        "reviewCount": 0,
        "banned": False,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    result = await db.users.insert_one(admin_data)
    print(f"✓ Admin user created successfully!")
    print(f"  Email: admin@influxier.com")
    print(f"  Password: admin123")
    print(f"  ID: {result.inserted_id}")

if __name__ == "__main__":
    asyncio.run(create_admin())
