# Detailed Password Change Debug
Write-Host "Detailed Password Change Debug..." -ForegroundColor Yellow

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

# Step 1: Create user with unique email
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$testEmail = "debug$timestamp@example.com"

Write-Host "1. Creating test user: $testEmail" -ForegroundColor Cyan
$registerData = @{
    name = "Debug User"
    email = $testEmail
    password = "debug123"
    role = "student"
    phone = "+92123456789"
    gender = "male"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $registerData -ContentType "application/json"
    Write-Host "✅ User created successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Login and change password
Write-Host "`n2. Logging in..." -ForegroundColor Cyan
$loginData = @{
    email = $testEmail
    password = "debug123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ Login successful!" -ForegroundColor Green
    $token = $loginResponse.access_token
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Change password and test immediately
Write-Host "`n3. Changing password..." -ForegroundColor Cyan
$changeData = @{
    oldPassword = "debug123"
    newPassword = "newdebug456"
} | ConvertTo-Json

$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $changeResponse = Invoke-RestMethod -Uri "$baseUrl/users/change-password" -Method POST -Body $changeData -Headers $headers
    Write-Host "✅ Password change successful!" -ForegroundColor Green
    
    # Step 4: Wait a moment for any caching to clear
    Write-Host "`n4. Waiting 2 seconds for cache clearance..." -ForegroundColor Cyan
    Start-Sleep -Seconds 2
    
    # Step 5: Test new password immediately
    Write-Host "`n5. Testing new password..." -ForegroundColor Cyan
    $newLoginData = @{
        email = $testEmail
        password = "newdebug456"
    } | ConvertTo-Json
    
    try {
        $newLoginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $newLoginData -ContentType "application/json"
        Write-Host "✅ NEW PASSWORD WORKS!" -ForegroundColor Green
        Write-Host "Success: User can login with new password" -ForegroundColor Green
    } catch {
        Write-Host "❌ New password failed: $($_.Exception.Message)" -ForegroundColor Red
        
        # Test if old password still works
        Write-Host "`n6. Testing if old password still works..." -ForegroundColor Cyan
        try {
            $oldLoginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json"
            Write-Host "⚠️ OLD PASSWORD STILL WORKS - Password not updated!" -ForegroundColor Yellow
        } catch {
            Write-Host "✅ Old password correctly rejected" -ForegroundColor Green
        }
    }
    
} catch {
    Write-Host "❌ Password change failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nDebug completed." -ForegroundColor Yellow
