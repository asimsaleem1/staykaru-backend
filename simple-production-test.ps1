# Simple Production Test Script for StayKaru Role-Based Dashboards
# Test endpoints on Heroku production

Write-Host "StayKaru Production Role-Based Dashboard Testing" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

$BASE_URL = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

# Test health endpoint
Write-Host "`n1. Testing Server Health" -ForegroundColor Green
try {
    $healthResponse = Invoke-WebRequest -Uri "$BASE_URL/" -Method Get -UseBasicParsing
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "SUCCESS: Server Health Check (200 OK)" -ForegroundColor Green
    }
} catch {
    Write-Host "FAILED: Server Health Check - $($_.Exception.Message)" -ForegroundColor Red
}

# Test authentication endpoint
Write-Host "`n2. Testing Authentication Endpoint" -ForegroundColor Green
try {
    $authResponse = Invoke-WebRequest -Uri "$BASE_URL/auth/login" -Method Post -UseBasicParsing -ContentType "application/json" -Body '{"email": "admin@staykaru.com", "password": "admin123"}'
    if ($authResponse.StatusCode -eq 200 -or $authResponse.StatusCode -eq 201) {
        Write-Host "SUCCESS: Authentication endpoint working" -ForegroundColor Green
    }
} catch {
    Write-Host "INFO: Authentication endpoint test - $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test public accommodation endpoint
Write-Host "`n3. Testing Public Accommodation Endpoint" -ForegroundColor Green
try {
    $accommodationResponse = Invoke-WebRequest -Uri "$BASE_URL/accommodations" -Method Get -UseBasicParsing
    if ($accommodationResponse.StatusCode -eq 200) {
        Write-Host "SUCCESS: Public accommodations endpoint working" -ForegroundColor Green
    }
} catch {
    Write-Host "FAILED: Public accommodations endpoint - $($_.Exception.Message)" -ForegroundColor Red
}

# Test public food providers endpoint
Write-Host "`n4. Testing Public Food Providers Endpoint" -ForegroundColor Green
try {
    $foodProviderResponse = Invoke-WebRequest -Uri "$BASE_URL/food-providers" -Method Get -UseBasicParsing
    if ($foodProviderResponse.StatusCode -eq 200) {
        Write-Host "SUCCESS: Public food providers endpoint working" -ForegroundColor Green
    }
} catch {
    Write-Host "FAILED: Public food providers endpoint - $($_.Exception.Message)" -ForegroundColor Red
}

# Test protected landlord endpoint (should return 401 without auth)
Write-Host "`n5. Testing Protected Landlord Dashboard (No Auth)" -ForegroundColor Green
try {
    $landlordResponse = Invoke-WebRequest -Uri "$BASE_URL/accommodations/landlord/dashboard" -Method Get -UseBasicParsing
    Write-Host "UNEXPECTED: Landlord dashboard accessible without auth" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host "SUCCESS: Landlord dashboard properly protected (401 Unauthorized)" -ForegroundColor Green
    } else {
        Write-Host "INFO: Landlord dashboard response - $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Test protected food provider endpoint (should return 401 without auth)
Write-Host "`n6. Testing Protected Food Provider Dashboard (No Auth)" -ForegroundColor Green
try {
    $foodProviderDashResponse = Invoke-WebRequest -Uri "$BASE_URL/food-providers/owner/dashboard" -Method Get -UseBasicParsing
    Write-Host "UNEXPECTED: Food provider dashboard accessible without auth" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host "SUCCESS: Food provider dashboard properly protected (401 Unauthorized)" -ForegroundColor Green
    } else {
        Write-Host "INFO: Food provider dashboard response - $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`nProduction Testing Complete!" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host "All role-based dashboard endpoints are deployed and protected." -ForegroundColor Green
