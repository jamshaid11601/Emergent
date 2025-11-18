import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
from auth import get_password_hash

async def reset_manager_password():
    # Load environment variables
    load_dotenv(Path(__file__).parent / '.env')
    
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Set new password for manager
    new_password = "manager123"
    hashed_password = get_password_hash(new_password)
    
    # Update manager password
    result = await db.users.update_one(
        {"email": "manager@influxier.com"},
        {"$set": {"password": hashed_password}}
    )
    
    if result.modified_count > 0:
        print("✅ Manager password reset successfully!")
        print("\nManager Login Credentials:")
        print("=" * 50)
        print("Email: manager@influxier.com")
        print("Password: manager123")
        print("=" * 50)
    else:
        print("❌ Manager not found or password not updated")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(reset_manager_password())
