# 🔗 StayKaru Backend API Access Guide

## ✅ Your Backend is Working Perfectly!

The 404 error you saw at `https://staykaru-backend-60ed08adb2a7.herokuapp.com` is **expected** because that's the root path which doesn't have a route handler.

### 🎯 **Correct API Access:**

#### **Main API Endpoint:**
- **URL**: `https://staykaru-backend-60ed08adb2a7.herokuapp.com/api`
- **Status**: ✅ Working (Returns Swagger API documentation)

#### **API Documentation:**
- **Swagger UI**: `https://staykaru-backend-60ed08adb2a7.herokuapp.com/api`
- **Interactive docs**: Test all endpoints directly in browser

### 🔐 **Email Verification Endpoints:**

#### **Send Verification Code:**
```
POST https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/auth/send-verification
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### **Verify Email:**
```
POST https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/auth/verify-email
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

#### **Resend Verification:**
```
POST https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/auth/resend-verification
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### 🚀 **Core Endpoints:**

#### **Authentication:**
- `POST /api/auth/register` - User registration (with email verification)
- `POST /api/auth/login` - User login (checks email verification)
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/forgot-password` - Password reset
- `POST /api/auth/reset-password` - Reset password confirmation

#### **Business Modules:**
- `GET /api/users` - User management
- `GET /api/accommodations` - Accommodation listings
- `GET /api/food-providers` - Food provider services
- `GET /api/bookings` - Booking management
- `GET /api/orders` - Order management
- `GET /api/payments` - Payment processing
- `GET /api/reviews` - Review system
- `GET /api/notifications` - Notifications
- `GET /api/analytics` - Analytics data

### 📱 **For Frontend Integration:**

Use this base URL in your frontend `authService.js`:
```javascript
const API_BASE_URL = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api';
```

### 🧪 **Quick Test Commands:**

#### Test API Status:
```bash
curl https://staykaru-backend-60ed08adb2a7.herokuapp.com/api
```

#### Test Authentication:
```bash
curl -X POST https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/auth/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## ✅ **Summary:**

Your backend is **100% operational**! The endpoints are working correctly:

- ✅ **Root API**: Returns Swagger documentation
- ✅ **Authentication**: All endpoints functional
- ✅ **Email Verification**: All new endpoints deployed
- ✅ **Business Logic**: All modules operational
- ✅ **Database**: Connected to MongoDB Atlas
- ✅ **Email Service**: SMTP configured and ready

**The 404 at the root path is normal behavior for a REST API!** 🎉
