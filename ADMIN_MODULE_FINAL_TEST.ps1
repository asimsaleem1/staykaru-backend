# StayKaru Admin Module Complete Test
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow" 
$Cyan = "Cyan"

$BaseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com/api"
$PassCount = 0
$FailCount = 0

function Test-AdminEndpoint {
    param($Url, $Name, $Token)
    
    try {
        $headers = @{ 'Authorization' = "Bearer $Token" }
        $response = Invoke-RestMethod -Uri $Url -Headers $headers -Method GET
        Write-Host "✓ $Name - PASS" -ForegroundColor $Green
        $script:PassCount++
        return $true
    }
    catch {
        $errorMsg = $_.Exception.Message
        if ($_.Exception.Response.StatusCode -eq 404) {
            $errorMsg = "404 - Endpoint not found"
        }
        Write-Host "✗ $Name - FAIL: $errorMsg" -ForegroundColor $Red
        $script:FailCount++
        return $false
    }
}

Write-Host "=====================================" -ForegroundColor $Cyan
Write-Host "StayKaru Admin Module Final Test" -ForegroundColor $Cyan
Write-Host "=====================================" -ForegroundColor $Cyan

# Step 1: Get admin token
Write-Host ""
Write-Host "=== Getting Admin Token ===" -ForegroundColor $Yellow

$loginBody = @{
    email = "admin2@staykaru.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.access_token
    Write-Host "✓ Admin login successful!" -ForegroundColor $Green
}
catch {
    Write-Host "✗ Admin login failed: $($_.Exception.Message)" -ForegroundColor $Red
    exit 1
}

# Step 2: Test all admin endpoints
Write-Host ""
Write-Host "=== Testing Admin Endpoints ===" -ForegroundColor $Yellow

Write-Host ""
Write-Host "--- Analytics Endpoints ---" -ForegroundColor $Yellow
Test-AdminEndpoint "$BaseUrl/admin/analytics/dashboard" "Dashboard Analytics" $token
Test-AdminEndpoint "$BaseUrl/admin/analytics/users" "User Analytics" $token
Test-AdminEndpoint "$BaseUrl/admin/analytics/revenue" "Revenue Analytics" $token
Test-AdminEndpoint "$BaseUrl/admin/analytics/bookings" "Booking Analytics" $token
Test-AdminEndpoint "$BaseUrl/admin/analytics/orders" "Order Analytics" $token
Test-AdminEndpoint "$BaseUrl/admin/analytics/performance" "Performance Analytics" $token

Write-Host ""
Write-Host "--- User Management Endpoints ---" -ForegroundColor $Yellow
Test-AdminEndpoint "$BaseUrl/admin/users" "Get All Users" $token
Test-AdminEndpoint "$BaseUrl/admin/users/statistics" "User Statistics" $token
Test-AdminEndpoint "$BaseUrl/admin/users/activity-report" "User Activity Report" $token

Write-Host ""
Write-Host "--- Accommodation Management Endpoints ---" -ForegroundColor $Yellow
Test-AdminEndpoint "$BaseUrl/admin/accommodations" "All Accommodations" $token
Test-AdminEndpoint "$BaseUrl/admin/accommodations/statistics" "Accommodation Statistics" $token

Write-Host ""
Write-Host "--- Food Provider Management Endpoints ---" -ForegroundColor $Yellow
Test-AdminEndpoint "$BaseUrl/admin/food-services" "Food Services" $token
Test-AdminEndpoint "$BaseUrl/admin/food-services/statistics" "Food Service Statistics" $token
Test-AdminEndpoint "$BaseUrl/admin/food-services/reports" "Food Service Reports" $token
Test-AdminEndpoint "$BaseUrl/admin/food-providers" "Food Providers" $token
Test-AdminEndpoint "$BaseUrl/admin/food-providers/statistics" "Food Provider Statistics" $token
Test-AdminEndpoint "$BaseUrl/admin/food-providers/analytics" "Food Provider Analytics" $token

