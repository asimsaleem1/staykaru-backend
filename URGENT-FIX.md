# URGENT FIX - User Not Found in Database

## The Problem
You registered a landlord user through Supabase, but the MongoDB database doesn't have a corresponding user record. The LandlordGuard is looking for the user in MongoDB but can't find it.

## Immediate Solutions

### Option 1: Register a New User (Recommended)
The updated registration system will now create both Supabase and MongoDB records. 

**POST** `http://localhost:3001/auth/register`
```json
{
  "email": "test.landlord@example.com",
  "password": "TestPass123!",
  "name": "Test Landlord",
  "role": "landlord"
}
```

### Option 2: Use Test User (Quick Testing)
**GET** `http://localhost:3001/auth/create-test-user/landlord`

This will create a test landlord user with both Supabase and MongoDB records.

### Option 3: Manual Database Sync (For Existing Users)
If you want to keep your existing Supabase user, you can manually create the MongoDB record:

**POST** `http://localhost:3001/users`
```json
{
  "firstName": "Your First Name",
  "lastName": "Your Last Name", 
  "email": "your-existing-email@example.com",
  "role": "landlord"
}
```

Then update the user record to include your Supabase user ID by finding your Supabase user ID and updating the MongoDB record.

## What Was Fixed
1. **AuthService** now creates MongoDB records during registration
2. **LandlordGuard** uses UserService instead of direct model injection
3. **AuthModule** imports UserModule for proper dependency injection
4. **Registration flow** now syncs users between Supabase and MongoDB

## Testing Your Fix
1. Register a new landlord user using the updated registration endpoint
2. Login to get the JWT token
3. Use the token to test accommodation creation
4. Should now work without "User not found in database" error

## Quick Test Commands

```bash
# 1. Create test landlord
curl -X GET http://localhost:3001/auth/create-test-user/landlord

# 2. Register new user (if you prefer custom credentials)
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "landlord@test.com",
    "password": "TestPass123!",
    "name": "Test Landlord",
    "role": "landlord"
  }'

# 3. Login with credentials
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "landlord@test.com",
    "password": "TestPass123!"
  }'

# 4. Test accommodation creation with JWT token
curl -X POST http://localhost:3001/accommodations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Accommodation",
    "description": "A test property",
    "type": "apartment",
    "price": 100.00,
    "city": "CITY_ID_HERE",
    "address": "123 Test Street",
    "maxGuests": 4,
    "bedrooms": 2,
    "bathrooms": 1,
    "amenities": ["wifi", "parking"],
    "photos": [],
    "isActive": true
  }'
```

The error should now be resolved!
