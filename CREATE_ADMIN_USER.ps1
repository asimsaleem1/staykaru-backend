# StayKaru Admin User Creation Script
Write-Host "StayKaru Admin User Creation" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

$adminEmail = "assaleemofficial@gmail.com"
$adminPassword = "Kaassa1007443@"
$adminName = "Admin User"

$apiUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"
$localUrl = "http://localhost:3000"

Write-Host "Creating admin user with email: $adminEmail" -ForegroundColor Yellow

$endpoints = @($localUrl, $apiUrl)

foreach ($endpoint in $endpoints) {
    try {
        Write-Host "Attempting to create admin user at: $endpoint" -ForegroundColor Cyan
        
        $body = @{
            name = $adminName
            email = $adminEmail
            password = $adminPassword
            role = "admin"
            phone = "03001234567"
            countryCode = "+92"
            gender = "male"
        } | ConvertTo-Json

        $headers = @{
            "Content-Type" = "application/json"
        }

        Invoke-RestMethod -Uri "$endpoint/api/auth/register" -Method POST -Body $body -Headers $headers -TimeoutSec 30
        
        Write-Host "Admin user created successfully!" -ForegroundColor Green
        Write-Host "Email: $adminEmail" -ForegroundColor White
        Write-Host "Password: $adminPassword" -ForegroundColor White
        
        # Test login
        Write-Host "Testing admin login..." -ForegroundColor Yellow
        $loginBody = @{
            email = $adminEmail
            password = $adminPassword
        } | ConvertTo-Json

        $loginResponse = Invoke-RestMethod -Uri "$endpoint/api/auth/login" -Method POST -Body $loginBody -Headers $headers -TimeoutSec 30
        
        if ($loginResponse.accessToken) {
            Write-Host "Admin login test successful!" -ForegroundColor Green
        }
        
        exit 0
        
    } catch {
        Write-Host "Failed to create admin user at $endpoint" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
            if ($statusCode -eq 409) {
                Write-Host "User may already exist. Testing login..." -ForegroundColor Yellow
                
                try {
                    $loginBody = @{
                        email = $adminEmail
                        password = $adminPassword
                    } | ConvertTo-Json

                    $loginResponse = Invoke-RestMethod -Uri "$endpoint/api/auth/login" -Method POST -Body $loginBody -Headers $headers -TimeoutSec 30
                    
                    if ($loginResponse.accessToken) {
                        Write-Host "Admin user already exists and login works!" -ForegroundColor Green
                        exit 0
                    }
                } catch {
                    Write-Host "Login test failed" -ForegroundColor Red
                }
            }
        }
        continue
    }
}

Write-Host "Failed to create admin user at all endpoints" -ForegroundColor Red
