# Complete Test Workflow - StayKaru Backend

## Current Status ✅
- **Server**: Running on http://localhost:3001
- **Authentication Fix**: Implemented and tested
- **Registration**: Creates both Supabase and MongoDB records
- **Dependency Injection**: Fixed for LandlordGuard

## Step-by-Step Testing Guide

### Step 1: Register a New Landlord User

**PowerShell Command:**
```powershell
$registerResponse = Invoke-WebRequest -Uri "http://localhost:3001/auth/register" -Method POST -ContentType "application/json" -Body '{"email": "landlord.test@example.com", "password": "TestPass123!", "name": "Test Landlord", "role": "landlord"}'
```

**Expected Result:**
- Status: 201 Created
- Response contains user ID and session info
- Both Supabase and MongoDB records created

### Step 2: Handle Email Confirmation (Development Workaround)

Since email confirmation is required, you have two options:

**Option A: Use an existing confirmed user**
If you have access to the email, check for confirmation link.

**Option B: Create user directly in MongoDB (Quick testing)**
```powershell
$userResponse = Invoke-WebRequest -Uri "http://localhost:3001/users" -Method POST -ContentType "application/json" -Body '{"firstName": "Test", "lastName": "Landlord", "email": "landlord.direct@example.com", "role": "landlord"}'
```

### Step 3: Login and Get JWT Token

**For confirmed email users:**
```powershell
$loginResponse = Invoke-WebRequest -Uri "http://localhost:3001/auth/login" -Method POST -ContentType "application/json" -Body '{"email": "your-email@example.com", "password": "TestPass123!"}'
$token = ($loginResponse.Content | ConvertFrom-Json).access_token
```

### Step 4: Create Test Location Data

**Create a Country:**
```powershell
$countryResponse = Invoke-WebRequest -Uri "http://localhost:3001/location/countries" -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $token"} -Body '{"name": "Singapore", "code": "SG"}'
$countryId = ($countryResponse.Content | ConvertFrom-Json).id
```

**Create a City:**
```powershell
$cityResponse = Invoke-WebRequest -Uri "http://localhost:3001/location/cities" -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $token"} -Body "{`"name`": `"Singapore City`", `"countryId`": `"$countryId`", `"coordinates`": [103.8198, 1.3521]}"
$cityId = ($cityResponse.Content | ConvertFrom-Json).id
```

### Step 5: Test Accommodation Creation (The Main Fix)

```powershell
$accommodationResponse = Invoke-WebRequest -Uri "http://localhost:3001/accommodations" -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $token"} -Body "{`"title`": `"Test Accommodation`", `"description`": `"A test property`", `"type`": `"apartment`", `"price`": 100.00, `"city`": `"$cityId`", `"address`": `"123 Test Street`", `"maxGuests`": 4, `"bedrooms`": 2, `"bathrooms`": 1, `"amenities`": [`"wifi`", `"parking`"], `"photos`": [], `"isActive`": true}"
```

**Expected Result:**
- ✅ Status: 201 Created (not 403 Forbidden)
- ✅ No "User not found in database" error
- ✅ Accommodation created successfully

## Alternative Quick Test (If Email Issues Persist)

If email confirmation is blocking you, here's a direct MongoDB approach:

### 1. Create MongoDB User with Known Supabase ID
```powershell
# First register in Supabase to get the ID, then create MongoDB record
$mongoUser = Invoke-WebRequest -Uri "http://localhost:3001/users" -Method POST -ContentType "application/json" -Body '{"firstName": "Direct", "lastName": "Landlord", "email": "direct.landlord@test.com", "role": "landlord", "supabaseUserId": "your-supabase-id-here"}'
```

### 2. Use the user for testing
The key is ensuring the `supabaseUserId` in MongoDB matches your Supabase user ID.

## Verification Commands

**Check if user exists in MongoDB:**
```powershell
$users = Invoke-WebRequest -Uri "http://localhost:3001/users" -Method GET -Headers @{Authorization="Bearer $token"}
```

**Check cities:**
```powershell
$cities = Invoke-WebRequest -Uri "http://localhost:3001/location/cities" -Method GET -Headers @{Authorization="Bearer $token"}
```

**Check accommodations:**
```powershell
$accommodations = Invoke-WebRequest -Uri "http://localhost:3001/accommodations" -Method GET
```

## Success Indicators

✅ **Authentication Fixed**: User records exist in both Supabase and MongoDB  
✅ **LandlordGuard Working**: No more "User not found in database" errors  
✅ **Accommodation Creation**: Works without 403 Forbidden  
✅ **City Integration**: Accommodations use city IDs instead of location  
✅ **CRUD Operations**: All endpoints functional with proper authorization  

## Troubleshooting

**If you still get 403 errors:**
1. Verify JWT token is valid and not expired
2. Check that MongoDB user record exists with correct Supabase ID
3. Confirm user role is set to "landlord" in MongoDB
4. Test with a fresh registration using the updated flow

**If accommodation creation fails:**
1. Ensure you have a valid city ID
2. Check that all required fields are provided
3. Verify the JWT token has proper landlord permissions

The fix should resolve your original "User not found in database" error completely!
