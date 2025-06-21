# Debug Accommodation Creation Test

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

# First, get a landlord token
Write-Host "1. Getting landlord token..." -ForegroundColor Yellow

$registerData = @{
    firstName = "Test"
    lastName = "Landlord"
    email = "debug.landlord@test.com"
    password = "Test123!@#"
    phone = "+1234567890"
    role = "landlord"
}

$registerResponse = try {
    Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body ($registerData | ConvertTo-Json) -ContentType "application/json"
} catch {
    Write-Host "Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    $null
}

$loginData = @{
    email = "debug.landlord@test.com"
    password = "Test123!@#"
}

$loginResponse = try {
    Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
} catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$token = $loginResponse.token
Write-Host "✅ Token received: $($token.Substring(0,20))..." -ForegroundColor Green

# Now test accommodation creation with different data formats
Write-Host "`n2. Testing accommodation creation..." -ForegroundColor Yellow

$accommodationData = @{
    title = "Test Accommodation"
    description = "A beautiful test accommodation for students"
    city = "507f1f77bcf86cd799439011"  # Use a valid ObjectId format
    price = 15000
    amenities = @("WiFi", "Parking", "Security")
    availability = @("2024-03-01", "2024-03-02")
}

Write-Host "Sending data:" -ForegroundColor Cyan
$accommodationData | ConvertTo-Json -Depth 2

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$createResponse = try {
    Invoke-RestMethod -Uri "$baseUrl/accommodations" -Method POST -Body ($accommodationData | ConvertTo-Json) -Headers $headers
} catch {
    Write-Host "❌ Accommodation creation failed:" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    # Try to get the detailed error message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
    exit 1
}

Write-Host "✅ Accommodation created successfully!" -ForegroundColor Green
Write-Host "Response:" -ForegroundColor Cyan
$createResponse | ConvertTo-Json -Depth 3

# Test getting landlord accommodations
Write-Host "`n3. Testing get landlord accommodations..." -ForegroundColor Yellow

$accommodationsResponse = try {
    Invoke-RestMethod -Uri "$baseUrl/accommodations/landlord" -Method GET -Headers $headers
} catch {
    Write-Host "❌ Get accommodations failed:" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Accommodations retrieved successfully!" -ForegroundColor Green
Write-Host "Count: $($accommodationsResponse.Count)" -ForegroundColor Cyan

# Test dashboard endpoints
Write-Host "`n4. Testing dashboard endpoints..." -ForegroundColor Yellow

$dashboardResponse = try {
    Invoke-RestMethod -Uri "$baseUrl/accommodations/landlord/dashboard" -Method GET -Headers $headers
} catch {
    Write-Host "❌ Dashboard failed:" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dashboard data retrieved!" -ForegroundColor Green
$dashboardResponse | ConvertTo-Json -Depth 2

# Test profile endpoint
Write-Host "`n5. Testing profile endpoint..." -ForegroundColor Yellow

$profileResponse = try {
    Invoke-RestMethod -Uri "$baseUrl/users/profile" -Method GET -Headers $headers
} catch {
    Write-Host "❌ Profile failed:" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Profile retrieved!" -ForegroundColor Green
Write-Host "User ID: $($profileResponse._id)" -ForegroundColor Cyan
Write-Host "Role: $($profileResponse.role)" -ForegroundColor Cyan

Write-Host "`n✅ All tests completed successfully!" -ForegroundColor Green
