from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError('Invalid ObjectId')
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type='string')

# Package Schema
class PackageDetails(BaseModel):
    name: str
    price: float
    delivery: int  # days
    features: List[str]

# Social Platform Schema
class SocialPlatform(BaseModel):
    platform: str  # Instagram, YouTube, TikTok, Twitter, Facebook, LinkedIn
    profileLink: str
    followers: str

# User Models
class UserBase(BaseModel):
    name: str
    email: EmailStr
    userType: str = 'buyer'  # buyer, seller, both
    avatar: Optional[str] = None
    bio: Optional[str] = None
    platform: Optional[str] = None  # Deprecated - keeping for backward compatibility
    followers: Optional[str] = None  # Deprecated - keeping for backward compatibility
    username: Optional[str] = None
    socialPlatforms: Optional[List[SocialPlatform]] = []

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleAuth(BaseModel):
    token: str

class UserInDB(UserBase):
    id: str = Field(alias='_id')
    level: str = 'Rising Talent'
    rating: float = 0.0
    reviewCount: int = 0
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    userType: str
    avatar: Optional[str]
    bio: Optional[str]
    platform: Optional[str]
    followers: Optional[str]
    username: Optional[str]
    level: str
    rating: float
    reviewCount: int
    socialPlatforms: Optional[List[SocialPlatform]] = []

# Service Models
class ServiceCreate(BaseModel):
    title: str
    description: str
    category: str
    image: str
    packages: Dict[str, PackageDetails]

class ServiceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    image: Optional[str] = None
    packages: Optional[Dict[str, PackageDetails]] = None
    isActive: Optional[bool] = None

class ServiceInDB(ServiceCreate):
    id: str = Field(alias='_id')
    userId: str
    isActive: bool = True
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class ServiceResponse(ServiceInDB):
    influencer: Optional[UserResponse] = None

# Order Models
class OrderCreate(BaseModel):
    serviceId: str
    package: str  # basic, standard, premium
    requirements: str

class OrderDeliver(BaseModel):
    deliveryNote: str
    deliveryFiles: Optional[List[str]] = []

class OrderRevision(BaseModel):
    revisionNote: str

class OrderInDB(BaseModel):
    id: str = Field(alias='_id')
    orderId: str
    serviceId: str
    buyerId: str
    sellerId: str
    package: str
    price: float
    status: str = 'pending'  # pending, in_progress, delivered, completed, cancelled
    requirements: str
    deliveryNote: Optional[str] = None
    deliveryFiles: List[str] = []
    revisions: int = 0
    maxRevisions: int = 1
    paymentIntentId: Optional[str] = None
    paymentStatus: str = 'pending'  # pending, held, released, refunded
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    deliveryDate: Optional[datetime] = None
    completedAt: Optional[datetime] = None
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

# Message Models
class MessageCreate(BaseModel):
    orderId: str
    message: str
    attachments: Optional[List[str]] = []

class MessageInDB(BaseModel):
    id: str = Field(alias='_id')
    orderId: str
    senderId: str
    message: str
    attachments: List[str] = []
    isRead: bool = False
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

# Review Models
class ReviewCreate(BaseModel):
    serviceId: str
    orderId: str
    rating: int  # 1-5
    comment: str

class ReviewInDB(BaseModel):
    id: str = Field(alias='_id')
    serviceId: str
    orderId: str
    buyerId: str
    rating: int
    comment: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class ReviewResponse(ReviewInDB):
    buyerName: Optional[str] = None
    buyerAvatar: Optional[str] = None

# Category Model
class CategoryResponse(BaseModel):
    id: str
    name: str
    icon: str
    count: int

# Payment Models
class PaymentIntent(BaseModel):
    orderId: str
    amount: float

class PaymentConfirm(BaseModel):
    paymentIntentId: str
    orderId: str