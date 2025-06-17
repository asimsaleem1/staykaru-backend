# Test Profile Update Endpoint
# This script tests the PUT /users/profile endpoint

Write-Host "=== StayKaru Profile Update Test ===" -ForegroundColor Yellow

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

# First, login to get a token
Write-Host "`n1. Logging in to get access token..." -ForegroundColor Cyan

$loginData = @{
    email = "assaleemofficial@gmail.com"
    password = "Sarim786"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ Login successful!" -ForegroundColor Green
    $token = $loginResponse.access_token
    Write-Host "Token received: $($token.Substring(0,50))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test profile update
Write-Host "`n2. Testing profile update..." -ForegroundColor Cyan

$updateData = @{
    name = "Admin User Updated"
    phone = "+92 300 1234567"
    address = "123 Admin Street, Lahore, Pakistan"
    gender = "male"
} | ConvertTo-Json

$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $updateResponse = Invoke-RestMethod -Uri "$baseUrl/users/profile" -Method PUT -Body $updateData -Headers $headers
    Write-Host "✅ Profile update successful!" -ForegroundColor Green
    Write-Host "Response: $($updateResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Green
} catch {
    Write-Host "❌ Profile update failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorContent = $reader.ReadToEnd()
        Write-Host "Error details: $errorContent" -ForegroundColor Red
    }
}

# Verify the update by getting profile
Write-Host "`n3. Verifying profile update..." -ForegroundColor Cyan

try {
    $profileResponse = Invoke-RestMethod -Uri "$baseUrl/auth/profile" -Method GET -Headers @{Authorization = "Bearer $token"}
    Write-Host "✅ Profile verification successful!" -ForegroundColor Green
    Write-Host "Updated Profile: $($profileResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Green
} catch {
    Write-Host "❌ Profile verification failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Yellow
