# 🔐 StayKaru Authentication System - Frontend Integration Guide

## 📝 Deployment Status
✅ **Successfully Deployed to Heroku**
- **Live API URL**: https://staykaru-backend-60ed08adb2a7.herokuapp.com/api
- **Swagger Documentation**: https://staykaru-backend-60ed08adb2a7.herokuapp.com/api
- **Deployment Time**: June 23, 2025

## 🚨 CRITICAL CHANGES - AUTHENTICATION SYSTEM OVERHAUL

### ❌ **REMOVED FEATURES** (Frontend Must Update)

#### 1. **2FA Authentication - COMPLETELY REMOVED**
- ❌ No more OTP/verification codes
- ❌ No email verification required
- ❌ Remove all 2FA related components from frontend
- ❌ Remove OTP input fields
- ❌ Remove email verification screens

#### 2. **Social Login - COMPLETELY REMOVED**  
- ❌ No Facebook login integration
- ❌ No Google login integration
- ❌ Remove all social login buttons from frontend
- ❌ Remove social login handling logic

#### 3. **Email Verification - REMOVED**
- ❌ Users can login immediately after registration
- ❌ No email verification step required
- ❌ Remove email verification screens from registration flow

### ✅ **NEW SIMPLIFIED AUTHENTICATION FLOW**

## 🔄 **Updated Registration Flow**

### **New Registration API**
```
POST https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/auth/register
```

### **Request Body**
```json
{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "password123",
  "role": "student", // "student" | "landlord" | "food_provider"
  "phone": "1234567890",
  "countryCode": "+1",
  "gender": "male", // "male" | "female" | "other"
  "profileImage": "https://example.com/profile.jpg", // optional
  "identificationType": "cnic", // "cnic" | "passport" 
  "identificationNumber": "12345-6789012-3"
}
```

### **Success Response** (Immediate Login)
```json
{
  "message": "Registration successful",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "phone": "1234567890",
    "countryCode": "+1",
    "gender": "male",
    "profileImage": "https://example.com/profile.jpg",
    "identificationType": "cnic",
    "identificationNumber": "12345-6789012-3",
    "isEmailVerified": true
  }
}
```

### **Frontend Implementation**
```javascript
// NEW Registration Function
async function registerUser(formData) {
  try {
    const response = await fetch('https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();
    
    if (response.ok) {
      // IMMEDIATE LOGIN - Store token and redirect
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect based on role
      redirectToDashboard(data.user.role);
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}

function redirectToDashboard(role) {
  switch(role) {
    case 'student':
      window.location.href = '/student/dashboard';
      break;
    case 'landlord': 
      window.location.href = '/landlord/dashboard';
      break;
    case 'food_provider':
      window.location.href = '/food-provider/dashboard';
      break;
    default:
      window.location.href = '/dashboard';
  }
}
```

## 🔑 **Updated Login Flow**

### **New Login API**
```
POST https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/auth/login
```

### **Request Body**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### **Success Response**
```json
{
  "message": "Login successful",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe", 
    "email": "john@example.com",
    "role": "student",
    "phone": "1234567890",
    "countryCode": "+1",
    "gender": "male",
    "profileImage": "https://example.com/profile.jpg",
    "university": "University Name", // for students
    "businessName": "Business Name", // for food providers
    "address": "Business Address" // for landlords/food providers
  }
}
```

### **Frontend Implementation**
```javascript
// NEW Login Function
async function loginUser(email, password) {
  try {
    const response = await fetch('https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (response.ok) {
      // Store authentication data
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect to role-specific dashboard
      redirectToDashboard(data.user.role);
    } else {
      throw new Error(data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}
```

## 🎯 **Role-Based Dashboard Access**

### **Get Dashboard Data**
```
GET https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/auth/dashboard
Authorization: Bearer {access_token}
```

### **Response Example (Student)**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com", 
  "role": "student",
  "university": "University Name",
  "studentId": "STU123456",
  "canViewAccommodations": true,
  "canViewFoodOptions": true,
  "canMakeBookings": true,
  "canMakeOrders": true
}
```

### **Response Example (Landlord)**
```json
{
  "id": "507f1f77bcf86cd799439012",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "landlord", 
  "address": "123 Property St",
  "businessLicense": "BL123456",
  "canManageAccommodations": true,
  "canViewBookings": true,
  "canViewRevenue": true,
  "canViewAnalytics": true
}
```

### **Response Example (Food Provider)**
```json
{
  "id": "507f1f77bcf86cd799439013",
  "name": "Mike's Restaurant",
  "email": "mike@restaurant.com",
  "role": "food_provider",
  "businessName": "Mike's Delicious Food",
  "address": "456 Food St",
  "canManageFoodOptions": true,
  "canViewOrders": true,
  "canViewRevenue": true,
  "canViewAnalytics": true
}
```

## 🔐 **Authentication Headers**

### **For All Protected Requests**
```javascript
const token = localStorage.getItem('access_token');

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};

