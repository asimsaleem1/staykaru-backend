# Simple Admin User Setup
$BaseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com/api"

Write-Host "Creating Admin User..." -ForegroundColor Cyan

$adminUser = @{
    name = "Super Admin"
    email = "admin@staykaru.com"
    password = "StayKaru2024!@#"
    role = "admin"
    phone = "1234567890"
    countryCode = "+1"
    gender = "male"
}

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/auth/register" -Method POST -Body ($adminUser | ConvertTo-Json) -ContentType "application/json"
    Write-Host "✅ Admin user created!" -ForegroundColor Green
    Write-Host "Token: $($response.access_token.Substring(0, 20))..." -ForegroundColor Yellow
} catch {
    Write-Host "Testing login..." -ForegroundColor Yellow
    $loginData = @{
        email = "admin@staykaru.com"
        password = "StayKaru2024!@#"
    }
    
    try {
        $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
        Write-Host "✅ Admin login successful!" -ForegroundColor Green
        Write-Host "Token: $($loginResponse.access_token.Substring(0, 20))..." -ForegroundColor Yellow
    } catch {
        Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}
