# Test Password Change Endpoint
# This script tests the POST /users/change-password endpoint

Write-Host "=== StayKaru Password Change Test ===" -ForegroundColor Yellow

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

# Test password change with wrong old password
Write-Host "`n2. Testing password change with wrong old password..." -ForegroundColor Cyan

$wrongPasswordData = @{
    oldPassword = "WrongPassword"
    newPassword = "NewPassword123"
} | ConvertTo-Json

$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $wrongResponse = Invoke-RestMethod -Uri "$baseUrl/users/change-password" -Method POST -Body $wrongPasswordData -Headers $headers
    Write-Host "❌ Should have failed but didn't!" -ForegroundColor Red
} catch {
    Write-Host "✅ Correctly rejected wrong old password" -ForegroundColor Green
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
}

# Test password change with correct old password
Write-Host "`n3. Testing password change with correct old password..." -ForegroundColor Cyan

$correctPasswordData = @{
    oldPassword = "Sarim786"
    newPassword = "NewPassword123"
} | ConvertTo-Json

try {
    $changeResponse = Invoke-RestMethod -Uri "$baseUrl/users/change-password" -Method POST -Body $correctPasswordData -Headers $headers
    Write-Host "✅ Password change successful!" -ForegroundColor Green
    Write-Host "Response: $($changeResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Green
} catch {
    Write-Host "❌ Password change failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorContent = $reader.ReadToEnd()
        Write-Host "Error details: $errorContent" -ForegroundColor Red
    }
}

# Test login with new password
Write-Host "`n4. Testing login with new password..." -ForegroundColor Cyan

$newLoginData = @{
    email = "assaleemofficial@gmail.com"
    password = "NewPassword123"
} | ConvertTo-Json

try {
    $newLoginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $newLoginData -ContentType "application/json"
    Write-Host "✅ Login with new password successful!" -ForegroundColor Green
    Write-Host "New token received: $($newLoginResponse.access_token.Substring(0,50))..." -ForegroundColor Gray
    
    # Change password back to original
    Write-Host "`n5. Changing password back to original..." -ForegroundColor Cyan
    
    $revertPasswordData = @{
        oldPassword = "NewPassword123"
        newPassword = "Sarim786"
    } | ConvertTo-Json
    
    $newHeaders = @{
        Authorization = "Bearer $($newLoginResponse.access_token)"
        "Content-Type" = "application/json"
    }
    
    $revertResponse = Invoke-RestMethod -Uri "$baseUrl/users/change-password" -Method POST -Body $revertPasswordData -Headers $newHeaders
    Write-Host "✅ Password reverted successfully!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Login with new password failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Yellow
