# Test Regular User Login
# This script tests that regular user login still works correctly

Write-Host "Testing Regular User Login..." -ForegroundColor Yellow

# Set the base URL
$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

# Test 1: Create a regular user
Write-Host "`n1. Creating a regular user..." -ForegroundColor Cyan

$regularUserData = @{
    name = "Test Student"
    email = "test.student@example.com"
    password = "testpass123"
    role = "student"
    phone = "+92123456789"
    gender = "male"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $regularUserData -ContentType "application/json"
    Write-Host "✅ Regular user registration successful!" -ForegroundColor Green
    Write-Host "Response: $($registerResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Green
} catch {
    Write-Host "Registration response (might already exist): $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test 2: Login with regular user
Write-Host "`n2. Testing regular user login..." -ForegroundColor Cyan

$loginData = @{
    email = "test.student@example.com"
    password = "testpass123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ Regular user login successful!" -ForegroundColor Green
    Write-Host "User role: $($loginResponse.user.role)" -ForegroundColor Green
    $userToken = $loginResponse.access_token
    
    if ($loginResponse.user.role -eq "student") {
        Write-Host "✅ Role correctly preserved as student!" -ForegroundColor Green
    } else {
        Write-Host "❌ Role unexpectedly changed to: $($loginResponse.user.role)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Regular user login failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Test regular user profile access
if ($userToken) {
    Write-Host "`n3. Testing regular user profile access..." -ForegroundColor Cyan
    
    $headers = @{
        Authorization = "Bearer $userToken"
    }
    
    try {
        $profileResponse = Invoke-RestMethod -Uri "$baseUrl/auth/profile" -Method GET -Headers $headers
        Write-Host "✅ Regular user profile access successful!" -ForegroundColor Green
        Write-Host "Profile role: $($profileResponse.user.role)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Regular user profile access failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nRegular user tests completed!" -ForegroundColor Yellow
