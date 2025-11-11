import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime, timedelta
from auth import get_password_hash

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def seed_database():
    print("Seeding database...")
    
    # Clear existing data
    await db.users.delete_many({})
    await db.services.delete_many({})
    await db.orders.delete_many({})
    await db.messages.delete_many({})
    await db.reviews.delete_many({})
    
    # Create users (influencers)
    users_data = [
        {
            "name": "Sarah Johnson",
            "email": "sarah@example.com",
            "password": get_password_hash("password123"),
            "userType": "seller",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
            "bio": "Lifestyle influencer passionate about fashion and travel",
            "platform": "Instagram",
            "followers": "250K",
            "username": "@sarahj",
            "level": "Top Rated",
            "rating": 4.9,
            "reviewCount": 342,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "name": "Mike Chen",
            "email": "mike@example.com",
            "password": get_password_hash("password123"),
            "userType": "seller",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
            "bio": "Tech reviewer and YouTuber",
            "platform": "YouTube",
            "followers": "500K",
            "username": "@miketech",
            "level": "Pro Verified",
            "rating": 5.0,
            "reviewCount": 189,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "name": "Emma Rodriguez",
            "email": "emma@example.com",
            "password": get_password_hash("password123"),
            "userType": "seller",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
            "bio": "Fitness influencer and health coach",
            "platform": "TikTok",
            "followers": "180K",
            "username": "@emmafitness",
            "level": "Top Rated",
            "rating": 4.8,
            "reviewCount": 276,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "name": "David Park",
            "email": "david@example.com",
            "password": get_password_hash("password123"),
            "userType": "seller",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
            "bio": "Food content creator and chef",
            "platform": "Instagram",
            "followers": "320K",
            "username": "@davidcooks",
            "level": "Pro Verified",
            "rating": 4.9,
            "reviewCount": 421,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "name": "Lisa Anderson",
            "email": "lisa@example.com",
            "password": get_password_hash("password123"),
            "userType": "seller",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
            "bio": "Lifestyle blogger",
            "platform": "Instagram",
            "followers": "95K",
            "username": "@lisalifestyle",
            "level": "Rising Talent",
            "rating": 4.7,
            "reviewCount": 198,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "name": "Alex Turner",
            "email": "alex@example.com",
            "password": get_password_hash("password123"),
            "userType": "seller",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
            "bio": "Professional gamer and streamer",
            "platform": "Twitch",
            "followers": "750K",
            "username": "@alexgaming",
            "level": "Pro Verified",
            "rating": 5.0,
            "reviewCount": 512,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
    ]
    
    users_result = await db.users.insert_many(users_data)
    user_ids = [str(id) for id in users_result.inserted_ids]
    print(f"Created {len(user_ids)} users")
    
    # Create services
    services_data = [
        {
            "userId": user_ids[0],
            "title": "I will create engaging Instagram story shoutout for your brand",
            "description": "Professional Instagram influencer with 250K engaged followers. I specialize in lifestyle and fashion content.",
            "category": "Social Media Shoutouts",
            "image": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&h=300&fit=crop",
            "packages": {
                "basic": {"name": "Basic", "price": 50, "delivery": 2, "features": ["1 Story Post", "24h Duration", "Brand Tag"]},
                "standard": {"name": "Standard", "price": 100, "delivery": 2, "features": ["3 Story Posts", "48h Duration", "Brand Tag", "Swipe Up Link"]},
                "premium": {"name": "Premium", "price": 180, "delivery": 3, "features": ["5 Story Posts", "72h Duration", "Brand Tag", "Swipe Up Link", "Dedicated Post"]}
            },
            "isActive": True,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "userId": user_ids[1],
            "title": "I will review your tech product on my YouTube channel",
            "description": "Tech reviewer with 500K subscribers. I create honest, in-depth product reviews.",
            "category": "Video Reviews",
            "image": "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=500&h=300&fit=crop",
            "packages": {
                "basic": {"name": "Basic", "price": 200, "delivery": 7, "features": ["5-min Review Video", "Product Mention", "Description Link"]},
                "standard": {"name": "Standard", "price": 400, "delivery": 7, "features": ["10-min Review Video", "Detailed Analysis", "Pinned Comment", "Description Link"]},
                "premium": {"name": "Premium", "price": 750, "delivery": 10, "features": ["15-min Review Video", "Detailed Analysis", "Dedicated Video", "Social Promotion"]}
            },
            "isActive": True,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "userId": user_ids[2],
            "title": "I will create viral TikTok content promoting your fitness brand",
            "description": "Fitness influencer specializing in workout routines and healthy lifestyle content.",
            "category": "Sponsored Content",
            "image": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=300&fit=crop",
            "packages": {
                "basic": {"name": "Basic", "price": 80, "delivery": 3, "features": ["1 TikTok Video", "Brand Mention", "Hashtags"]},
                "standard": {"name": "Standard", "price": 150, "delivery": 4, "features": ["2 TikTok Videos", "Brand Integration", "Custom Hashtag", "Bio Link"]},
                "premium": {"name": "Premium", "price": 280, "delivery": 5, "features": ["3 TikTok Videos", "Full Brand Integration", "Custom Hashtag", "Bio Link", "Instagram Reels"]}
            },
            "isActive": True,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "userId": user_ids[3],
            "title": "I will feature your food product in my cooking content",
            "description": "Food content creator sharing delicious recipes with an engaged community.",
            "category": "Sponsored Content",
            "image": "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&h=300&fit=crop",
            "packages": {
                "basic": {"name": "Basic", "price": 120, "delivery": 5, "features": ["1 Recipe Post", "Product Feature", "Tagged Photo"]},
                "standard": {"name": "Standard", "price": 220, "delivery": 5, "features": ["2 Recipe Posts", "Video Reel", "Product Feature", "Story Mention"]},
                "premium": {"name": "Premium", "price": 400, "delivery": 7, "features": ["3 Recipe Posts", "2 Video Reels", "Dedicated Feature", "Story Series"]}
            },
            "isActive": True,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "userId": user_ids[4],
            "title": "I will promote your lifestyle brand on Instagram",
            "description": "Lifestyle blogger focusing on fashion, travel, and daily inspiration.",
            "category": "Social Media Shoutouts",
            "image": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&h=300&fit=crop",
            "packages": {
                "basic": {"name": "Basic", "price": 45, "delivery": 2, "features": ["2 Story Mentions", "Brand Tag"]},
                "standard": {"name": "Standard", "price": 85, "delivery": 3, "features": ["1 Feed Post", "3 Story Mentions", "Swipe Up Link"]},
                "premium": {"name": "Premium", "price": 150, "delivery": 3, "features": ["2 Feed Posts", "5 Story Mentions", "Swipe Up Link", "IGTV Feature"]}
            },
            "isActive": True,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "userId": user_ids[5],
            "title": "I will showcase your gaming product during live streams",
            "description": "Professional gamer and streamer with a dedicated gaming community.",
            "category": "Live Streaming",
            "image": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&h=300&fit=crop",
            "packages": {
                "basic": {"name": "Basic", "price": 250, "delivery": 7, "features": ["1 Stream Feature", "2hr Stream", "Product Mention"]},
                "standard": {"name": "Standard", "price": 500, "delivery": 7, "features": ["2 Stream Features", "4hr Total", "Gameplay Demo", "Chat Engagement"]},
                "premium": {"name": "Premium", "price": 900, "delivery": 10, "features": ["4 Stream Features", "8hr Total", "Dedicated Stream", "Social Promotion"]}
            },
            "isActive": True,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
    ]
    
    services_result = await db.services.insert_many(services_data)
    service_ids = [str(id) for id in services_result.inserted_ids]
    print(f"Created {len(service_ids)} services")
    
    # Create a demo buyer
    demo_buyer = {
        "name": "John Smith",
        "email": "buyer@example.com",
        "password": get_password_hash("password123"),
        "userType": "buyer",
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
        "username": "@johnsmith",
        "level": "Rising Talent",
        "rating": 0.0,
        "reviewCount": 0,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    buyer_result = await db.users.insert_one(demo_buyer)
    buyer_id = str(buyer_result.inserted_id)
    print(f"Created demo buyer: {buyer_id}")
    
    # Create sample orders
    orders_data = [
        {
            "orderId": "ORD-1001",
            "serviceId": service_ids[0],
            "buyerId": buyer_id,
            "sellerId": user_ids[0],
            "package": "standard",
            "price": 100,
            "status": "in_progress",
            "requirements": "Please promote our new eco-friendly water bottle line.",
            "deliveryNote": None,
            "deliveryFiles": [],
            "revisions": 0,
            "maxRevisions": 1,
            "paymentIntentId": "pi_mock_123456",
            "paymentStatus": "held",
            "createdAt": datetime.utcnow() - timedelta(days=2),
            "deliveryDate": datetime.utcnow() + timedelta(days=1),
            "completedAt": None,
            "updatedAt": datetime.utcnow()
        },
        {
            "orderId": "ORD-1002",
            "serviceId": service_ids[2],
            "buyerId": buyer_id,
            "sellerId": user_ids[2],
            "package": "premium",
            "price": 280,
            "status": "delivered",
            "requirements": "Create content featuring our new protein powder.",
            "deliveryNote": "Content delivered! Check the attached files.",
            "deliveryFiles": ["content_delivery.zip"],
            "revisions": 0,
            "maxRevisions": 1,
            "paymentIntentId": "pi_mock_789012",
            "paymentStatus": "held",
            "createdAt": datetime.utcnow() - timedelta(days=5),
            "deliveryDate": datetime.utcnow(),
            "completedAt": None,
            "updatedAt": datetime.utcnow()
        }
    ]
    
    orders_result = await db.orders.insert_many(orders_data)
    order_ids = [str(id) for id in orders_result.inserted_ids]
    print(f"Created {len(order_ids)} orders")
    
    # Create sample messages
    messages_data = [
        {
            "orderId": order_ids[0],
            "senderId": user_ids[0],
            "message": "Hi! I received your order. Could you provide more details about the water bottle design?",
            "attachments": [],
            "isRead": True,
            "createdAt": datetime.utcnow() - timedelta(hours=10)
        },
        {
            "orderId": order_ids[0],
            "senderId": buyer_id,
            "message": "Sure! It has a minimalist design with our logo. I'll send you the product photos.",
            "attachments": [],
            "isRead": True,
            "createdAt": datetime.utcnow() - timedelta(hours=9)
        },
        {
            "orderId": order_ids[0],
            "senderId": user_ids[0],
            "message": "Perfect! I'll create some amazing content for you. Expected delivery tomorrow.",
            "attachments": [],
            "isRead": True,
            "createdAt": datetime.utcnow() - timedelta(hours=9)
        }
    ]
    
    await db.messages.insert_many(messages_data)
    print(f"Created {len(messages_data)} messages")
    
    # Create sample reviews
    reviews_data = [
        {
            "serviceId": service_ids[0],
            "orderId": "completed_order_1",
            "buyerId": buyer_id,
            "rating": 5,
            "comment": "Amazing work! Sarah delivered exactly what I needed and the engagement was fantastic.",
            "createdAt": datetime.utcnow() - timedelta(days=10)
        },
        {
            "serviceId": service_ids[0],
            "orderId": "completed_order_2",
            "buyerId": buyer_id,
            "rating": 5,
            "comment": "Professional and responsive. Will definitely work with her again!",
            "createdAt": datetime.utcnow() - timedelta(days=15)
        }
    ]
    
    await db.reviews.insert_many(reviews_data)
    print(f"Created {len(reviews_data)} reviews")
    
    print("✓ Database seeded successfully!")
    print("\nDemo Accounts:")
    print("Buyer: buyer@example.com / password123")
    print("Sellers:")
    print("  sarah@example.com / password123")
    print("  mike@example.com / password123")
    print("  emma@example.com / password123")

if __name__ == "__main__":
    asyncio.run(seed_database())
