# StayKaru API Reference for Frontend

## Base URL
```
https://staykaru-backend-60ed08adb2a7.herokuapp.com
```

## Authentication

### Register
```
POST /auth/register
```

**Request Body:**
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "securePassword123",
  "phone": "+1234567890",
  "role": "user|landlord|food_provider|admin",
  "gender": "male|female|other"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully"
}
```

### Login
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "user|landlord|food_provider|admin",
    "phone": "+1234567890",
    "gender": "male|female|other",
    "isActive": true
  }
}
```

## User Management

### Get User Profile
```
GET /users/profile
```
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "user": {
    "_id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "user|landlord|food_provider|admin",
    "phone": "+1234567890",
    "gender": "male|female|other",
    "isActive": true
  }
}
```

### Update User Profile
```
PATCH /users/profile
```
**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "name": "Updated Name",
  "phone": "+9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "_id": "user_id",
    "name": "Updated Name",
    "email": "user@example.com",
    "phone": "+9876543210",
    "role": "user|landlord|food_provider|admin",
    "gender": "male|female|other",
    "isActive": true
  }
}
```

### Change Password
```
PUT /users/change-password
```
**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "oldPassword": "currentPassword",
  "newPassword": "newSecurePassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

### Update FCM Token
```
POST /users/fcm-token
```
**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "fcmToken": "firebase_cloud_messaging_token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "FCM token updated successfully"
}
```

## Accommodations

### Get All Accommodations
```
GET /accommodations
```

**Query Parameters:**
- `city` (optional): Filter by city ID
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)

**Response:**
```json
{
  "accommodations": [
    {
      "_id": "accommodation_id",
      "title": "Accommodation Title",
      "description": "Accommodation Description",
      "city": {
        "_id": "city_id",
        "name": "City Name"
      },
      "price": 1500,
      "amenities": ["WiFi", "Parking", "Kitchen"],
      "availability": ["2025-06-22", "2025-06-23"],
      "images": ["image_url_1", "image_url_2"],
      "status": "pending|approved|rejected",
      "isActive": true,
      "landlord": {
        "_id": "landlord_id",
        "name": "Landlord Name"
      },
      "createdAt": "2025-06-21T08:30:00.000Z",
      "updatedAt": "2025-06-21T08:30:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

### Get Accommodation Details
```
GET /accommodations/:id
```

**Response:**
```json
{
  "accommodation": {
    "_id": "accommodation_id",
    "title": "Accommodation Title",
    "description": "Accommodation Description",
    "city": {
      "_id": "city_id",
      "name": "City Name"
    },
    "price": 1500,
    "amenities": ["WiFi", "Parking", "Kitchen"],
    "availability": ["2025-06-22", "2025-06-23"],
    "images": ["image_url_1", "image_url_2"],
    "status": "pending|approved|rejected",
    "isActive": true,
    "landlord": {
      "_id": "landlord_id",
      "name": "Landlord Name"
    },
    "createdAt": "2025-06-21T08:30:00.000Z",
    "updatedAt": "2025-06-21T08:30:00.000Z"
  }
}
```

### Create Accommodation (Landlord)
```
POST /accommodations
```
**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "title": "Accommodation Title",
  "description": "Accommodation Description",
  "city": "city_id",
  "price": 1500,
  "amenities": ["WiFi", "Parking", "Kitchen"],
  "availability": ["2025-06-22", "2025-06-23"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Accommodation created successfully, pending approval",
  "_id": "accommodation_id"
}
```

## Landlord Dashboard

### Get Landlord Dashboard Overview
```
GET /accommodations/landlord/dashboard
```
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "totalAccommodations": 5,
  "pendingAccommodations": 2,
  "approvedAccommodations": 3,
  "rejectedAccommodations": 0,
  "totalBookings": 10,
  "revenue": 15000,
  "recentBookings": [
    {
      "_id": "booking_id",
      "accommodation": {
        "_id": "accommodation_id",
        "title": "Accommodation Title"
      },
      "user": {
        "_id": "user_id",
        "name": "User Name"
      },
      "checkIn": "2025-06-22",
      "checkOut": "2025-06-24",
      "totalAmount": 3000,
      "status": "confirmed|cancelled|completed",
      "createdAt": "2025-06-21T08:30:00.000Z"
    }
  ]
}
```

### Get Landlord Accommodations
```
GET /accommodations/landlord
```
**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `status` (optional): Filter by status (pending|approved|rejected)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)

**Response:**
```json
{
  "accommodations": [
    {
      "_id": "accommodation_id",
      "title": "Accommodation Title",
      "description": "Accommodation Description",
      "city": {
        "_id": "city_id",
        "name": "City Name"
      },
      "price": 1500,
      "amenities": ["WiFi", "Parking", "Kitchen"],
      "availability": ["2025-06-22", "2025-06-23"],
      "images": ["image_url_1", "image_url_2"],
      "status": "pending|approved|rejected",
      "isActive": true,
      "createdAt": "2025-06-21T08:30:00.000Z",
      "updatedAt": "2025-06-21T08:30:00.000Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

### Get Landlord Statistics
```
GET /users/landlord/statistics
```
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "totalAccommodations": 5,
  "totalBookings": 10,
  "totalRevenue": 15000,
  "accommodationsByStatus": {
    "pending": 2,
    "approved": 3,
    "rejected": 0
  },
  "bookingsByStatus": {
    "confirmed": 5,
    "cancelled": 2,
    "completed": 3
  },
  "revenueByMonth": {
    "Jan": 1000,
    "Feb": 2000,
    "Mar": 3000,
    "Apr": 2500,
    "May": 4000,
    "Jun": 2500
  }
}
```

### Get Landlord Revenue
```
GET /users/landlord/revenue
```
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "totalRevenue": 15000,
  "revenueByMonth": {
    "Jan": 1000,
    "Feb": 2000,
    "Mar": 3000,
    "Apr": 2500,
    "May": 4000,
    "Jun": 2500
  },
  "revenueByAccommodation": [
    {
      "accommodation": {
        "_id": "accommodation_id",
        "title": "Accommodation Title"
      },
      "revenue": 5000
    }
  ]
}
```

### Get Landlord Bookings
```
GET /users/landlord/bookings
```
**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `status` (optional): Filter by status (confirmed|cancelled|completed)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)

**Response:**
```json
{
  "bookings": [
    {
      "_id": "booking_id",
      "accommodation": {
        "_id": "accommodation_id",
        "title": "Accommodation Title"
      },
      "user": {
        "_id": "user_id",
        "name": "User Name"
      },
      "checkIn": "2025-06-22",
      "checkOut": "2025-06-24",
      "totalAmount": 3000,
      "status": "confirmed|cancelled|completed",
      "createdAt": "2025-06-21T08:30:00.000Z"
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

## Admin Controls

### Get Admin Dashboard
```
GET /analytics/dashboard
```
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "totalUsers": 100,
  "totalAccommodations": 50,
  "totalFoodProviders": 20,
  "totalBookings": 200,
  "totalRevenue": 300000,
  "usersByRole": {
    "user": 80,
    "landlord": 15,
    "food_provider": 5,
    "admin": 2
  },
  "accommodationsByStatus": {
    "pending": 10,
    "approved": 35,
    "rejected": 5
  },
  "foodProvidersByStatus": {
    "pending": 5,
    "approved": 12,
    "rejected": 3
  },
  "revenueByMonth": {
    "Jan": 50000,
    "Feb": 40000,
    "Mar": 60000,
    "Apr": 45000,
    "May": 55000,
    "Jun": 50000
  }
}
```

### Get All Users (Admin)
```
GET /users/admin/all
```
**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `role` (optional): Filter by role (user|landlord|food_provider|admin)
- `isActive` (optional): Filter by active status (true|false)
- `search` (optional): Search by name or email
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)

**Response:**
```json
{
  "users": [
    {
      "_id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "role": "user|landlord|food_provider|admin",
      "phone": "+1234567890",
      "gender": "male|female|other",
      "isActive": true,
      "createdAt": "2025-06-21T08:30:00.000Z",
      "updatedAt": "2025-06-21T08:30:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

### Toggle User Status (Admin)
```
PATCH /users/admin/:userId/toggle-status
```
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "User status updated successfully",
  "user": {
    "_id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "user|landlord|food_provider|admin",
    "isActive": false
  }
}
```

### Get Pending Accommodations (Admin)
```
GET /accommodations/admin/pending
```
**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)

**Response:**
```json
{
  "accommodations": [
    {
      "_id": "accommodation_id",
      "title": "Accommodation Title",
      "description": "Accommodation Description",
      "city": {
        "_id": "city_id",
        "name": "City Name"
      },
      "price": 1500,
      "amenities": ["WiFi", "Parking", "Kitchen"],
      "landlord": {
        "_id": "landlord_id",
        "name": "Landlord Name"
      },
      "status": "pending",
      "createdAt": "2025-06-21T08:30:00.000Z"
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

### Approve Accommodation (Admin)
```
PATCH /accommodations/admin/:id/approve
```
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Accommodation approved successfully",
  "accommodation": {
    "_id": "accommodation_id",
    "title": "Accommodation Title",
    "status": "approved",
    "approvedBy": "admin_id",
    "approvedAt": "2025-06-21T08:30:00.000Z"
  }
}
```

### Reject Accommodation (Admin)
```
PATCH /accommodations/admin/:id/reject
```
**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "reason": "Rejection reason"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Accommodation rejected successfully",
  "accommodation": {
    "_id": "accommodation_id",
    "title": "Accommodation Title",
    "status": "rejected",
    "rejectionReason": "Rejection reason",
    "rejectedBy": "admin_id",
    "rejectedAt": "2025-06-21T08:30:00.000Z"
  }
}
```

### Toggle Accommodation Status (Admin)
```
PATCH /accommodations/admin/:id/toggle-status
```
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Accommodation status updated successfully",
  "accommodation": {
    "_id": "accommodation_id",
    "title": "Accommodation Title",
    "isActive": false
  }
}
```

## Food Providers

### Get All Food Providers (Admin)
```
GET /food-providers/admin/all
```
**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `status` (optional): Filter by status (pending|approved|rejected)
- `isActive` (optional): Filter by active status (true|false)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)

**Response:**
```json
{
  "foodProviders": [
    {
      "_id": "provider_id",
      "name": "Food Provider Name",
      "description": "Food Provider Description",
      "address": "123 Main St",
      "city": {
        "_id": "city_id",
        "name": "City Name"
      },
      "owner": {
        "_id": "owner_id",
        "name": "Owner Name"
      },
      "status": "pending|approved|rejected",
      "isActive": true,
      "createdAt": "2025-06-21T08:30:00.000Z",
      "updatedAt": "2025-06-21T08:30:00.000Z"
    }
  ],
  "total": 20,
  "page": 1,
  "limit": 10,
  "totalPages": 2
}
```

### Get Pending Food Providers (Admin)
```
GET /food-providers/admin/pending
```
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "foodProviders": [
    {
      "_id": "provider_id",
      "name": "Food Provider Name",
      "description": "Food Provider Description",
      "address": "123 Main St",
      "city": {
        "_id": "city_id",
        "name": "City Name"
      },
      "owner": {
        "_id": "owner_id",
        "name": "Owner Name"
      },
      "status": "pending",
      "createdAt": "2025-06-21T08:30:00.000Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

### Approve Food Provider (Admin)
```
PATCH /food-providers/admin/:id/approve
```
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Food provider approved successfully",
  "foodProvider": {
    "_id": "provider_id",
    "name": "Food Provider Name",
    "status": "approved",
    "approvedBy": "admin_id",
    "approvedAt": "2025-06-21T08:30:00.000Z"
  }
}
```

### Reject Food Provider (Admin)
```
PATCH /food-providers/admin/:id/reject
```
**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "reason": "Rejection reason"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Food provider rejected successfully",
  "foodProvider": {
    "_id": "provider_id",
    "name": "Food Provider Name",
    "status": "rejected",
    "rejectionReason": "Rejection reason",
    "rejectedBy": "admin_id",
    "rejectedAt": "2025-06-21T08:30:00.000Z"
  }
}
```

### Toggle Food Provider Status (Admin)
```
PATCH /food-providers/admin/:id/toggle-status
```
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Food provider status updated successfully",
  "foodProvider": {
    "_id": "provider_id",
    "name": "Food Provider Name",
    "isActive": false
  }
}
```

## Cities

### Get All Cities
```
GET /location/cities
```

**Response:**
```json
[
  {
    "_id": "city_id",
    "name": "City Name",
    "country": "Country Name"
  }
]
```

## Health Check

### Check API Health
```
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-06-21T08:30:00.000Z"
}
```

---

## Error Handling

All API endpoints will return appropriate HTTP status codes:

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses follow this format:

```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "details": "Additional error details (optional)"
  }
}
```
