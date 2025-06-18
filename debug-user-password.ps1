# Debug User After Password Change
Write-Host "Debugging User After Password Change..." -ForegroundColor Yellow

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

# Login with a user we know exists (from previous test)
Write-Host "1. Finding a test user..." -ForegroundColor Cyan

# Try to login with the user from previous test
$loginAttempt = @{
    email = "pwtest1566548025@example.com"
    password = "initialPassword123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginAttempt -ContentType "application/json"
    Write-Host "✅ User found with original password!" -ForegroundColor Green
    $userEmail = $loginResponse.user.email
    $userToken = $loginResponse.access_token
} catch {
    Write-Host "❌ User not found with original password, trying new password..." -ForegroundColor Yellow
    
    $newLoginAttempt = @{
        email = "pwtest1566548025@example.com"
        password = "newPassword456"
    } | ConvertTo-Json
    
    try {
        $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $newLoginAttempt -ContentType "application/json"
        Write-Host "✅ User found with new password!" -ForegroundColor Green
        $userEmail = $loginResponse.user.email
        $userToken = $loginResponse.access_token
    } catch {
        Write-Host "❌ User not found with either password" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`nUser email: $userEmail" -ForegroundColor Green
Write-Host "Debug complete." -ForegroundColor Yellow
