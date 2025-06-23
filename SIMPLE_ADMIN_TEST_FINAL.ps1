Write-Host "StayKaru Admin Module Test" -ForegroundColor Cyan

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com/api"

# Login
$loginBody = '{"email":"admin2@staykaru.com","password":"password123"}'
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.access_token
$headers = @{ 'Authorization' = "Bearer $token" }

Write-Host "Admin authenticated successfully!" -ForegroundColor Green

# Test key endpoints
$endpoints = "admin/analytics/dashboard", "admin/users", "admin/accommodations", "admin/food-services", "admin/bookings", "admin/orders"

$passed = 0
$failed = 0

foreach ($endpoint in $endpoints) {
    try {
        Invoke-RestMethod -Uri "$baseUrl/$endpoint" -Headers $headers -Method GET | Out-Null
        Write-Host "✓ $endpoint" -ForegroundColor Green
        $passed++
    }
    catch {
        Write-Host "✗ $endpoint" -ForegroundColor Red
        $failed++  
    }
}

Write-Host ""
Write-Host "Results: $passed passed, $failed failed"
$successRate = [math]::Round(($passed / ($passed + $failed)) * 100, 1)
Write-Host "Success Rate: $successRate%"
