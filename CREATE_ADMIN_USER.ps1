# Admin User Setup Script
# This script creates an admin user in the database

param(
    [string]$BaseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com/api"
)

Write-Host "🔐 Creating Admin User..." -ForegroundColor Cyan

$adminUser = @{
    name = "Super Admin"
    email = "admin@staykaru.com"
    password = "StayKaru2024!@#"
    role = "admin"
    phone = "1234567890"
    countryCode = "+1"
    gender = "male"
    isActive = $true
}

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/auth/register" -Method POST -Body ($adminUser | ConvertTo-Json) -ContentType "application/json"
    Write-Host "✅ Admin user created successfully!" -ForegroundColor Green
    Write-Host "Email: admin@staykaru.com" -ForegroundColor White
    Write-Host "Password: StayKaru2024!@#" -ForegroundColor White
    
    # Test login immediately
    $loginData = @{
        email = "admin@staykaru.com"
        password = "StayKaru2024!@#"
    }
    
    $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
    Write-Host "✅ Admin login test successful!" -ForegroundColor Green
    Write-Host "Token: $($loginResponse.access_token.Substring(0, 20))..." -ForegroundColor Yellow
    
}
catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "ℹ️  Admin user already exists, testing login..." -ForegroundColor Yellow
        
        # Test login
        $loginData = @{
            email = "admin@staykaru.com"
            password = "StayKaru2024!@#"
        }
        
        try {
            $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
            Write-Host "✅ Admin login test successful!" -ForegroundColor Green
            Write-Host "Token: $($loginResponse.access_token.Substring(0, 20))..." -ForegroundColor Yellow
        }
        catch {
            Write-Host "❌ Admin login failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    else {
        Write-Host "❌ Failed to create admin user: $($_.Exception.Message)" -ForegroundColor Red
    }
}
