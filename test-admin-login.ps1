# Test Admin Login Script
# This script tests the admin login functionality with the specific credentials

Write-Host "Testing Admin Login Functionality..." -ForegroundColor Yellow

# Set the base URL
$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

# Test 1: Admin login with correct credentials
Write-Host "`n1. Testing admin login with correct credentials..." -ForegroundColor Cyan

$adminLoginData = @{
    email = "assaleemofficial@gmail.com"
    password = "Sarim786"
} | ConvertTo-Json

try {
    $adminResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $adminLoginData -ContentType "application/json"
    Write-Host "✅ Admin login successful!" -ForegroundColor Green
    Write-Host "Response: $($adminResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Green
    $adminToken = $adminResponse.access_token
} catch {
    Write-Host "❌ Admin login failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorContent = $reader.ReadToEnd()
        Write-Host "Error details: $errorContent" -ForegroundColor Red
    }
}

# Test 2: Admin login with wrong password
Write-Host "`n2. Testing admin login with wrong password..." -ForegroundColor Cyan

$wrongPasswordData = @{
    email = "assaleemofficial@gmail.com"
    password = "WrongPassword"
} | ConvertTo-Json

try {
    $wrongResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $wrongPasswordData -ContentType "application/json"
    Write-Host "❌ Should have failed but didn't!" -ForegroundColor Red
} catch {
    Write-Host "✅ Correctly rejected wrong password" -ForegroundColor Green
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
}

# Test 3: Try to create another admin user
Write-Host "`n3. Testing registration of another admin user..." -ForegroundColor Cyan

$anotherAdminData = @{
    name = "Another Admin"
    email = "anotheradmin@gmail.com"
    password = "password123"
    role = "admin"
    phone = "+92123456789"
    gender = "male"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $anotherAdminData -ContentType "application/json"
    Write-Host "Registration response: $($registerResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Yellow
} catch {
    Write-Host "Registration failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Try to login with the other admin email (should fail)
Write-Host "`n4. Testing login with another admin email..." -ForegroundColor Cyan

$otherAdminLoginData = @{
    email = "anotheradmin@gmail.com"
    password = "password123"
} | ConvertTo-Json

try {
    $otherAdminResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $otherAdminLoginData -ContentType "application/json"
    Write-Host "❌ Other admin login should have failed but didn't!" -ForegroundColor Red
} catch {
    Write-Host "✅ Correctly rejected non-authorized admin login" -ForegroundColor Green
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
}

# Test 5: Test admin profile access
if ($adminToken) {
    Write-Host "`n5. Testing admin profile access..." -ForegroundColor Cyan
    
    $headers = @{
        Authorization = "Bearer $adminToken"
    }
    
    try {
        $profileResponse = Invoke-RestMethod -Uri "$baseUrl/auth/profile" -Method GET -Headers $headers
        Write-Host "✅ Admin profile access successful!" -ForegroundColor Green
        Write-Host "Profile: $($profileResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Admin profile access failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nAdmin login tests completed!" -ForegroundColor Yellow
