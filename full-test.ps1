# Test City and Accommodation Creation

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

Write-Host "1. Testing cities endpoint..." -ForegroundColor Yellow

try {
    $citiesResponse = Invoke-RestMethod -Uri "$baseUrl/locations/cities" -Method GET
    Write-Host "✅ Cities retrieved!" -ForegroundColor Green
    Write-Host "Found $($citiesResponse.Count) cities" -ForegroundColor Cyan
    if ($citiesResponse.Count -gt 0) {
        Write-Host "First city ID: $($citiesResponse[0]._id)" -ForegroundColor Cyan
        $cityId = $citiesResponse[0]._id
    }
} catch {
    Write-Host "❌ Cities endpoint failed:" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    $cityId = "507f1f77bcf86cd799439011"  # Use a dummy ID
}

Write-Host "`n2. Registering landlord..." -ForegroundColor Yellow

$registerData = @{
    name = "Test Landlord"
    email = "full.test.landlord.$(Get-Random)@test.com"
    password = "Test123!@#"
    phone = "+1234567890"
    role = "landlord"
    gender = "male"
}

$registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body ($registerData | ConvertTo-Json) -ContentType "application/json"
Write-Host "✅ Registration successful!" -ForegroundColor Green

Write-Host "`n3. Logging in..." -ForegroundColor Yellow

$loginData = @{
    email = $registerData.email
    password = $registerData.password
}

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
$token = $loginResponse.token
Write-Host "✅ Login successful!" -ForegroundColor Green

Write-Host "`n4. Testing accommodation creation..." -ForegroundColor Yellow

$accommodationData = @{
    title = "Test Accommodation"
    description = "A beautiful test accommodation for students"
    city = $cityId
    price = 15000
    amenities = @("WiFi", "Parking", "Security")
    availability = @("2024-06-22", "2024-06-23")
}

Write-Host "Using city ID: $cityId" -ForegroundColor Cyan

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $createResponse = Invoke-RestMethod -Uri "$baseUrl/accommodations" -Method POST -Body ($accommodationData | ConvertTo-Json) -Headers $headers
    Write-Host "✅ Accommodation created successfully!" -ForegroundColor Green
    Write-Host "Accommodation ID: $($createResponse._id)" -ForegroundColor Cyan
    Write-Host "Status: $($createResponse.approvalStatus)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Accommodation creation failed:" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n5. Testing landlord endpoints..." -ForegroundColor Yellow

# Test get landlord accommodations
try {
    $accommodationsResponse = Invoke-RestMethod -Uri "$baseUrl/accommodations/landlord" -Method GET -Headers $headers
    Write-Host "✅ Landlord accommodations: $($accommodationsResponse.Count)" -ForegroundColor Green
} catch {
    Write-Host "❌ Get landlord accommodations failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test dashboard
try {
    $dashboardResponse = Invoke-RestMethod -Uri "$baseUrl/accommodations/landlord/dashboard" -Method GET -Headers $headers
    Write-Host "✅ Dashboard: Total=$($dashboardResponse.totalAccommodations), Pending=$($dashboardResponse.pendingAccommodations)" -ForegroundColor Green
} catch {
    Write-Host "❌ Dashboard failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test profile
try {
    $profileResponse = Invoke-RestMethod -Uri "$baseUrl/users/profile" -Method GET -Headers $headers
    Write-Host "✅ Profile: $($profileResponse.name) ($($profileResponse.role))" -ForegroundColor Green
} catch {
    Write-Host "❌ Profile failed: $($_.Exception.Message)" -ForegroundColor Red
}
