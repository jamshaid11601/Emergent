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

from models import (
    UserCreate, UserLogin, GoogleAuth, ServiceCreate, OrderCreate, 
    OrderDeliver, OrderRevision, MessageCreate, ReviewCreate, 
    PaymentIntent, PaymentConfirm
)
from auth import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    get_current_user,
    get_optional_user
)
import base64

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

@api_router.put("/users/{user_id}")
async def update_user(
    user_id: str,
    user_data: dict,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    # Check if user is updating their own profile
    if current_user['user_id'] != user_id:
        raise HTTPException(status_code=403, detail="Cannot update other user's profile")
    
    # Remove fields that shouldn't be updated
    update_data = {}
    allowed_fields = ['name', 'bio', 'avatar', 'platform', 'followers', 'username', 'socialPlatforms']
    for field in allowed_fields:
        if field in user_data:
            update_data[field] = user_data[field]
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    update_data['updatedAt'] = datetime.utcnow()
    
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )
    
    # Get updated user
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    user = serialize_doc(user)
    user.pop('password', None)
    
    return user

@api_router.post("/users/upload-image")
async def upload_profile_image(
    image_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Upload profile image as base64"""
    if 'image' not in image_data:
        raise HTTPException(status_code=400, detail="No image data provided")
    
    # In production, you would upload to S3 or similar
    # For now, we'll store the base64 data URL
    return {"imageUrl": image_data['image']}

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

# ==================== Admin Routes ====================

@api_router.get("/admin/stats")
async def get_admin_stats(current_user: dict = Depends(get_current_user)):
    # Check if user is admin
    user = await db.users.find_one({"_id": ObjectId(current_user['user_id'])})
    if not user or user.get('userType') != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get counts
    total_users = await db.users.count_documents({})
    total_orders = await db.orders.count_documents({})
    total_services = await db.services.count_documents({})
    pending_orders = await db.orders.count_documents({"status": "in_progress"})
    completed_orders = await db.orders.count_documents({"status": "completed"})
    active_influencers = await db.users.count_documents({"userType": "seller"})
    
    # Calculate total revenue
    orders = await db.orders.find({}).to_list(10000)
    total_revenue = sum(order.get('price', 0) for order in orders)
    
    return {
        "totalUsers": total_users,
        "totalOrders": total_orders,
        "totalRevenue": total_revenue,
        "totalServices": total_services,
        "pendingOrders": pending_orders,
        "completedOrders": completed_orders,
        "activeInfluencers": active_influencers
    }

@api_router.get("/admin/users")
async def get_all_users(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"_id": ObjectId(current_user['user_id'])})
    if not user or user.get('userType') != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = await db.users.find({}).to_list(1000)
    result = []
    for u in users:
        u = serialize_doc(u)
        u.pop('password', None)
        result.append(u)
    return result

@api_router.put("/admin/users/{user_id}/ban")
async def ban_user(user_id: str, current_user: dict = Depends(get_current_user)):
    admin = await db.users.find_one({"_id": ObjectId(current_user['user_id'])})
    if not admin or admin.get('userType') != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_status = not user.get('banned', False)
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"banned": new_status, "updatedAt": datetime.utcnow()}}
    )
    
    return {"message": f"User {'banned' if new_status else 'unbanned'} successfully"}

@api_router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(get_current_user)):
    admin = await db.users.find_one({"_id": ObjectId(current_user['user_id'])})
    if not admin or admin.get('userType') != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    await db.users.delete_one({"_id": ObjectId(user_id)})
    return {"message": "User deleted successfully"}

@api_router.get("/admin/services")
async def get_all_services_admin(current_user: dict = Depends(get_current_user)):
    admin = await db.users.find_one({"_id": ObjectId(current_user['user_id'])})
    if not admin or admin.get('userType') != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    services = await db.services.find({}).to_list(1000)
    result = []
    for service in services:
        service = serialize_doc(service)
        user = await db.users.find_one({"_id": ObjectId(service['userId'])})
        if user:
            user = serialize_doc(user)
            user.pop('password', None)
            service['influencer'] = user
        result.append(service)
    return result

@api_router.put("/admin/services/{service_id}/approve")
async def approve_service(service_id: str, current_user: dict = Depends(get_current_user)):
    admin = await db.users.find_one({"_id": ObjectId(current_user['user_id'])})
    if not admin or admin.get('userType') != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    await db.services.update_one(
        {"_id": ObjectId(service_id)},
        {"$set": {"status": "approved", "updatedAt": datetime.utcnow()}}
    )
    return {"message": "Service approved"}

@api_router.put("/admin/services/{service_id}/reject")
async def reject_service(service_id: str, current_user: dict = Depends(get_current_user)):
    admin = await db.users.find_one({"_id": ObjectId(current_user['user_id'])})
    if not admin or admin.get('userType') != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    await db.services.update_one(
        {"_id": ObjectId(service_id)},
        {"$set": {"status": "rejected", "updatedAt": datetime.utcnow()}}
    )
    return {"message": "Service rejected"}

@api_router.delete("/admin/services/{service_id}")
async def delete_service_admin(service_id: str, current_user: dict = Depends(get_current_user)):
    admin = await db.users.find_one({"_id": ObjectId(current_user['user_id'])})
    if not admin or admin.get('userType') != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    await db.services.delete_one({"_id": ObjectId(service_id)})
    return {"message": "Service deleted"}

@api_router.get("/admin/orders")
async def get_all_orders_admin(current_user: dict = Depends(get_current_user)):
    admin = await db.users.find_one({"_id": ObjectId(current_user['user_id'])})
    if not admin or admin.get('userType') != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    orders = await db.orders.find({}).sort("createdAt", -1).to_list(1000)
    result = []
    for order in orders:
        order = serialize_doc(order)
        service = await db.services.find_one({"_id": ObjectId(order['serviceId'])})
        if service:
            order['service'] = serialize_doc(service)
        buyer = await db.users.find_one({"_id": ObjectId(order['buyerId'])})
        if buyer:
            order['buyerName'] = buyer['name']
        seller = await db.users.find_one({"_id": ObjectId(order['sellerId'])})
        if seller:
            order['sellerName'] = seller['name']
        result.append(order)
    return result

@api_router.post("/admin/create-manager")
async def create_manager(manager_data: dict, current_user: dict = Depends(get_current_user)):
    admin = await db.users.find_one({"_id": ObjectId(current_user['user_id'])})
    if not admin or admin.get('userType') != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Check if email already exists
    existing = await db.users.find_one({"email": manager_data['email']})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create manager
    new_manager = {
        "name": manager_data['name'],
        "email": manager_data['email'],
        "password": get_password_hash(manager_data['password']),
        "userType": "manager",
        "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={manager_data['name']}",
        "username": f"@{manager_data['name'].lower().replace(' ', '')}",
        "bio": manager_data.get('bio', ''),
        "phone": manager_data.get('phone', ''),
        "level": "Manager",
        "rating": 0.0,
        "reviewCount": 0,
        "banned": False,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    result = await db.users.insert_one(new_manager)
    return {"message": "Manager created successfully", "id": str(result.inserted_id)}

# ==================== Manager Routes ====================

@api_router.get("/manager/stats")
async def get_manager_stats(current_user: dict = Depends(get_current_user)):
    manager = await db.users.find_one({"_id": ObjectId(current_user['user_id'])})
    if not manager or manager.get('userType') != 'manager':
        raise HTTPException(status_code=403, detail="Manager access required")
    
    # Get campaigns created by this manager
    campaigns = await db.campaigns.find({"managerId": current_user['user_id']}).to_list(1000)
    
    # Count active influencers (sellers)
    influencers = await db.users.count_documents({"userType": "seller"})
    
    # Count clients (buyers)
    clients = await db.users.count_documents({"userType": "buyer"})
    
    # Calculate total revenue from campaigns
    total_revenue = sum(campaign.get('budget', 0) for campaign in campaigns)
    
    return {
        "totalCampaigns": len(campaigns),
        "activeInfluencers": influencers,
        "totalClients": clients,
        "totalRevenue": total_revenue
    }

@api_router.get("/manager/influencers")
async def get_influencers_for_manager(current_user: dict = Depends(get_current_user)):
    manager = await db.users.find_one({"_id": ObjectId(current_user['user_id'])})
    if not manager or manager.get('userType') != 'manager':
        raise HTTPException(status_code=403, detail="Manager access required")
    
    influencers = await db.users.find({"userType": "seller"}).to_list(100)
    result = []
    for inf in influencers:
        inf = serialize_doc(inf)
        inf.pop('password', None)
        result.append(inf)
    return result

@api_router.get("/manager/clients")
async def get_clients_for_manager(current_user: dict = Depends(get_current_user)):
    manager = await db.users.find_one({"_id": ObjectId(current_user['user_id'])})
    if not manager or manager.get('userType') != 'manager':
        raise HTTPException(status_code=403, detail="Manager access required")
    
    clients = await db.users.find({"userType": "buyer"}).to_list(100)
    result = []
    for client in clients:
        client = serialize_doc(client)
        client.pop('password', None)
        result.append(client)
    return result

@api_router.get("/manager/campaigns")
async def get_manager_campaigns(current_user: dict = Depends(get_current_user)):
    manager = await db.users.find({"_id": ObjectId(current_user['user_id'])})
    if not manager or manager.get('userType') != 'manager':
        raise HTTPException(status_code=403, detail="Manager access required")
    
    campaigns = await db.campaigns.find({"managerId": current_user['user_id']}).to_list(100)
    return [serialize_doc(c) for c in campaigns]

@api_router.get("/manager/chat/{user_id}")
async def get_manager_chat(user_id: str, current_user: dict = Depends(get_current_user)):
    manager = await db.users.find_one({"_id": ObjectId(current_user['user_id'])})
    if not manager or manager.get('userType') != 'manager':
        raise HTTPException(status_code=403, detail="Manager access required")
    
    # Get messages between manager and user
    messages = await db.manager_chats.find({
        "$or": [
            {"senderId": current_user['user_id'], "recipientId": user_id},
            {"senderId": user_id, "recipientId": current_user['user_id']}
        ]
    }).sort("createdAt", 1).to_list(1000)
    
    return [serialize_doc(m) for m in messages]

@api_router.post("/manager/chat/{user_id}")
async def send_manager_message(
    user_id: str,
    message_data: dict,
    current_user: dict = Depends(get_current_user)
):
    manager = await db.users.find_one({"_id": ObjectId(current_user['user_id'])})
    if not manager or manager.get('userType') != 'manager':
        raise HTTPException(status_code=403, detail="Manager access required")
    
    message = {
        "senderId": current_user['user_id'],
        "recipientId": user_id,
        "message": message_data['message'],
        "createdAt": datetime.utcnow()
    }
    
    await db.manager_chats.insert_one(message)
    return {"message": "Message sent successfully"}

@api_router.post("/manager/custom-order")
async def create_custom_order(
    order_data: dict,
    current_user: dict = Depends(get_current_user)
):
    manager = await db.users.find_one({"_id": ObjectId(current_user['user_id'])})
    if not manager or manager.get('userType') != 'manager':
        raise HTTPException(status_code=403, detail="Manager access required")
    
    # Create custom order
    custom_order = {
        "orderId": generate_order_id(),
        "title": order_data['title'],
        "description": order_data.get('description', ''),
        "price": float(order_data['price']),
        "deliveryDays": int(order_data.get('deliveryDays', 7)),
        "managerId": current_user['user_id'],
        "recipientId": order_data['recipientId'],
        "status": "pending",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    result = await db.custom_orders.insert_one(custom_order)
    return {"message": "Custom order created", "orderId": custom_order['orderId']}

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