// Example API call
fetch('https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/bookings/my-bookings', {
  method: 'GET',
  headers: headers
});
```

## 🎭 **Role-Specific Endpoints**

### **Student Endpoints**
```javascript
// View available accommodations
GET /api/dashboard/student/accommodations

// View available food options  
GET /api/dashboard/student/food-options

// View own bookings only
GET /api/bookings/my-bookings

// View own orders only
GET /api/orders/my-orders
```

### **Landlord Endpoints**
```javascript
// Manage own accommodations
GET /api/dashboard/landlord/accommodations

// View bookings for own properties
GET /api/bookings/landlord/bookings

// View own revenue analytics
GET /api/dashboard/landlord/revenue
```

### **Food Provider Endpoints**
```javascript
// Manage own food options
GET /api/dashboard/food-provider/food-options

// View orders for own food items
GET /api/orders/provider-orders

// View own revenue analytics
GET /api/dashboard/food-provider/revenue
```

## 🚨 **REQUIRED FRONTEND CHANGES**

### **1. Remove Components**
- ❌ Delete OTP input components
- ❌ Delete email verification screens
- ❌ Delete social login buttons
- ❌ Delete 2FA setup screens
- ❌ Delete forgot password flows

### **2. Update Registration Flow**
```javascript
// OLD FLOW (Remove This)
register → email verification → login

// NEW FLOW (Implement This)  
register → immediate login with token → redirect to dashboard
```

### **3. Update Login Flow**
```javascript
// OLD FLOW (Remove This)
login → check 2FA → OTP verification → dashboard

// NEW FLOW (Implement This)
login → immediate dashboard redirect based on role
```

### **4. Role-Based Routing**
```javascript
// Implement role-based routing
function setupRouting() {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user) {
    // Redirect to login
    window.location.href = '/login';
    return;
  }

  switch(user.role) {
    case 'student':
      // Show student-specific navigation
      showStudentMenu();
      break;
    case 'landlord':
      // Show landlord-specific navigation  
      showLandlordMenu();
      break;
    case 'food_provider':
      // Show food provider-specific navigation
      showFoodProviderMenu();
      break;
  }
}
```

### **5. API Error Handling**
```javascript
// Handle authentication errors
async function apiCall(url, options = {}) {
  const token = localStorage.getItem('access_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return;
    }
    
    return response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}
```

## 🎯 **User Experience Flow Examples**

### **Student Experience**
1. **Registration**: Fill form → Immediate login → Student dashboard
2. **Dashboard**: See accommodations, food options, personal bookings/orders
3. **Booking**: Browse all accommodations → Book → View in "My Bookings"
4. **Ordering**: Browse all food options → Order → View in "My Orders"

### **Landlord Experience**  
1. **Registration**: Fill form → Immediate login → Landlord dashboard
2. **Dashboard**: Manage properties, view bookings, revenue analytics
3. **Property Management**: Add/edit only own properties
4. **Bookings**: View only bookings for own properties

### **Food Provider Experience**
1. **Registration**: Fill form → Immediate login → Food Provider dashboard  
2. **Dashboard**: Manage menu, view orders, revenue analytics
3. **Menu Management**: Add/edit only own food items
4. **Orders**: View only orders for own food items

## 🔧 **Testing the New System**

### **Test Registration**
```bash
curl -X POST https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123", 
    "role": "student",
    "phone": "1234567890",
    "countryCode": "+1",
    "gender": "male",
    "identificationType": "cnic",
    "identificationNumber": "12345-6789012-3"
  }'
```

### **Test Login**
```bash
curl -X POST https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### **Test Dashboard Access**
```bash
curl -X GET https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/auth/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📋 **Frontend Implementation Checklist**

### **Priority 1 - Critical Changes**
- [ ] Remove all OTP/2FA components
- [ ] Remove social login buttons and logic
- [ ] Update registration to immediate login flow
- [ ] Update login to direct dashboard redirect
- [ ] Implement role-based routing

### **Priority 2 - Enhanced Features**
- [ ] Implement role-specific navigation menus
- [ ] Add user data isolation (users see only their data)
- [ ] Implement proper error handling for 401 responses
- [ ] Add role-based permission checks in UI

### **Priority 3 - Testing**
- [ ] Test registration flow for all roles
- [ ] Test login flow for all roles  
- [ ] Test role-specific dashboard access
- [ ] Test data isolation (users can't see others' data)
- [ ] Test token refresh/expiration handling

## 🚀 **Ready for Implementation**

The backend is now live and ready for frontend integration. All authentication endpoints are simplified and role-based access control is fully implemented. 

**Start with Priority 1 changes to get the basic authentication working, then move to enhanced features.**

---

**Live API**: https://staykaru-backend-60ed08adb2a7.herokuapp.com/api
**Documentation**: Available at the above URL with full Swagger docs
