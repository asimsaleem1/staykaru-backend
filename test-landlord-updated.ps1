# Updated Landlord Dashboard Test with Fixes

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

Write-Host "=== StayKaru Landlord Dashboard Test (Updated) ===" -ForegroundColor Green

# 1. Register a new landlord
Write-Host "`n1. Testing User Registration (Landlord)..." -ForegroundColor Yellow
$registerData = @{
    name = "Test Landlord Updated"
    email = "landlord.updated.$(Get-Random)@test.com"
    password = "Test123!@#"
    phone = "+1234567890"
    role = "landlord"
    gender = "male"
}

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body ($registerData | ConvertTo-Json) -ContentType "application/json"
    Write-Host "✅ Registration successful" -ForegroundColor Green
    Write-Host "Message: $($registerResponse.message)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Login with landlord credentials
Write-Host "`n2. Testing User Login..." -ForegroundColor Yellow
$loginData = @{
    email = $registerData.email
    password = $registerData.password
}

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
    $token = $loginResponse.access_token
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "Token received: $($token.Substring(0, 20))..." -ForegroundColor Cyan
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 3. Get existing cities first
Write-Host "`n3. Getting available cities..." -ForegroundColor Yellow
try {
    $citiesResponse = Invoke-RestMethod -Uri "$baseUrl/location/cities" -Method GET
    Write-Host "✅ Found $($citiesResponse.Count) cities" -ForegroundColor Green
    $existingCityId = $citiesResponse[0]._id
    Write-Host "Using city: $($citiesResponse[0].name) (ID: $existingCityId)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to get cities: $($_.Exception.Message)" -ForegroundColor Red
    $existingCityId = "683700350f8a15197d2abf4f"  # Fallback to known city ID
    Write-Host "Using fallback city ID: $existingCityId" -ForegroundColor Cyan
}

# 4. Create accommodation with existing city
Write-Host "`n4. Testing Create Accommodation..." -ForegroundColor Yellow
$accommodationData = @{
    title = "Cozy Apartment Updated"
    description = "A comfortable 2-bedroom apartment in the city center"
    city = $existingCityId
    price = 1500
    amenities = @("WiFi", "Parking", "Kitchen")
    availability = @("2024-06-22", "2024-06-23", "2024-06-24")
}

try {
    $accommodationResponse = Invoke-RestMethod -Uri "$baseUrl/accommodations" -Method POST -Body ($accommodationData | ConvertTo-Json) -Headers $headers
    Write-Host "✅ Accommodation created successfully" -ForegroundColor Green
    Write-Host "Accommodation ID: $($accommodationResponse._id)" -ForegroundColor Cyan
    Write-Host "Status: $($accommodationResponse.approvalStatus)" -ForegroundColor Cyan
    $accommodationId = $accommodationResponse._id
} catch {
    Write-Host "❌ Accommodation creation failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Error details: $responseBody" -ForegroundColor Red
        } catch {
            Write-Host "Could not read error details" -ForegroundColor Red
        }
    }
}

# 5. Get landlord dashboard overview
Write-Host "`n5. Testing Get Landlord Dashboard Overview..." -ForegroundColor Yellow
try {
    $dashboardResponse = Invoke-RestMethod -Uri "$baseUrl/landlord/dashboard" -Method GET -Headers $headers
    Write-Host "✅ Dashboard overview retrieved" -ForegroundColor Green
    Write-Host "Total Accommodations: $($dashboardResponse.totalAccommodations)" -ForegroundColor Cyan
    Write-Host "Total Bookings: $($dashboardResponse.totalBookings)" -ForegroundColor Cyan
    Write-Host "Revenue: $($dashboardResponse.revenue)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Dashboard overview failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Get landlord accommodations
Write-Host "`n6. Testing Get Landlord Accommodations..." -ForegroundColor Yellow
try {
    $accommodationsResponse = Invoke-RestMethod -Uri "$baseUrl/landlord/accommodations" -Method GET -Headers $headers
    Write-Host "✅ Landlord accommodations retrieved" -ForegroundColor Green
    Write-Host "Number of accommodations: $($accommodationsResponse.Count)" -ForegroundColor Cyan
    if ($accommodationsResponse.Count -gt 0) {
        Write-Host "First accommodation: $($accommodationsResponse[0].title)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Get landlord accommodations failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. Get landlord profile
Write-Host "`n7. Testing Get Landlord Profile..." -ForegroundColor Yellow
try {
    $profileResponse = Invoke-RestMethod -Uri "$baseUrl/landlord/profile" -Method GET -Headers $headers
    Write-Host "✅ Landlord profile retrieved" -ForegroundColor Green
    Write-Host "Name: $($profileResponse.name)" -ForegroundColor Cyan
    Write-Host "Email: $($profileResponse.email)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Get landlord profile failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Error details: $responseBody" -ForegroundColor Red
        } catch {
            Write-Host "Could not read error details" -ForegroundColor Red
        }
    }
}

# 8. Change password
Write-Host "`n8. Testing Change Password..." -ForegroundColor Yellow
$changePasswordData = @{
    currentPassword = $registerData.password
    newPassword = "NewTest123!@#"
}

try {
    $changePasswordResponse = Invoke-RestMethod -Uri "$baseUrl/landlord/change-password" -Method POST -Body ($changePasswordData | ConvertTo-Json) -Headers $headers
    Write-Host "✅ Password changed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Change password failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Error details: $responseBody" -ForegroundColor Red
        } catch {
            Write-Host "Could not read error details" -ForegroundColor Red
        }
    }
}

Write-Host "`n=== Test Summary ===" -ForegroundColor Green
Write-Host "Updated test completed. Check results above." -ForegroundColor Cyan
