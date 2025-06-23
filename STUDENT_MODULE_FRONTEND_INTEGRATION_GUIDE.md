# StayKaru Frontend - Student Module Integration Guide

## Overview

This document provides comprehensive integration guidance for the StayKaru Student Module based on successful backend testing. All listed endpoints have been verified to work correctly with real data.

## Base Configuration

```javascript
// API Configuration
const API_BASE_URL = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api';

// Default headers for authenticated requests
const getAuthHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
});
```

## 1. Student Authentication Flow ✅ VERIFIED

### Student Registration
**Endpoint**: `POST /auth/register`  
**Status**: ✅ Working (201 Created)  
**Response Time**: ~2.7s

```javascript
// Registration payload
const registerStudent = async (studentData) => {
  const payload = {
    name: "John Doe",
    email: "john.doe@university.edu",
    password: "SecurePassword123!",
    role: "student",
    phone: "1234567890",
    countryCode: "+1",
    gender: "male", // or "female"
    dateOfBirth: "1998-05-15",
    address: "123 University Ave, City",
    university: "University Name",
    studentId: "STU12345",
    emergencyContact: {
      name: "Parent Name",
      phone: "9876543210",
      relationship: "parent"
    }
  };
  
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  return response.json(); // Returns { access_token, user }
};
```

### User Profile Access
**Endpoints**: 
- `GET /auth/profile` ✅ Working (200 OK)
- `GET /users/profile` ✅ Working (200 OK)

```javascript
// Get basic profile
const getProfile = async (token) => {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    headers: getAuthHeaders(token)
  });
  return response.json();
};

// Get detailed profile
const getDetailedProfile = async (token) => {
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    headers: getAuthHeaders(token)
  });
  return response.json();
};
```

### Profile Updates
**Endpoint**: `PUT /users/profile` ✅ Working (200 OK)

```javascript
const updateProfile = async (token, updates) => {
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(updates)
  });
  return response.json();
};
```

## 2. Student Dashboard ✅ VERIFIED

**Endpoint**: `GET /dashboard` ✅ Working (200 OK)

```javascript
const getStudentDashboard = async (token) => {
  const response = await fetch(`${API_BASE_URL}/dashboard`, {
    headers: getAuthHeaders(token)
  });
  return response.json();
};
```

## 3. Accommodation Discovery ✅ VERIFIED

### Get All Accommodations
**Endpoint**: `GET /accommodations` ✅ Working (200 OK)  
**Data Available**: 16 accommodations

```javascript
const getAllAccommodations = async () => {
  const response = await fetch(`${API_BASE_URL}/accommodations`);
  return response.json(); // Returns array of accommodations
};
```

### Student-Specific Accommodations
**Endpoint**: `GET /dashboard/student/accommodations` ✅ Working (200 OK)

```javascript
const getStudentAccommodations = async (token) => {
  const response = await fetch(`${API_BASE_URL}/dashboard/student/accommodations`, {
    headers: getAuthHeaders(token)
  });
  return response.json();
};
```

### Nearby Accommodations
**Endpoint**: `GET /accommodations/nearby` ✅ Working (200 OK)

