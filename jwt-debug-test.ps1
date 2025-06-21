# JWT Token Debug Test

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

Write-Host "Testing JWT token authentication..." -ForegroundColor Yellow

# Register and login
$registerData = @{
    name = "Debug Landlord"
    email = "jwt.debug.$(Get-Random)@test.com"
    password = "Test123!@#"
    phone = "+1234567890"
    role = "landlord"
    gender = "male"
}

$registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body ($registerData | ConvertTo-Json) -ContentType "application/json"
Write-Host "✅ Registration successful!" -ForegroundColor Green

$loginData = @{
    email = $registerData.email
    password = $registerData.password
}

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
$token = $loginResponse.access_token

Write-Host "✅ Login successful!" -ForegroundColor Green
Write-Host "Token: $($token.Substring(0,50))..." -ForegroundColor Cyan

# Test different header formats
$headers1 = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$headers2 = @{
    "Authorization" = $token
    "Content-Type" = "application/json"
}

# Test a simple protected endpoint first
Write-Host "`nTesting profile endpoint with 'Bearer ' prefix..." -ForegroundColor Yellow
try {
    $profileResponse1 = Invoke-RestMethod -Uri "$baseUrl/users/profile" -Method GET -Headers $headers1
    Write-Host "✅ Profile with Bearer prefix: $($profileResponse1.name)" -ForegroundColor Green
} catch {
    Write-Host "❌ Profile with Bearer prefix failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

Write-Host "`nTesting profile endpoint without 'Bearer ' prefix..." -ForegroundColor Yellow
try {
    $profileResponse2 = Invoke-RestMethod -Uri "$baseUrl/users/profile" -Method GET -Headers $headers2
    Write-Host "✅ Profile without Bearer prefix: $($profileResponse2.name)" -ForegroundColor Green
} catch {
    Write-Host "❌ Profile without Bearer prefix failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# Test accommodation endpoint
Write-Host "`nTesting accommodation endpoints..." -ForegroundColor Yellow

# Create minimal accommodation data
$accommodationData = @{
    title = "Debug Accommodation"
    description = "Test accommodation"
    city = "507f1f77bcf86cd799439011"
    price = 1000
    amenities = @("WiFi")
    availability = @("2024-06-22")
}

try {
    $createResponse = Invoke-RestMethod -Uri "$baseUrl/accommodations" -Method POST -Body ($accommodationData | ConvertTo-Json) -Headers $headers1
    Write-Host "✅ Accommodation created: $($createResponse._id)" -ForegroundColor Green
} catch {
    Write-Host "❌ Accommodation creation failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response: $responseBody" -ForegroundColor Red
        } catch {
            Write-Host "Could not read response body" -ForegroundColor Red
        }
    }
}
