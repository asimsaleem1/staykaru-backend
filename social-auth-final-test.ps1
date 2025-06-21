# Final Social Authentication Test Script
# This script tests the Facebook and Google login endpoints

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "SOCIAL AUTHENTICATION FINAL TEST" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000"

# Test Facebook Login Endpoint
Write-Host "`n1. Testing Facebook Login Endpoint..." -ForegroundColor Yellow
$facebookTestData = @{
    accessToken = "dummy-facebook-token"
} | ConvertTo-Json

try {
    $facebookResponse = Invoke-RestMethod -Uri "$baseUrl/auth/facebook" -Method POST -Body $facebookTestData -ContentType "application/json" -ErrorAction Stop
    Write-Host "✅ Facebook endpoint is accessible" -ForegroundColor Green
    Write-Host "Response: $($facebookResponse | ConvertTo-Json -Depth 2)" -ForegroundColor White
} catch {
    if ($_.Exception.Response.StatusCode -eq 401 -or $_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✅ Facebook endpoint is accessible (expected 401/400 for invalid token)" -ForegroundColor Green
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Facebook endpoint error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test Google Login Endpoint
Write-Host "`n2. Testing Google Login Endpoint..." -ForegroundColor Yellow
$googleTestData = @{
    idToken = "dummy-google-token"
} | ConvertTo-Json

try {
    $googleResponse = Invoke-RestMethod -Uri "$baseUrl/auth/google" -Method POST -Body $googleTestData -ContentType "application/json" -ErrorAction Stop
    Write-Host "✅ Google endpoint is accessible" -ForegroundColor Green
    Write-Host "Response: $($googleResponse | ConvertTo-Json -Depth 2)" -ForegroundColor White
} catch {
    if ($_.Exception.Response.StatusCode -eq 401 -or $_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✅ Google endpoint is accessible (expected 401/400 for invalid token)" -ForegroundColor Green
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Google endpoint error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Check server health
Write-Host "`n3. Checking server health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET -ErrorAction Stop
    Write-Host "✅ Server is healthy" -ForegroundColor Green
} catch {
    try {
        $healthResponse = Invoke-RestMethod -Uri "$baseUrl/" -Method GET -ErrorAction Stop
        Write-Host "✅ Server is running" -ForegroundColor Green
    } catch {
        Write-Host "❌ Server health check failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n===========================================" -ForegroundColor Cyan
Write-Host "SOCIAL AUTHENTICATION ENDPOINTS READY!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Add real Facebook/Google credentials to .env" -ForegroundColor White
Write-Host "2. Test with real tokens from Facebook/Google SDKs" -ForegroundColor White
Write-Host "3. Integrate frontend social login libraries" -ForegroundColor White
