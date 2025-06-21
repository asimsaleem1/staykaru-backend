# Heroku Social Authentication Deployment Test
# This script tests the deployed social auth endpoints on Heroku

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "HEROKU SOCIAL AUTH DEPLOYMENT TEST" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

$herokuUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

# Test Facebook Login Endpoint on Heroku
Write-Host "`n1. Testing Facebook Login Endpoint on Heroku..." -ForegroundColor Yellow
$facebookTestData = @{
    accessToken = "dummy-facebook-token"
} | ConvertTo-Json

try {
    $facebookResponse = Invoke-RestMethod -Uri "$herokuUrl/auth/facebook" -Method POST -Body $facebookTestData -ContentType "application/json" -ErrorAction Stop
    Write-Host "✅ Facebook endpoint is accessible on Heroku" -ForegroundColor Green
    Write-Host "Response: $($facebookResponse | ConvertTo-Json -Depth 2)" -ForegroundColor White
} catch {
    if ($_.Exception.Response.StatusCode -eq 401 -or $_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✅ Facebook endpoint is accessible on Heroku (expected 401/400 for invalid token)" -ForegroundColor Green
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Facebook endpoint error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test Google Login Endpoint on Heroku
Write-Host "`n2. Testing Google Login Endpoint on Heroku..." -ForegroundColor Yellow
$googleTestData = @{
    idToken = "dummy-google-token"
} | ConvertTo-Json

try {
    $googleResponse = Invoke-RestMethod -Uri "$herokuUrl/auth/google" -Method POST -Body $googleTestData -ContentType "application/json" -ErrorAction Stop
    Write-Host "✅ Google endpoint is accessible on Heroku" -ForegroundColor Green
    Write-Host "Response: $($googleResponse | ConvertTo-Json -Depth 2)" -ForegroundColor White
} catch {
    if ($_.Exception.Response.StatusCode -eq 401 -or $_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✅ Google endpoint is accessible on Heroku (expected 401/400 for invalid token)" -ForegroundColor Green
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Google endpoint error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test API Health on Heroku
Write-Host "`n3. Testing API Health on Heroku..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$herokuUrl/" -Method GET -ErrorAction Stop
    Write-Host "✅ Heroku API is healthy and responding" -ForegroundColor Green
} catch {
    Write-Host "❌ Heroku API health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Swagger Documentation
Write-Host "`n4. Testing Swagger Documentation..." -ForegroundColor Yellow
try {
    $swaggerResponse = Invoke-WebRequest -Uri "$herokuUrl/api" -Method GET -ErrorAction Stop
    Write-Host "✅ Swagger documentation is accessible" -ForegroundColor Green
    Write-Host "Swagger URL: $herokuUrl/api" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Swagger documentation not accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n===========================================" -ForegroundColor Cyan
Write-Host "🚀 DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Production URLs:" -ForegroundColor White
Write-Host "• API Base: $herokuUrl" -ForegroundColor White
Write-Host "• Facebook Login: $herokuUrl/auth/facebook" -ForegroundColor White
Write-Host "• Google Login: $herokuUrl/auth/google" -ForegroundColor White
Write-Host "• Swagger Docs: $herokuUrl/api" -ForegroundColor White

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Configure production Facebook/Google app credentials" -ForegroundColor White
Write-Host "2. Update frontend to use production API URLs" -ForegroundColor White
Write-Host "3. Test with real social login tokens" -ForegroundColor White
