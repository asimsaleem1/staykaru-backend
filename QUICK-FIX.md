# QUICK FIX - Create MongoDB User Record

## Your Immediate Solution

Since you already have a Supabase user but missing the MongoDB record, here's the quick fix:

### Step 1: Create MongoDB User Record Directly

**POST** `http://localhost:3001/users`
```json
{
  "firstName": "Your First Name",
  "lastName": "Your Last Name",
  "email": "your-email@example.com",
  "role": "landlord",
  "supabaseUserId": "your-supabase-user-id"
}
```

### Step 2: Find Your Supabase User ID

You can get your Supabase user ID from the JWT token payload or by checking the Supabase dashboard.

### Step 3: Test the Fix

After creating the MongoDB record, test your accommodation creation again:

**POST** `http://localhost:3001/accommodations`
```json
{
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
}
```

### Alternative: Use PowerShell to Create User

If you know your user details, you can directly create the MongoDB record:

```powershell
Invoke-WebRequest -Uri "http://localhost:3001/users" -Method POST -ContentType "application/json" -Body '{"firstName": "Test", "lastName": "Landlord", "email": "your-email@domain.com", "role": "landlord"}'
```

The error "User not found in database" should be resolved after creating the MongoDB user record that corresponds to your Supabase user.

## Verified Working Solution

I just tested the new registration flow and it works:
- ✅ User registration creates both Supabase and MongoDB records  
- ✅ The integration between AuthService and UserService is working
- ✅ New users registered through `/auth/register` will have complete records

For your immediate testing, either:
1. Register a fresh user (recommended)
2. Manually create the MongoDB record for your existing Supabase user
