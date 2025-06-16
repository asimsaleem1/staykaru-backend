# MongoDB Authentication Implementation

## Overview
This document describes the implementation of MongoDB-based email/password authentication replacing Firebase Authentication in the StayKaru project.

## Changes Made

### Backend
1. **JWT Configuration**: Using environment variables for secrets, with default values for development.
2. **Authentication Flow**:
   - Registration: Validates required fields, checks if email exists, creates user with plain text password
   - Login: Validates email/password, generates JWT token
   - Session: JWT tokens are used for authorization
   
3. **Guards Updated**:
   - LandlordGuard: Now uses JWT user information
   - FoodProviderGuard: Now uses JWT user information
   - All Firebase authentication references removed

4. **Services Updated**:
   - NotificationService: Updated to work without Firebase Admin
   - UserService: Added findByEmail method
   
5. **Controllers Updated**:
   - AuthController: Updated to use JwtAuthGuard
   - NotificationController: Updated to use JwtAuthGuard and JWT user ID

### Frontend (To Be Implemented)
1. **API Client**:
   - Add JWT token to requests via interceptors
   - Store tokens in AsyncStorage

2. **Authentication Context**:
   - Create login, register, logout functions
   - Manage authentication state
   - Store user info and tokens in AsyncStorage

3. **Login/Register Screens**:
   - Implement form validation with Formik/Yup
   - Connect to new authentication endpoints

## Remaining Tasks

### Backend
1. Remove any remaining Firebase references:
   - FirebaseService
   - FirebaseAuthGuard
   - Firebase config
   - Any other Firebase utilities

2. Update other controllers/guards:
   - Replace all uses of AuthGuard with JwtAuthGuard
   - Update any code that depends on Firebase UIDs
   - Ensure user roles are properly validated

3. Testing:
   - Test registration flow
   - Test login flow
   - Test protected endpoints
   - Test role-based access

### Frontend
1. Implement API client
2. Implement AuthContext
3. Create/update login screen
4. Create/update registration screen
5. Update navigation to use JWT authentication
6. Test the full authentication flow

## Testing the Authentication

### Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "student",
    "phone": "1234567890",
    "gender": "male"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Access Protected Endpoint
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Notes on Migration

The migration strategy is to make minimal changes to the existing codebase, focusing on:

1. Replacing Firebase Auth with JWT authentication
2. Using plain text passwords as requested
3. Keeping the same data model for users
4. Providing backward compatibility where possible
5. Ensuring all role-based guards work correctly

The code has been updated to follow the new authentication flow described in the requirements:

1. User registers with email, password, name, gender, etc.
2. User logs in with email and password
3. Backend validates credentials and returns JWT token
4. Frontend stores token in AsyncStorage
5. Token is included in all subsequent requests
6. Protected routes are guarded with JwtAuthGuard
