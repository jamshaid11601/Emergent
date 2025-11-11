from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timedelta
from bson import ObjectId
import random
import string

from models import *
from auth import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    get_current_user,
    get_optional_user
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Helper functions
def generate_order_id():
    return f"ORD-{random.randint(1000, 9999)}"

def serialize_doc(doc):
    if doc and '_id' in doc:
        doc['_id'] = str(doc['_id'])
    return doc

# ==================== Authentication Routes ====================

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_dict = user_data.dict()
    user_dict['password'] = get_password_hash(user_data.password)
    user_dict['createdAt'] = datetime.utcnow()
    user_dict['updatedAt'] = datetime.utcnow()
    user_dict['level'] = 'Rising Talent'
    user_dict['rating'] = 0.0
    user_dict['reviewCount'] = 0
    
    # Generate avatar if not provided
    if not user_dict.get('avatar'):
        user_dict['avatar'] = f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_data.name}"
    
    # Generate username if not provided
    if not user_dict.get('username'):
        user_dict['username'] = f"@{user_data.name.lower().replace(' ', '')}"
    
    result = await db.users.insert_one(user_dict)
    user_id = str(result.inserted_id)
    
    # Create access token
    access_token = create_access_token(data={"sub": user_id, "email": user_data.email})
    
    # Return user data
    user_dict['_id'] = user_id
    user_dict.pop('password')
    
    return {
        "user": serialize_doc(user_dict),
        "token": access_token
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user_id = str(user['_id'])
    access_token = create_access_token(data={"sub": user_id, "email": user['email']})
    
    user = serialize_doc(user)
    user.pop('password')
    
    return {
        "user": user,
        "token": access_token
    }

@api_router.post("/auth/google")
async def google_auth(auth_data: GoogleAuth):
    # Mock Google OAuth - in production, verify token with Google
    # For now, create a mock user
    email = f"google_user_{random.randint(1000, 9999)}@gmail.com"
    
    # Check if user exists
    user = await db.users.find_one({"email": email})
    
    if not user:
        # Create new user
        user_dict = {
            "name": "Google User",
            "email": email,
            "userType": "buyer",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=GoogleUser",
            "username": f"@googleuser{random.randint(1000, 9999)}",
            "level": "Rising Talent",
            "rating": 0.0,
            "reviewCount": 0,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        result = await db.users.insert_one(user_dict)
        user_id = str(result.inserted_id)
    else:
        user_id = str(user['_id'])
        user_dict = user
    
    access_token = create_access_token(data={"sub": user_id, "email": email})
    
    user_dict = serialize_doc(user_dict)
    if 'password' in user_dict:
        user_dict.pop('password')
    
    return {
        "user": user_dict,
        "token": access_token
    }

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"_id": ObjectId(current_user['user_id'])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = serialize_doc(user)
    user.pop('password', None)
    return user

# ==================== User Routes ====================

@api_router.get("/users/{user_id}")
async def get_user(user_id: str):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = serialize_doc(user)
    user.pop('password', None)
    return user

@api_router.get("/users/{user_id}/services")
async def get_user_services(user_id: str):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    services = await db.services.find({"userId": user_id, "isActive": True}).to_list(100)
    return [serialize_doc(s) for s in services]

# ==================== Category Routes ====================

@api_router.get("/categories")
async def get_categories():
    # Count services per category
    categories = [
        {"id": "1", "name": "Social Media Shoutouts", "icon": "📱"},
        {"id": "2", "name": "Sponsored Content", "icon": "📸"},
        {"id": "3", "name": "Brand Collaborations", "icon": "🤝"},
        {"id": "4", "name": "Video Reviews", "icon": "🎥"},
        {"id": "5", "name": "Product Unboxing", "icon": "📦"},
        {"id": "6", "name": "Live Streaming", "icon": "📡"},
        {"id": "7", "name": "Story Mentions", "icon": "✨"},
        {"id": "8", "name": "Podcast Features", "icon": "🎙️"}
    ]
    
    for category in categories:
        count = await db.services.count_documents({"category": category["name"], "isActive": True})
        category["count"] = count
    
    return categories

# ==================== Service Routes ====================

@api_router.get("/services")
async def get_services(
    search: Optional[str] = None,
    category: Optional[str] = None,
    sort: str = "recommended",
    skip: int = 0,
    limit: int = 50
):
    query = {"isActive": True}
    
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    if category:
        query["category"] = category
    
    # Get services
    services = await db.services.find(query).skip(skip).limit(limit).to_list(limit)
    
    # Get user data for each service
    result = []
    for service in services:
        service = serialize_doc(service)
        user = await db.users.find_one({"_id": ObjectId(service['userId'])})
        if user:
            user = serialize_doc(user)
            user.pop('password', None)
            service['influencer'] = user
        result.append(service)
    
    # Sort
    if sort == "price_low":
        result.sort(key=lambda x: x['packages']['basic']['price'])
    elif sort == "price_high":
        result.sort(key=lambda x: x['packages']['basic']['price'], reverse=True)
    elif sort == "rating" and result:
        result.sort(key=lambda x: x.get('influencer', {}).get('rating', 0), reverse=True)
    
    return result

@api_router.get("/services/{service_id}")
async def get_service(service_id: str):
    if not ObjectId.is_valid(service_id):
        raise HTTPException(status_code=400, detail="Invalid service ID")
    
    service = await db.services.find_one({"_id": ObjectId(service_id)})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    service = serialize_doc(service)
    
    # Get user data
    user = await db.users.find_one({"_id": ObjectId(service['userId'])})
    if user:
        user = serialize_doc(user)
        user.pop('password', None)
        service['influencer'] = user
    
    return service

@api_router.post("/services")
async def create_service(
    service_data: ServiceCreate,
    current_user: dict = Depends(get_current_user)
):
    service_dict = service_data.dict()
    service_dict['userId'] = current_user['user_id']
    service_dict['isActive'] = True
    service_dict['createdAt'] = datetime.utcnow()
    service_dict['updatedAt'] = datetime.utcnow()
    
    result = await db.services.insert_one(service_dict)
    service_dict['_id'] = str(result.inserted_id)
    
    return serialize_doc(service_dict)

# ==================== Order Routes ====================

@api_router.get("/orders")
async def get_orders(
    role: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user['user_id']
    
    if role == "buyer":
        query = {"buyerId": user_id}
    elif role == "seller":
        query = {"sellerId": user_id}
    else:
        query = {"$or": [{"buyerId": user_id}, {"sellerId": user_id}]}
    
    orders = await db.orders.find(query).sort("createdAt", -1).to_list(100)
    
    # Enrich with service and user data
    result = []
    for order in orders:
        order = serialize_doc(order)
        
        # Get service
        service = await db.services.find_one({"_id": ObjectId(order['serviceId'])})
        if service:
            service = serialize_doc(service)
            # Get influencer
            user = await db.users.find_one({"_id": ObjectId(service['userId'])})
            if user:
                user = serialize_doc(user)
                user.pop('password', None)
                service['influencer'] = user
            order['service'] = service
        
        result.append(order)
    
    return result

@api_router.get("/orders/{order_id}")
async def get_order(
    order_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=400, detail="Invalid order ID")
    
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check authorization
    user_id = current_user['user_id']
    if order['buyerId'] != user_id and order['sellerId'] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    order = serialize_doc(order)
    
    # Get service data
    service = await db.services.find_one({"_id": ObjectId(order['serviceId'])})
    if service:
        service = serialize_doc(service)
        order['service'] = service
    
    return order

@api_router.post("/orders")
async def create_order(
    order_data: OrderCreate,
    current_user: dict = Depends(get_current_user)
):
    # Get service
    service = await db.services.find_one({"_id": ObjectId(order_data.serviceId)})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Get package price
    package = service['packages'].get(order_data.package)
    if not package:
        raise HTTPException(status_code=400, detail="Invalid package")
    
    # Calculate delivery date
    delivery_date = datetime.utcnow() + timedelta(days=package['delivery'])
    
    # Create order
    order_dict = {
        "orderId": generate_order_id(),
        "serviceId": order_data.serviceId,
        "buyerId": current_user['user_id'],
        "sellerId": service['userId'],
        "package": order_data.package,
        "price": package['price'],
        "status": "in_progress",
        "requirements": order_data.requirements,
        "deliveryNote": None,
        "deliveryFiles": [],
        "revisions": 0,
        "maxRevisions": 1,
        "paymentIntentId": f"pi_mock_{random.randint(100000, 999999)}",
        "paymentStatus": "held",
        "createdAt": datetime.utcnow(),
        "deliveryDate": delivery_date,
        "completedAt": None,
        "updatedAt": datetime.utcnow()
    }
    
    result = await db.orders.insert_one(order_dict)
    order_dict['_id'] = str(result.inserted_id)
    
    return serialize_doc(order_dict)

@api_router.put("/orders/{order_id}/deliver")
async def deliver_order(
    order_id: str,
    delivery_data: OrderDeliver,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=400, detail="Invalid order ID")
    
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check if seller
    if order['sellerId'] != current_user['user_id']:
        raise HTTPException(status_code=403, detail="Only seller can deliver")
    
    # Update order
    await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {
            "$set": {
                "status": "delivered",
                "deliveryNote": delivery_data.deliveryNote,
                "deliveryFiles": delivery_data.deliveryFiles,
                "updatedAt": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Order delivered successfully"}

@api_router.put("/orders/{order_id}/accept")
async def accept_order(
    order_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=400, detail="Invalid order ID")
    
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check if buyer
    if order['buyerId'] != current_user['user_id']:
        raise HTTPException(status_code=403, detail="Only buyer can accept")
    
    # Update order
    await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {
            "$set": {
                "status": "completed",
                "paymentStatus": "released",
                "completedAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Order completed successfully"}

@api_router.put("/orders/{order_id}/revision")
async def request_revision(
    order_id: str,
    revision_data: OrderRevision,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=400, detail="Invalid order ID")
    
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check if buyer
    if order['buyerId'] != current_user['user_id']:
        raise HTTPException(status_code=403, detail="Only buyer can request revision")
    
    # Check revisions
    if order['revisions'] >= order['maxRevisions']:
        raise HTTPException(status_code=400, detail="No revisions left")
    
    # Update order
    await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {
            "$set": {
                "status": "in_progress",
                "updatedAt": datetime.utcnow()
            },
            "$inc": {"revisions": 1}
        }
    )
    
    return {"message": "Revision requested successfully"}

# ==================== Message Routes ====================

@api_router.get("/messages/{order_id}")
async def get_messages(
    order_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=400, detail="Invalid order ID")
    
    # Check authorization
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    user_id = current_user['user_id']
    if order['buyerId'] != user_id and order['sellerId'] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    messages = await db.messages.find({"orderId": order_id}).sort("createdAt", 1).to_list(1000)
    
    # Enrich with sender data
    result = []
    for msg in messages:
        msg = serialize_doc(msg)
        sender = await db.users.find_one({"_id": ObjectId(msg['senderId'])})
        if sender:
            msg['senderName'] = sender['name']
        result.append(msg)
    
    return result

@api_router.post("/messages")
async def send_message(
    message_data: MessageCreate,
    current_user: dict = Depends(get_current_user)
):
    # Verify order access
    if not ObjectId.is_valid(message_data.orderId):
        raise HTTPException(status_code=400, detail="Invalid order ID")
    
    order = await db.orders.find_one({"_id": ObjectId(message_data.orderId)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    user_id = current_user['user_id']
    if order['buyerId'] != user_id and order['sellerId'] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Create message
    message_dict = {
        "orderId": message_data.orderId,
        "senderId": user_id,
        "message": message_data.message,
        "attachments": message_data.attachments,
        "isRead": False,
        "createdAt": datetime.utcnow()
    }
    
    result = await db.messages.insert_one(message_dict)
    message_dict['_id'] = str(result.inserted_id)
    
    # Get sender name
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if user:
        message_dict['senderName'] = user['name']
    
    return serialize_doc(message_dict)

# ==================== Review Routes ====================

@api_router.get("/reviews/{service_id}")
async def get_reviews(service_id: str):
    if not ObjectId.is_valid(service_id):
        raise HTTPException(status_code=400, detail="Invalid service ID")
    
    reviews = await db.reviews.find({"serviceId": service_id}).sort("createdAt", -1).to_list(100)
    
    # Enrich with buyer data
    result = []
    for review in reviews:
        review = serialize_doc(review)
        buyer = await db.users.find_one({"_id": ObjectId(review['buyerId'])})
        if buyer:
            review['buyerName'] = buyer['name']
            review['buyerAvatar'] = buyer.get('avatar')
        result.append(review)
    
    return result

@api_router.post("/reviews")
async def create_review(
    review_data: ReviewCreate,
    current_user: dict = Depends(get_current_user)
):
    # Verify order is completed
    order = await db.orders.find_one({"_id": ObjectId(review_data.orderId)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order['buyerId'] != current_user['user_id']:
        raise HTTPException(status_code=403, detail="Only buyer can review")
    
    if order['status'] != 'completed':
        raise HTTPException(status_code=400, detail="Order must be completed")
    
    # Check if already reviewed
    existing = await db.reviews.find_one({"orderId": review_data.orderId})
    if existing:
        raise HTTPException(status_code=400, detail="Already reviewed")
    
    # Create review
    review_dict = {
        "serviceId": review_data.serviceId,
        "orderId": review_data.orderId,
        "buyerId": current_user['user_id'],
        "rating": review_data.rating,
        "comment": review_data.comment,
        "createdAt": datetime.utcnow()
    }
    
    result = await db.reviews.insert_one(review_dict)
    review_dict['_id'] = str(result.inserted_id)
    
    # Update service owner's rating
    service = await db.services.find_one({"_id": ObjectId(review_data.serviceId)})
    if service:
        # Calculate new average rating
        all_reviews = await db.reviews.find({"serviceId": review_data.serviceId}).to_list(1000)
        avg_rating = sum(r['rating'] for r in all_reviews) / len(all_reviews)
        
        await db.users.update_one(
            {"_id": ObjectId(service['userId'])},
            {
                "$set": {
                    "rating": round(avg_rating, 1),
                    "reviewCount": len(all_reviews)
                }
            }
        )
    
    return serialize_doc(review_dict)

# ==================== Payment Routes (Mocked) ====================

@api_router.post("/payments/create-intent")
async def create_payment_intent(
    payment_data: PaymentIntent,
    current_user: dict = Depends(get_current_user)
):
    # Mock Stripe payment intent
    return {
        "paymentIntentId": f"pi_mock_{random.randint(100000, 999999)}",
        "clientSecret": f"pi_mock_secret_{random.randint(100000, 999999)}",
        "amount": payment_data.amount,
        "status": "requires_confirmation"
    }

@api_router.post("/payments/confirm")
async def confirm_payment(payment_data: PaymentConfirm):
    # Mock payment confirmation
    return {
        "status": "succeeded",
        "paymentIntentId": payment_data.paymentIntentId
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()