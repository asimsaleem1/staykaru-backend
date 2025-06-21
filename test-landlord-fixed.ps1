# Fixed Landlord Dashboard Test with Correct Endpoints

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

Write-Host "=== StayKaru Landlord Dashboard Test (Fixed Endpoints) ===" -ForegroundColor Green

# 1. Register a new landlord
Write-Host "`n1. Testing User Registration (Landlord)..." -ForegroundColor Yellow
$registerData = @{
    name = "Test Landlord Fixed"
    email = "landlord.fixed.$(Get-Random)@test.com"
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
    title = "Cozy Apartment Fixed"
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
} catch {
    Write-Host "❌ Accommodation creation failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Get landlord dashboard overview (CORRECT ENDPOINT)
Write-Host "`n5. Testing Get Landlord Dashboard Overview..." -ForegroundColor Yellow
try {
    $dashboardResponse = Invoke-RestMethod -Uri "$baseUrl/accommodations/landlord/dashboard" -Method GET -Headers $headers
    Write-Host "✅ Dashboard overview retrieved" -ForegroundColor Green
    Write-Host "Total Accommodations: $($dashboardResponse.totalAccommodations)" -ForegroundColor Cyan
    Write-Host "Total Bookings: $($dashboardResponse.totalBookings)" -ForegroundColor Cyan
    Write-Host "Revenue: $($dashboardResponse.revenue)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Dashboard overview failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# 6. Get landlord accommodations (CORRECT ENDPOINT)
Write-Host "`n6. Testing Get Landlord Accommodations..." -ForegroundColor Yellow
try {
    $accommodationsResponse = Invoke-RestMethod -Uri "$baseUrl/accommodations/landlord/accommodations" -Method GET -Headers $headers
    Write-Host "✅ Landlord accommodations retrieved" -ForegroundColor Green
    Write-Host "Number of accommodations: $($accommodationsResponse.Count)" -ForegroundColor Cyan
    if ($accommodationsResponse.Count -gt 0) {
        Write-Host "First accommodation: $($accommodationsResponse[0].title)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Get landlord accommodations failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# 7. Get landlord profile (CORRECT ENDPOINT)
Write-Host "`n7. Testing Get Landlord Profile..." -ForegroundColor Yellow
try {
    $profileResponse = Invoke-RestMethod -Uri "$baseUrl/users/landlord/profile" -Method GET -Headers $headers
    Write-Host "✅ Landlord profile retrieved" -ForegroundColor Green
    Write-Host "Name: $($profileResponse.name)" -ForegroundColor Cyan
    Write-Host "Email: $($profileResponse.email)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Get landlord profile failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# 8. Get landlord statistics
Write-Host "`n8. Testing Get Landlord Statistics..." -ForegroundColor Yellow
try {
    $statisticsResponse = Invoke-RestMethod -Uri "$baseUrl/users/landlord/statistics" -Method GET -Headers $headers
    Write-Host "✅ Landlord statistics retrieved" -ForegroundColor Green
    Write-Host "Stats: $($statisticsResponse | ConvertTo-Json -Depth 2)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Get landlord statistics failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# 9. Get landlord revenue
Write-Host "`n9. Testing Get Landlord Revenue..." -ForegroundColor Yellow
try {
    $revenueResponse = Invoke-RestMethod -Uri "$baseUrl/users/landlord/revenue" -Method GET -Headers $headers
    Write-Host "✅ Landlord revenue retrieved" -ForegroundColor Green
    Write-Host "Revenue: $($revenueResponse | ConvertTo-Json -Depth 2)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Get landlord revenue failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# 10. Get landlord bookings
Write-Host "`n10. Testing Get Landlord Bookings..." -ForegroundColor Yellow
try {
    $bookingsResponse = Invoke-RestMethod -Uri "$baseUrl/users/landlord/bookings" -Method GET -Headers $headers
    Write-Host "✅ Landlord bookings retrieved" -ForegroundColor Green
    Write-Host "Number of bookings: $($bookingsResponse.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Get landlord bookings failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

Write-Host "`n=== Test Summary ===" -ForegroundColor Green
Write-Host "Fixed endpoint test completed. Check results above." -ForegroundColor Cyan
