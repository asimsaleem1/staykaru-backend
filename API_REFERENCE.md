# StayKaru API Quick Reference

## 🚀 **Base URL**
```
https://api.staykaru.tech/api
```

## 🔐 **Authentication Endpoints**

### **Register User**
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "securepassword123",
  "role": "student" // or "landlord"
}
```

### **Verify Firebase Token**
```http
POST /auth/verify-token
Content-Type: application/json

{
  "token": "firebase-id-token-here"
}
```

### **Get User Profile**
```http
POST /auth/profile
Content-Type: application/json

{
  "token": "firebase-id-token-here"
}
```

## 🏠 **Accommodation Endpoints**

### **Get All Accommodations**
```http
GET /accommodation
Authorization: Bearer <firebase-token>
```

### **Search Accommodations**
```http
GET /accommodation/search?location=karachi&priceMin=5000&priceMax=15000
Authorization: Bearer <firebase-token>
```

### **Create Accommodation (Landlord only)**
```http
POST /accommodation
Authorization: Bearer <firebase-token>
Content-Type: application/json

{
  "title": "Cozy Studio Apartment",
  "description": "Beautiful studio in city center",
  "price": 12000,
  "location": {
    "address": "123 Main St, Karachi",
    "coordinates": [67.0011, 24.8607]
  },
  "amenities": ["wifi", "parking", "security"],
  "images": ["url1", "url2"]
}
```

## 📅 **Booking Endpoints**

### **Create Booking**
```http
POST /booking
Authorization: Bearer <firebase-token>
Content-Type: application/json

{
  "accommodationId": "accommodation-id-here",
  "checkIn": "2024-07-01T00:00:00.000Z",
  "checkOut": "2024-07-15T00:00:00.000Z",
  "guests": 2
}
```

### **Get User Bookings**
```http
GET /booking/user
Authorization: Bearer <firebase-token>
```

## 🍕 **Food Service Endpoints**

### **Get Restaurants**
```http
GET /food-service
Authorization: Bearer <firebase-token>
```

### **Get Menu Items**
```http
GET /food-service/:restaurantId/menu
Authorization: Bearer <firebase-token>
```

### **Place Order**
```http
POST /order
Authorization: Bearer <firebase-token>
Content-Type: application/json

{
  "restaurantId": "restaurant-id-here",
  "items": [
    {
      "menuItemId": "item-id",
      "quantity": 2,
      "customizations": ["extra cheese", "no onions"]
    }
  ],
  "deliveryAddress": "123 Main St, Karachi"
}
```

## 💳 **Payment Endpoints**

### **Create Payment Intent**
```http
POST /payment/create-intent
Authorization: Bearer <firebase-token>
Content-Type: application/json

{
  "amount": 15000,
  "currency": "PKR",
  "bookingId": "booking-id-here"
}
```

## ⭐ **Review Endpoints**

### **Create Review**
```http
POST /review
Authorization: Bearer <firebase-token>
Content-Type: application/json

{
  "accommodationId": "accommodation-id-here",
  "rating": 5,
  "comment": "Amazing place, highly recommended!"
}
```

### **Get Reviews for Accommodation**
```http
GET /review/accommodation/:accommodationId
Authorization: Bearer <firebase-token>
```

## 🔔 **Notification Endpoints**

### **Get User Notifications**
```http
GET /notification
Authorization: Bearer <firebase-token>
```

### **Mark Notification as Read**
```http
PATCH /notification/:notificationId/read
Authorization: Bearer <firebase-token>
```

## 👤 **User Profile Endpoints**

### **Update Profile**
```http
PATCH /user/profile
Authorization: Bearer <firebase-token>
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "+92300123456",
  "address": "New Address"
}
```

### **Get Profile**
```http
GET /user/profile
Authorization: Bearer <firebase-token>
```

## 📊 **Response Format**

### **Success Response**
```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Operation successful"
}
```

### **Error Response**
```json
{
  "success": false,
  "error": "Error message here",
  "statusCode": 400
}
```

## 🔑 **Authentication Notes**

1. **All protected endpoints require** `Authorization: Bearer <firebase-token>` header
2. **Firebase tokens expire** - refresh them regularly
3. **Role-based access**: Some endpoints are restricted by user role
4. **Token format**: Get token from Firebase: `await user.getIdToken()`

## 📱 **Frontend Integration Example**

```javascript
// Get Firebase token
const user = auth().currentUser;
const token = await user.getIdToken();

// Make API call
const response = await fetch('https://api.staykaru.tech/api/accommodation', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

## 🚀 **Ready to Build!**

Your StayKaru backend is fully functional with:
- ✅ Firebase Authentication
- ✅ User Management  
- ✅ Accommodation Listings
- ✅ Booking System
- ✅ Food Ordering
- ✅ Payment Processing
- ✅ Reviews & Ratings
- ✅ Real-time Notifications

Start building your frontend and integrate these APIs! 🎉
