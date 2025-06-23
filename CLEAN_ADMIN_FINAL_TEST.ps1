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
        Write-Host "✗ $Name - FAIL: $($_.Exception.Message)" -ForegroundColor $Red
        $script:FailCount++
        return $false
    }
}
}

Write-Host "=====================================" -ForegroundColor $Cyan
Write-Host "StayKaru Admin Module Final Test" -ForegroundColor $Cyan
Write-Host "=====================================" -ForegroundColor $Cyan

# Step 1: Get admin token
Write-Host "`n=== Getting Admin Token ===" -ForegroundColor $Yellow

$loginBody = @{
    email = "admin@staykaru.com"
    password = "Admin123!"
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
Write-Host "`n=== Testing Admin Endpoints ===" -ForegroundColor $Yellow

# Analytics
Test-AdminEndpoint "$BaseUrl/admin/analytics/dashboard" "Dashboard Analytics" $token
Test-AdminEndpoint "$BaseUrl/admin/analytics/users" "User Analytics" $token
Test-AdminEndpoint "$BaseUrl/admin/analytics/revenue" "Revenue Analytics" $token
Test-AdminEndpoint "$BaseUrl/admin/analytics/bookings" "Booking Analytics" $token
Test-AdminEndpoint "$BaseUrl/admin/analytics/orders" "Order Analytics" $token
Test-AdminEndpoint "$BaseUrl/admin/analytics/performance" "Performance Analytics" $token

# User Management
Test-AdminEndpoint "$BaseUrl/admin/users" "Get All Users" $token
Test-AdminEndpoint "$BaseUrl/admin/users/statistics" "User Statistics" $token

# Accommodation Management
Test-AdminEndpoint "$BaseUrl/admin/accommodations" "All Accommodations" $token
Test-AdminEndpoint "$BaseUrl/admin/accommodations/statistics" "Accommodation Statistics" $token

# Food Provider Management
Test-AdminEndpoint "$BaseUrl/admin/food-services" "Food Services" $token
Test-AdminEndpoint "$BaseUrl/admin/food-services/statistics" "Food Service Statistics" $token
Test-AdminEndpoint "$BaseUrl/admin/food-services/reports" "Food Service Reports" $token
Test-AdminEndpoint "$BaseUrl/admin/food-providers" "Food Providers" $token
Test-AdminEndpoint "$BaseUrl/admin/food-providers/statistics" "Food Provider Statistics" $token
Test-AdminEndpoint "$BaseUrl/admin/food-providers/analytics" "Food Provider Analytics" $token

# Booking Management
Test-AdminEndpoint "$BaseUrl/admin/bookings" "All Bookings" $token

# Order Management  
Test-AdminEndpoint "$BaseUrl/admin/orders" "All Orders" $token

# Content Moderation
Test-AdminEndpoint "$BaseUrl/admin/content/reports" "Content Reports" $token
Test-AdminEndpoint "$BaseUrl/admin/content/review-queue" "Review Queue" $token
Test-AdminEndpoint "$BaseUrl/admin/content/statistics" "Moderation Statistics" $token

# Financial Management
Test-AdminEndpoint "$BaseUrl/admin/transactions" "All Transactions" $token
Test-AdminEndpoint "$BaseUrl/admin/payments/statistics" "Payment Statistics" $token
Test-AdminEndpoint "$BaseUrl/admin/commissions" "Commission Reports" $token

# System Management
Test-AdminEndpoint "$BaseUrl/admin/system/health" "System Health" $token
Test-AdminEndpoint "$BaseUrl/admin/system/performance" "System Performance" $token
Test-AdminEndpoint "$BaseUrl/admin/system/logs" "System Logs" $token

# Data Export
Test-AdminEndpoint "$BaseUrl/admin/export/users" "Export Users" $token
Test-AdminEndpoint "$BaseUrl/admin/export/bookings" "Export Bookings" $token
Test-AdminEndpoint "$BaseUrl/admin/export/transactions" "Export Transactions" $token

# Configuration
Test-AdminEndpoint "$BaseUrl/admin/config/platform" "Platform Config" $token

# Activity Report
Test-AdminEndpoint "$BaseUrl/admin/users/activity-report" "User Activity Report" $token

# Results
$TotalTests = $PassCount + $FailCount
$SuccessRate = [math]::Round(($PassCount / $TotalTests) * 100, 1)

Write-Host "`n=====================================" -ForegroundColor $Cyan
Write-Host "FINAL RESULTS" -ForegroundColor $Cyan
Write-Host "=====================================" -ForegroundColor $Cyan
Write-Host "Total Tests: $TotalTests"
Write-Host "Passed: $PassCount" -ForegroundColor $Green
Write-Host "Failed: $FailCount" -ForegroundColor $Red
Write-Host "Success Rate: $SuccessRate%" -ForegroundColor $(if ($SuccessRate -eq 100) { $Green } else { $Yellow })

if ($SuccessRate -eq 100) {
    Write-Host "`n🎉 CONGRATULATIONS! 100% SUCCESS RATE ACHIEVED! 🎉" -ForegroundColor $Green
} else {
    Write-Host "`n⚠️ Some endpoints need attention." -ForegroundColor $Yellow
}

Write-Host "`nTest completed at: $(Get-Date)" -ForegroundColor $Cyan