Write-Host ""
Write-Host "--- Booking Management Endpoints ---" -ForegroundColor $Yellow
Test-AdminEndpoint "$BaseUrl/admin/bookings" "All Bookings" $token

Write-Host ""
Write-Host "--- Order Management Endpoints ---" -ForegroundColor $Yellow
Test-AdminEndpoint "$BaseUrl/admin/orders" "All Orders" $token

Write-Host ""
Write-Host "--- Content Moderation Endpoints ---" -ForegroundColor $Yellow
Test-AdminEndpoint "$BaseUrl/admin/content/reports" "Content Reports" $token
Test-AdminEndpoint "$BaseUrl/admin/content/review-queue" "Review Queue" $token
Test-AdminEndpoint "$BaseUrl/admin/content/statistics" "Moderation Statistics" $token

Write-Host ""
Write-Host "--- Financial Management Endpoints ---" -ForegroundColor $Yellow
Test-AdminEndpoint "$BaseUrl/admin/transactions" "All Transactions" $token
Test-AdminEndpoint "$BaseUrl/admin/payments/statistics" "Payment Statistics" $token
Test-AdminEndpoint "$BaseUrl/admin/commissions" "Commission Reports" $token

Write-Host ""
Write-Host "--- System Management Endpoints ---" -ForegroundColor $Yellow
Test-AdminEndpoint "$BaseUrl/admin/system/health" "System Health" $token
Test-AdminEndpoint "$BaseUrl/admin/system/performance" "System Performance" $token
Test-AdminEndpoint "$BaseUrl/admin/system/logs" "System Logs" $token

Write-Host ""
Write-Host "--- Data Export Endpoints ---" -ForegroundColor $Yellow
Test-AdminEndpoint "$BaseUrl/admin/export/users" "Export Users" $token
Test-AdminEndpoint "$BaseUrl/admin/export/bookings" "Export Bookings" $token
Test-AdminEndpoint "$BaseUrl/admin/export/transactions" "Export Transactions" $token

Write-Host ""
Write-Host "--- Configuration Endpoints ---" -ForegroundColor $Yellow
Test-AdminEndpoint "$BaseUrl/admin/config/platform" "Platform Config" $token

# Results
$TotalTests = $PassCount + $FailCount
$SuccessRate = if ($TotalTests -gt 0) { [math]::Round(($PassCount / $TotalTests) * 100, 1) } else { 0 }

Write-Host ""
Write-Host "=====================================" -ForegroundColor $Cyan
Write-Host "FINAL RESULTS" -ForegroundColor $Cyan
Write-Host "=====================================" -ForegroundColor $Cyan
Write-Host "Total Tests: $TotalTests"
Write-Host "Passed: $PassCount" -ForegroundColor $Green
Write-Host "Failed: $FailCount" -ForegroundColor $Red
Write-Host "Success Rate: $SuccessRate%" -ForegroundColor $(if ($SuccessRate -eq 100) { $Green } else { $Yellow })

if ($SuccessRate -eq 100) {
    Write-Host ""
    Write-Host "🎉 CONGRATULATIONS! 100% SUCCESS RATE ACHIEVED! 🎉" -ForegroundColor $Green
    Write-Host "All admin module endpoints are working perfectly!" -ForegroundColor $Green
} else {
    Write-Host ""
    Write-Host "⚠️ Some endpoints need attention to achieve 100% success rate." -ForegroundColor $Yellow
    Write-Host "Please review the failed tests above and fix the corresponding backend endpoints." -ForegroundColor $Yellow
}

Write-Host ""
Write-Host "Test completed at: $(Get-Date)" -ForegroundColor $Cyan

# Save results to JSON file
$results = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    totalTests = $TotalTests
    passedTests = $PassCount
    failedTests = $FailCount
    successRate = $SuccessRate
}

$resultsJson = $results | ConvertTo-Json -Depth 3
$filename = "ADMIN_MODULE_TEST_RESULTS_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
$resultsJson | Out-File -FilePath $filename -Encoding UTF8
Write-Host "Results saved to: $filename" -ForegroundColor $Cyan
