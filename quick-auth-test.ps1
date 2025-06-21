# Quick Auth Test
param(
    [string]$BaseUrl = "http://localhost:3000"
)

Write-Host "=== QUICK AUTH TEST ===" -ForegroundColor Yellow

# Test data
$randomSuffix = Get-Random -Minimum 100000 -Maximum 999999
$testUser = @{
    name = "Debug User $randomSuffix"
    email = "debug.user.$randomSuffix@test.com"
    password = "SecurePass123!"
    role = "food_provider"
    phone = "+1234567890"
    gender = "male"
}

try {
    # Register user
    Write-Host "Registering..." -ForegroundColor Cyan
    $registerResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/register" -Method POST -Body ($testUser | ConvertTo-Json) -ContentType "application/json"
    Write-Host "Register response:" -ForegroundColor Green
    Write-Host ($registerResponse | ConvertTo-Json -Depth 5) -ForegroundColor White
    
    # Login user
    Write-Host "`nLogging in..." -ForegroundColor Cyan
    $loginData = @{
        email = $testUser.email
        password = $testUser.password
    }
    $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
    Write-Host "Login response:" -ForegroundColor Green
    Write-Host ($loginResponse | ConvertTo-Json -Depth 5) -ForegroundColor White
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
