# StayKaru Backend - Simplified Authentication & Role-Based Access Control

## Overview

This StayKaru backend has been updated with simplified authentication and user-specific dashboard access control. The system now provides a clean, email-based authentication flow without 2FA or social login complications, while ensuring users can only access their own data and appropriate resources based on their roles.

## Key Changes Made

### 1. Removed 2FA and Social Login
- Eliminated OTP/2FA authentication flows
- Removed Facebook and Google social login integration
- Simplified registration and login to email/password only
- Removed unnecessary DTO files: `enable-2fa.dto.ts`, `verify-2fa.dto.ts`, `facebook-login.dto.ts`, `google-login.dto.ts`, `social-login.dto.ts`, etc.
- Removed social authentication services and schemas

### 2. Simplified Authentication Flow
- **Registration**: Direct email/password registration with immediate login
- **Login**: Simple email/password validation with JWT token generation
- **No Email Verification**: Users can immediately access their account after registration
- **Password Management**: Basic password change functionality maintained

### 3. Role-Based Dashboard Access Control

#### Student Users
- **Can Access**:
  - Available accommodations (view all)
  - Available food options (view all)
  - Their own bookings (`/dashboard/student/accommodations`)
  - Their own orders (`/dashboard/student/food-options`)
  - Personal dashboard with booking/order statistics

#### Landlord Users
- **Can Access**:
  - Their own accommodations (manage)
  - Bookings for their properties
  - Revenue analytics for their properties
  - Personal dashboard with property statistics
- **Cannot Access**: Food-related resources

#### Food Provider Users
- **Can Access**:
  - Their own food options (manage)
  - Orders for their food items
  - Revenue analytics for their business
  - Personal dashboard with order statistics
- **Cannot Access**: Accommodation-related resources

## New API Endpoints

### Authentication
```
POST /auth/register          # Register new user
POST /auth/login            # Login with email/password
GET  /auth/profile          # Get user profile
GET  /auth/dashboard        # Get role-based dashboard data
POST /auth/change-password  # Change password
GET  /auth/check-access/:resourceType  # Check resource access
```

### Dashboard (Role-Based)
```
GET /dashboard                           # Get user dashboard with role-specific data
GET /dashboard/student/accommodations    # Student: Available accommodations
GET /dashboard/student/food-options      # Student: Available food options
GET /dashboard/landlord/accommodations   # Landlord: Manage accommodations
GET /dashboard/landlord/revenue          # Landlord: Revenue analytics
GET /dashboard/food-provider/food-options # Food Provider: Manage food options
GET /dashboard/food-provider/revenue      # Food Provider: Revenue analytics
```

### Bookings (User-Specific)
```
GET /bookings/my-bookings        # Student: Their bookings only
GET /bookings/landlord/bookings  # Landlord: Their property bookings only
```

### Orders (User-Specific)
```
GET /orders/my-orders           # Student: Their orders only
GET /orders/provider-orders     # Food Provider: Their food orders only
```

## Security Features

### 1. Role-Based Access Guard
- `RoleBasedAccessGuard` enforces user-specific data access
- Automatically checks if users can access requested resources
- Prevents cross-user data access

### 2. User Isolation
- Students can only see their own bookings and orders
- Landlords can only manage their own accommodations and see their bookings
- Food providers can only manage their food options and see their orders
- No user can access other users' private data

### 3. JWT Authentication
- Secure JWT tokens with user role and ID embedded
- Token-based authentication for all protected routes
- Automatic user context injection in requests

## Database Schema Updates

### User Schema Changes
- Removed social login fields: `facebookId`, `googleId`, `socialProvider`
- Simplified authentication to email/password only
- Maintained role-based user differentiation

### Maintained User Roles
- `STUDENT`: Can view accommodations/food, make bookings/orders
- `LANDLORD`: Can manage accommodations, view their bookings
- `FOOD_PROVIDER`: Can manage food options, view their orders
- `ADMIN`: Full system access

## Usage Examples

### 1. Student Registration & Access
```javascript
// Register as student
POST /auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",
  "phone": "1234567890",
  "countryCode": "+1",
  "gender": "male"
}

// Login and get token
POST /auth/login
{
  "email": "john@example.com",
  "password": "password123"
}

// Access student dashboard
GET /dashboard
Authorization: Bearer <token>

// View available accommodations
GET /dashboard/student/accommodations
Authorization: Bearer <token>

// View personal bookings
GET /bookings/my-bookings
Authorization: Bearer <token>
```

### 2. Landlord Property Management
```javascript
// Register as landlord
POST /auth/register
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "role": "landlord",
  "phone": "1234567890",
  "countryCode": "+1",
  "gender": "female",
  "address": "123 Property St"
}

// Access landlord dashboard
GET /dashboard
Authorization: Bearer <token>

// Manage accommodations
GET /dashboard/landlord/accommodations
Authorization: Bearer <token>

// View revenue analytics
GET /dashboard/landlord/revenue
Authorization: Bearer <token>
```

### 3. Food Provider Business Management
```javascript
// Register as food provider
POST /auth/register
{
  "name": "Mike's Restaurant",
  "email": "mike@restaurant.com",
  "password": "password123",
  "role": "food_provider",
  "phone": "1234567890",
  "countryCode": "+1",
  "gender": "male",
  "businessName": "Mike's Delicious Food"
}

// Access food provider dashboard
GET /dashboard
Authorization: Bearer <token>

// Manage food options
GET /dashboard/food-provider/food-options
Authorization: Bearer <token>

// View business orders
GET /orders/provider-orders
Authorization: Bearer <token>
```

## Development Setup

### 1. Environment Variables
Ensure these are set in your `.env` file:
```
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
MONGODB_URI=mongodb://localhost:27017/staykaru
```

### 2. Run the Application
```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start in development mode
npm run start:dev

# Start in production mode
npm run start:prod
```

## Security Considerations

1. **Data Isolation**: Each user can only access their own data
2. **Role Enforcement**: Users cannot access resources outside their role permissions
3. **JWT Security**: Secure token-based authentication
4. **Password Hashing**: bcrypt with salt rounds for secure password storage
5. **Input Validation**: All inputs validated using class-validator decorators

## API Documentation

The API documentation is available via Swagger UI when the application is running:
- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

## Testing Authentication

You can test the authentication system using tools like Postman or curl:

1. Register a user with different roles
2. Login to get JWT token
3. Use the token to access role-specific endpoints
4. Verify that cross-role access is properly blocked

The system ensures that each user type (student, landlord, food provider) has access only to their appropriate resources and data.
