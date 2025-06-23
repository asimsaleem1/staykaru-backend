# Simple Admin Module Test Script
# Tests all admin endpoints for 100% success

$BaseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com/api"
$AdminToken = ""

Write-Host "Starting Admin Module Tests..." -ForegroundColor Cyan

# Step 1: Login as admin
$loginData = @{
    email = "testadmin@staykaru.com"
    password = "TestAdmin123!"
}

try {
    $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
    $AdminToken = $loginResponse.access_token
    Write-Host "✅ Admin login successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Admin login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $AdminToken"
    "Content-Type" = "application/json"
}

# Test Results
$tests = @()

# Function to test endpoint
function Test-Endpoint {
    param($url, $name)
    try {
        $response = Invoke-RestMethod -Uri $url -Method GET -Headers $headers
        Write-Host "✅ $name - SUCCESS" -ForegroundColor Green
        return @{ Name = $name; Status = "PASS"; Details = "OK" }
    } catch {
        $statusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { "Unknown" }
        Write-Host "❌ $name - FAILED ($statusCode)" -ForegroundColor Red
        return @{ Name = $name; Status = "FAIL"; Details = "Status: $statusCode" }
    }
}

Write-Host "`n📊 Testing Analytics..." -ForegroundColor Yellow
$tests += Test-Endpoint "$BaseUrl/admin/analytics/dashboard" "Dashboard Analytics"
$tests += Test-Endpoint "$BaseUrl/admin/analytics/users" "User Analytics"
$tests += Test-Endpoint "$BaseUrl/admin/analytics/revenue" "Revenue Analytics"
$tests += Test-Endpoint "$BaseUrl/admin/analytics/bookings" "Booking Analytics"
$tests += Test-Endpoint "$BaseUrl/admin/analytics/orders" "Order Analytics"

Write-Host "`n👥 Testing User Management..." -ForegroundColor Yellow
$tests += Test-Endpoint "$BaseUrl/admin/users" "Get All Users"
$tests += Test-Endpoint "$BaseUrl/admin/users/statistics" "User Statistics"
$tests += Test-Endpoint "$BaseUrl/admin/users?search=test" "User Search"
$tests += Test-Endpoint "$BaseUrl/admin/users?role=student" "Active Users"

Write-Host "`n🏠 Testing Accommodation Management..." -ForegroundColor Yellow
$tests += Test-Endpoint "$BaseUrl/admin/accommodations" "All Accommodations"
$tests += Test-Endpoint "$BaseUrl/admin/accommodations/statistics" "Accommodation Stats"
$tests += Test-Endpoint "$BaseUrl/admin/accommodations?status=pending" "Pending Approvals"

Write-Host "`n🍕 Testing Food Provider Management..." -ForegroundColor Yellow
$tests += Test-Endpoint "$BaseUrl/admin/food-services" "Food Options"
$tests += Test-Endpoint "$BaseUrl/admin/food-services/statistics" "Food Stats"
$tests += Test-Endpoint "$BaseUrl/admin/food-services/reports" "Provider Reports"

Write-Host "`n🛡 Testing Content Moderation..." -ForegroundColor Yellow
$tests += Test-Endpoint "$BaseUrl/admin/content/reports" "Content Reports"
$tests += Test-Endpoint "$BaseUrl/admin/content/review-queue" "Review Queue"
$tests += Test-Endpoint "$BaseUrl/admin/content/statistics" "Moderation Stats"

Write-Host "`n💳 Testing Financial Management..." -ForegroundColor Yellow
$tests += Test-Endpoint "$BaseUrl/admin/transactions" "All Transactions"
$tests += Test-Endpoint "$BaseUrl/admin/reports/revenue" "Revenue Reports"
$tests += Test-Endpoint "$BaseUrl/admin/payments/statistics" "Payment Stats"
$tests += Test-Endpoint "$BaseUrl/admin/commissions" "Commission Reports"

Write-Host "`n📋 Testing System Reports..." -ForegroundColor Yellow
$tests += Test-Endpoint "$BaseUrl/admin/system/health" "System Health"
$tests += Test-Endpoint "$BaseUrl/admin/system/logs" "Error Logs"
$tests += Test-Endpoint "$BaseUrl/admin/system/performance" "Performance Metrics"

Write-Host "`n📤 Testing Data Export..." -ForegroundColor Yellow
$tests += Test-Endpoint "$BaseUrl/admin/export/users" "Export Users"
$tests += Test-Endpoint "$BaseUrl/admin/export/bookings" "Export Bookings"
$tests += Test-Endpoint "$BaseUrl/admin/export/transactions" "Export Transactions"

# Calculate results
$totalTests = $tests.Count
$passedTests = ($tests | Where-Object { $_.Status -eq "PASS" }).Count
$failedTests = $totalTests - $passedTests
$successRate = [math]::Round(($passedTests / $totalTests) * 100, 1)

Write-Host "`n============================================================" -ForegroundColor Magenta
Write-Host "📊 ADMIN MODULE TEST RESULTS" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Successful: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -eq 100) { "Green" } else { "Yellow" })

Write-Host "`nDetailed Results:" -ForegroundColor White
$tests | ForEach-Object {
    $color = if ($_.Status -eq "PASS") { "Green" } else { "Red" }
    $status = if ($_.Status -eq "PASS") { "✅" } else { "❌" }
    Write-Host "   $status $($_.Name)" -ForegroundColor $color
}

if ($successRate -eq 100) {
    Write-Host "`n🎯 STATUS: 100% SUCCESS ACHIEVED!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  STATUS: NEEDS ATTENTION" -ForegroundColor Yellow
    Write-Host "Failed endpoints need to be implemented in the backend." -ForegroundColor Yellow
}

Write-Host "`nTest completed at $(Get-Date)" -ForegroundColor Cyan