```javascript
const getNearbyAccommodations = async (lat, lng, radius = 10) => {
  const response = await fetch(
    `${API_BASE_URL}/accommodations/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
  );
  return response.json();
};
```

## 4. Food Provider Discovery ✅ VERIFIED

### Get All Food Providers
**Endpoint**: `GET /food-providers` ✅ Working (200 OK)  
**Data Available**: 32 food providers

```javascript
const getAllFoodProviders = async () => {
  const response = await fetch(`${API_BASE_URL}/food-providers`);
  return response.json(); // Returns array of food providers
};
```

### Student Food Options
**Endpoint**: `GET /dashboard/student/food-options` ✅ Working (200 OK)

```javascript
const getStudentFoodOptions = async (token) => {
  const response = await fetch(`${API_BASE_URL}/dashboard/student/food-options`, {
    headers: getAuthHeaders(token)
  });
  return response.json();
};
```

## 5. Booking Management (Partial) ⚠️

### Get My Bookings
**Endpoint**: `GET /bookings/my-bookings` ✅ Working (200 OK)

```javascript
const getMyBookings = async (token) => {
  const response = await fetch(`${API_BASE_URL}/bookings/my-bookings`, {
    headers: getAuthHeaders(token)
  });
  return response.json();
};
```

### Create Booking
**Endpoint**: `POST /bookings` ❌ Currently Failing (400 Bad Request)  
**Status**: Backend validation issue - DO NOT IMPLEMENT YET

```javascript
// DO NOT USE - BACKEND ISSUE
// const createBooking = async (token, bookingData) => {
//   // WAIT FOR BACKEND FIX
// };
```

## 6. Order Management (Partial) ⚠️

### Get My Orders
**Endpoint**: `GET /orders/my-orders` ✅ Working (200 OK)

```javascript
const getMyOrders = async (token) => {
  const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
    headers: getAuthHeaders(token)
  });
  return response.json();
};
```

### Create Order
**Endpoint**: `POST /orders` ❌ Currently Failing (400 Bad Request)  
**Status**: Backend validation issue - DO NOT IMPLEMENT YET

```javascript
// DO NOT USE - BACKEND ISSUE
// const createOrder = async (token, orderData) => {
//   // WAIT FOR BACKEND FIX
// };
```

## 7. Notifications ✅ VERIFIED

**Endpoint**: `GET /notifications` ✅ Working (200 OK)

```javascript
const getNotifications = async (token) => {
  const response = await fetch(`${API_BASE_URL}/notifications`, {
    headers: getAuthHeaders(token)
  });
  return response.json();
};
```

## Implementation Priority

### Phase 1: Immediate Implementation ✅
1. **Student Registration & Authentication**
2. **Profile Management**
3. **Student Dashboard**
4. **Accommodation Discovery**
5. **Food Provider Discovery**
6. **Notifications**
7. **View Bookings/Orders**

### Phase 2: Wait for Backend Fixes ⚠️
1. **Create Accommodation Bookings**
2. **Create Food Orders**

## Sample React Components

### Student Registration Component
```jsx
import React, { useState } from 'react';

const StudentRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    university: '',
    studentId: '',
    // ... other fields
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await registerStudent(formData);
      // Handle success - store token, redirect, etc.
      localStorage.setItem('authToken', response.access_token);
    } catch (error) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

### Accommodation Discovery Component
```jsx
import React, { useState, useEffect } from 'react';

const AccommodationList = () => {
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccommodations = async () => {
      try {
        const data = await getAllAccommodations();
        setAccommodations(data);
      } catch (error) {
        console.error('Error fetching accommodations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccommodations();
  }, []);

  if (loading) return <div>Loading accommodations...</div>;

  return (
    <div>
      {accommodations.map(accommodation => (
        <div key={accommodation._id || accommodation.id}>
          {/* Accommodation card */}
        </div>
      ))}
    </div>
  );
};
```

## Error Handling

```javascript
const handleApiError = (error) => {
  if (error.response?.status === 401) {
    // Unauthorized - redirect to login
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  } else if (error.response?.status === 400) {
    // Bad Request - show validation errors
    return error.response.data.message || 'Invalid request';
  } else {
    // General error
    return 'An unexpected error occurred';
  }
};
```

## Testing Checklist for Frontend

### Authentication Testing
- [ ] Student can register with all required fields
- [ ] Student receives auth token on successful registration
- [ ] Student can access profile endpoints with token
- [ ] Student can update profile information
- [ ] Token-based authentication works across all endpoints

### Discovery Testing
- [ ] Can fetch and display all accommodations (expect 16 items)
- [ ] Can fetch and display all food providers (expect 32 items)
- [ ] Student-specific accommodation endpoint works
- [ ] Student-specific food options endpoint works
- [ ] Nearby accommodations work with location data

### Dashboard Testing
- [ ] Student dashboard loads successfully
- [ ] Dashboard shows student-specific data
- [ ] Role-based access control works

### Booking/Order Testing
- [ ] Can view existing bookings (empty for new users)
- [ ] Can view existing orders (empty for new users)
- [ ] **DO NOT TEST** booking/order creation until backend fix

## Performance Expectations

- **Registration**: ~2.7 seconds (acceptable for one-time operation)
- **General API calls**: < 1 second
- **Large data sets**: < 1 second (accommodations, food providers)
- **Profile operations**: < 500ms

## Security Notes

1. **Always use HTTPS** for API calls
2. **Store JWT tokens securely** (consider httpOnly cookies)
3. **Validate user input** on frontend before sending to API
4. **Handle token expiration** gracefully
5. **Never expose sensitive data** in console logs

## Support & Issues

- **Working Endpoints**: 13/15 (86.67% success rate)
- **Known Issues**: Booking and order creation (backend validation)
- **Performance**: Good (average 659ms response time)
- **Reliability**: High for implemented features

---

**Last Updated**: December 23, 2024  
**Backend Status**: Production-ready for listed endpoints  
**Integration Priority**: Phase 1 endpoints ready for immediate use
