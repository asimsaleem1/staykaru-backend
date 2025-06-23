Write-Host "StayKaru Admin Module Test" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com/api"

# Login
$loginBody = '{"email":"admin2@staykaru.com","password":"password123"}'
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.access_token
$headers = @{ 'Authorization' = "Bearer $token" }

Write-Host "Admin authenticated successfully!" -ForegroundColor Green
Write-Host ""

# Test endpoints
$endpoints = @(
    "admin/analytics/dashboard",
    "admin/analytics/users", 
    "admin/analytics/revenue",
    "admin/analytics/bookings",
    "admin/analytics/orders",
    "admin/analytics/performance",
    "admin/users",
    "admin/users/statistics",
    "admin/users/activity-report",
    "admin/accommodations",
    "admin/accommodations/statistics",
    "admin/food-services",
    "admin/food-services/statistics",
    "admin/food-services/reports",
    "admin/food-providers",
    "admin/food-providers/statistics",
    "admin/food-providers/analytics",
    "admin/bookings",
    "admin/orders",
    "admin/content/reports",
    "admin/content/review-queue",
    "admin/content/statistics",
    "admin/transactions",
    "admin/payments/statistics",
    "admin/commissions",
    "admin/system/health",
    "admin/system/performance",
    "admin/system/logs",
    "admin/export/users",
    "admin/export/bookings",
    "admin/export/transactions",
    "admin/config/platform"
)

$passed = 0
$failed = 0

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/$endpoint" -Headers $headers -Method GET
        Write-Host "✓ $endpoint" -ForegroundColor Green
        $passed++
    }
    catch {
        Write-Host "✗ $endpoint" -ForegroundColor Red
        $failed++  
    }
}

Write-Host ""
Write-Host "=========================" -ForegroundColor Cyan
Write-Host "RESULTS" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host "Total Tests: $($passed + $failed)"
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
$successRate = [math]::Round(($passed / ($passed + $failed)) * 100, 1)
Write-Host "Success Rate: $successRate%" -ForegroundColor Yellow

if ($successRate -eq 100) {
    Write-Host ""
    Write-Host "Perfect score! All admin endpoints working!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Some endpoints need attention." -ForegroundColor Yellow
}
