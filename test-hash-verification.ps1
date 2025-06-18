# Password Hash Verification Test
Write-Host "Password Hash Verification Test..." -ForegroundColor Yellow

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

# Use a very unique timestamp
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$testEmail = "hashtest$timestamp@example.com"

Write-Host "Test email: $testEmail" -ForegroundColor Gray

# Step 1: Register user
Write-Host "`n1. Registering user..." -ForegroundColor Cyan
$registerData = @{
    name = "Hash Test User"
    email = $testEmail
    password = "hash123"
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

# Step 2: Get initial password hash
Write-Host "`n2. Getting initial password hash..." -ForegroundColor Cyan
try {
    $usersResponse = Invoke-RestMethod -Uri "$baseUrl/users" -Method GET
    $testUser = $usersResponse | Where-Object { $_.email -eq $testEmail }
    
    if ($testUser) {
        $initialHash = $testUser.password
        Write-Host "✅ Initial hash: $($initialHash.Substring(0, 20))..." -ForegroundColor Green
    } else {
        Write-Host "❌ User not found in users list" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Failed to get users: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Login and change password
Write-Host "`n3. Logging in..." -ForegroundColor Cyan
$loginData = @{
    email = $testEmail
    password = "hash123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $token = $loginResponse.access_token
    Write-Host "✅ Login successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n4. Changing password..." -ForegroundColor Cyan
$changeData = @{
    oldPassword = "hash123"
    newPassword = "newhash456"
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

# Step 5: Check if hash actually changed
Write-Host "`n5. Checking if hash changed..." -ForegroundColor Cyan
Start-Sleep -Seconds 2

try {
    $usersResponse2 = Invoke-RestMethod -Uri "$baseUrl/users" -Method GET
    $testUser2 = $usersResponse2 | Where-Object { $_.email -eq $testEmail }
    
    if ($testUser2) {
        $newHash = $testUser2.password
        Write-Host "New hash: $($newHash.Substring(0, 20))..." -ForegroundColor Gray
        
        if ($initialHash -eq $newHash) {
            Write-Host "❌ HASH NOT CHANGED! Password update failed in database." -ForegroundColor Red
        } else {
            Write-Host "✅ HASH CHANGED! Database was updated." -ForegroundColor Green
            
            # Test the new password
            $newLoginData = @{
                email = $testEmail
                password = "newhash456"
            } | ConvertTo-Json
            
            Write-Host "`n6. Testing new password..." -ForegroundColor Cyan
            try {
                Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $newLoginData -ContentType "application/json" | Out-Null
                Write-Host "🎉 SUCCESS! New password works!" -ForegroundColor Green
            } catch {
                Write-Host "❌ New password doesn't work despite hash change" -ForegroundColor Red
            }
        }
    }
} catch {
    Write-Host "❌ Failed to get updated users: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nHash verification test completed." -ForegroundColor Yellow
