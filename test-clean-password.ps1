# Clean Password Change Test
Write-Host "Clean Password Change Test (bypassing cache)..." -ForegroundColor Yellow

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

# Use a very unique timestamp to ensure no conflicts
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$testEmail = "cleantest$timestamp@example.com"

Write-Host "Test email: $testEmail" -ForegroundColor Gray

# Step 1: Register user
Write-Host "`n1. Registering user..." -ForegroundColor Cyan
$registerData = @{
    name = "Clean Test User"
    email = $testEmail
    password = "clean123"
    role = "student"
    phone = "+92123456789"
    gender = "male"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $registerData -ContentType "application/json" | Out-Null
    Write-Host "✅ Registration successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Immediate login
Write-Host "`n2. Initial login..." -ForegroundColor Cyan
$loginData = @{
    email = $testEmail
    password = "clean123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ Initial login successful" -ForegroundColor Green
    $token = $loginResponse.access_token
} catch {
    Write-Host "❌ Initial login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Immediate password change
Write-Host "`n3. Changing password immediately..." -ForegroundColor Cyan
$changeData = @{
    oldPassword = "clean123"
    newPassword = "newclean456"
} | ConvertTo-Json

$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    Invoke-RestMethod -Uri "$baseUrl/users/change-password" -Method POST -Body $changeData -Headers $headers | Out-Null
    Write-Host "✅ Password change successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Password change failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 4: Wait 5 seconds for any potential cache clearance
Write-Host "`n4. Waiting 5 seconds..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Step 5: Test new password
Write-Host "`n5. Testing new password..." -ForegroundColor Cyan
$newLoginData = @{
    email = $testEmail
    password = "newclean456"
} | ConvertTo-Json

try {
    $newLoginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $newLoginData -ContentType "application/json"
    Write-Host "🎉 SUCCESS! New password works!" -ForegroundColor Green
    Write-Host "User: $($newLoginResponse.user.name)" -ForegroundColor Green
} catch {
    Write-Host "❌ New password failed: $($_.Exception.Message)" -ForegroundColor Red
    
    # Test old password to see if it was actually changed
    Write-Host "`n6. Testing old password..." -ForegroundColor Cyan
    try {
        Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json" | Out-Null
        Write-Host "⚠️ OLD PASSWORD STILL WORKS!" -ForegroundColor Yellow
    } catch {
        Write-Host "✅ Old password correctly rejected" -ForegroundColor Green
    }
}

Write-Host "`nClean test completed." -ForegroundColor Yellow
