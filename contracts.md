# API Contracts & Implementation Plan

## Mocked Data in mock.js (To be replaced with real data)

### Categories
- 8 service categories with counts
- Replace with: MongoDB collection `categories`

### Influencers/Users
- 6 influencers with profiles, services, ratings
- Replace with: MongoDB collections `users` and `services`

### Services
- 6 services with packages (basic, standard, premium)
- Replace with: MongoDB collection `services`

### Orders
- 2 sample orders with status tracking
- Replace with: MongoDB collection `orders`

### Messages
- 3 sample messages for order chat
- Replace with: MongoDB collection `messages`

### Reviews
- 3 sample reviews
- Replace with: MongoDB collection `reviews`

### Authentication
- LocalStorage-based mock auth
- Replace with: JWT tokens + Google OAuth

---

## Backend API Endpoints

### Authentication
```
POST   /api/auth/register          - Register new user (buyer/seller)
POST   /api/auth/login             - Login with email/password
POST   /api/auth/google            - Google OAuth login
GET    /api/auth/me                - Get current user
POST   /api/auth/logout            - Logout user
```

### Users
```
GET    /api/users/:id              - Get user profile
PUT    /api/users/:id              - Update user profile
GET    /api/users/:id/services     - Get user's services (if seller)
```

### Services
```
GET    /api/services               - Get all services (with filters, search, pagination)
GET    /api/services/:id           - Get service details
POST   /api/services               - Create new service (seller only)
PUT    /api/services/:id           - Update service
DELETE /api/services/:id           - Delete service
```

### Categories
```
GET    /api/categories             - Get all categories with counts
```

### Orders
```
GET    /api/orders                 - Get user's orders (buyer/seller)
GET    /api/orders/:id             - Get order details
POST   /api/orders                 - Create new order (with Stripe payment)
PUT    /api/orders/:id/deliver     - Deliver work (seller)
PUT    /api/orders/:id/accept      - Accept delivery (buyer)
PUT    /api/orders/:id/revision    - Request revision (buyer)
PUT    /api/orders/:id/cancel      - Cancel order
```

### Messages
```
GET    /api/messages/:orderId      - Get messages for an order
POST   /api/messages               - Send message
PUT    /api/messages/:id/read      - Mark message as read
```

### Reviews
```
GET    /api/reviews/:serviceId     - Get reviews for a service
POST   /api/reviews                - Create review (buyer only, after order completion)
```

### Payments (Stripe - Mocked)
```
POST   /api/payments/create-intent - Create payment intent
POST   /api/payments/confirm       - Confirm payment
POST   /api/payments/release       - Release escrow to seller
GET    /api/payments/:orderId      - Get payment status
```

---

## MongoDB Schema Design

### users
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  googleId: String (optional),
  avatar: String (URL),
  userType: String (buyer/seller/both),
  bio: String,
  platform: String (Instagram/YouTube/TikTok/etc),
  followers: String,
  username: String,
  level: String (Rising Talent/Top Rated/Pro Verified),
  rating: Number,
  reviewCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### services
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  title: String,
  description: String,
  category: String,
  image: String (URL),
  packages: {
    basic: {
      name: String,
      price: Number,
      delivery: Number (days),
      features: [String]
    },
    standard: { ... },
    premium: { ... }
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### orders
```javascript
{
  _id: ObjectId,
  orderId: String (ORD-XXXX),
  serviceId: ObjectId (ref: services),
  buyerId: ObjectId (ref: users),
  sellerId: ObjectId (ref: users),
  package: String (basic/standard/premium),
  price: Number,
  status: String (pending/in_progress/delivered/completed/cancelled),
  requirements: String,
  deliveryNote: String,
  deliveryFiles: [String],
  revisions: Number,
  maxRevisions: Number,
  paymentIntentId: String,
  paymentStatus: String (pending/held/released/refunded),
  createdAt: Date,
  deliveryDate: Date,
  completedAt: Date,
  updatedAt: Date
}
```

### messages
```javascript
{
  _id: ObjectId,
  orderId: ObjectId (ref: orders),
  senderId: ObjectId (ref: users),
  message: String,
  attachments: [String],
  isRead: Boolean,
  createdAt: Date
}
```

### reviews
```javascript
{
  _id: ObjectId,
  serviceId: ObjectId (ref: services),
  orderId: ObjectId (ref: orders),
  buyerId: ObjectId (ref: users),
  rating: Number (1-5),
  comment: String,
  createdAt: Date
}
```

### categories
```javascript
{
  _id: ObjectId,
  name: String,
  icon: String,
  count: Number (calculated)
}
```

---

## Frontend-Backend Integration

### Replace mock.js imports with API calls

1. **HomePage.js**
   - `categories` → GET /api/categories
   - `influencers` → GET /api/services (featured)

2. **BrowseServices.js**
   - `allServices` → GET /api/services?search=X&category=Y&sort=Z
   - `categories` → GET /api/categories

3. **ServiceDetail.js**
   - `allServices.find()` → GET /api/services/:id
   - `reviews` → GET /api/reviews/:serviceId
   - Order placement → POST /api/orders + POST /api/payments/create-intent

4. **AuthPage.js**
   - Login → POST /api/auth/login
   - Register → POST /api/auth/register
   - Google → POST /api/auth/google

5. **BuyerDashboard.js**
   - `orders` → GET /api/orders?role=buyer
   - Order details → GET /api/orders/:id

6. **SellerDashboard.js**
   - `orders` → GET /api/orders?role=seller
   - `services` → GET /api/users/:id/services
   - Earnings calculation → From orders data

7. **OrderPage.js**
   - Order data → GET /api/orders/:id
   - Deliver work → PUT /api/orders/:id/deliver
   - Accept delivery → PUT /api/orders/:id/accept
   - Request revision → PUT /api/orders/:id/revision

8. **MessagesPage.js**
   - Conversations → GET /api/messages (grouped by order)
   - Send message → POST /api/messages

### AuthContext Updates
- Store JWT token in localStorage
- Add token to all API requests (Authorization header)
- Implement token refresh logic
- Handle Google OAuth flow

---

## Implementation Steps

1. **Backend Setup**
   - Create MongoDB models
   - Implement authentication (JWT + bcrypt)
   - Set up Google OAuth
   - Create all API endpoints
   - Implement Stripe escrow logic (mocked)

2. **Frontend Integration**
   - Create API service layer (axios config with interceptors)
   - Update AuthContext with JWT
   - Replace all mock data with API calls
   - Add loading states and error handling
   - Implement real-time messaging (polling or WebSocket)

3. **Testing**
   - Test authentication flows
   - Test order creation and payment
   - Test messaging system
   - Test order status transitions
   - Test review submission
   - End-to-end testing

---

## Key Features Implementation

### Escrow Payment System (Mocked Stripe)
1. Buyer places order → Payment held in escrow (paymentStatus: 'held')
2. Seller delivers work → Order status: 'delivered'
3. Buyer accepts → Payment released (paymentStatus: 'released')
4. Buyer requests revision → Back to 'in_progress' (if revisions available)
5. Buyer cancels → Refund (paymentStatus: 'refunded')

### Order Status Flow
```
pending → in_progress → delivered → completed
                ↓
          (revision requested)
                ↓
           in_progress
```

### Authentication Flow
1. JWT stored in localStorage
2. Axios interceptor adds token to requests
3. Backend middleware verifies token
4. Google OAuth: Exchange code for token, create/login user
