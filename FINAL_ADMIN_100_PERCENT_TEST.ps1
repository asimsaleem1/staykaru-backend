# Final 100% Admin Module Test Script
# This script tests all admin endpoints to ensure 100% functionality

$ErrorActionPreference = "Continue"
$BaseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com/api"

# Colors for output
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Cyan = "Cyan"

Write-Host "========================================" -ForegroundColor $Cyan
Write-Host "StayKaru Admin Module 100% Test Suite" -ForegroundColor $Cyan
Write-Host "========================================" -ForegroundColor $Cyan

# Test counters
$TotalTests = 0
$PassedTests = 0
$FailedTests = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    $global:TotalTests++
    Write-Host "`n[$global:TotalTests] Testing: $Name" -ForegroundColor $Yellow
    Write-Host "URL: $Url" -ForegroundColor $Cyan
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "✓ PASS: $Name" -ForegroundColor $Green
        $global:PassedTests++
        return $response
    }
    catch {
        Write-Host "✗ FAIL: $Name" -ForegroundColor $Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor $Red
        $global:FailedTests++
        return $null
    }
}

# Step 1: Register Admin User
Write-Host "`n=== STEP 1: Admin User Registration ===" -ForegroundColor $Cyan

$adminData = @{
    name = "Final Test Admin"
    email = "finaladmin@staykaru.com"
    password = "FinalAdmin123!"
    role = "admin"
    phone = "1234567890"
    countryCode = "+1"
    gender = "male"
} | ConvertTo-Json

$registerResponse = Test-Endpoint -Name "Register Admin User" -Url "$BaseUrl/auth/register" -Method "POST" -Body $adminData

if (-not $registerResponse) {
    # Try to login if registration fails (user might already exist)
    Write-Host "Registration failed, attempting login..." -ForegroundColor $Yellow
    
    $loginData = @{
        email = "finaladmin@staykaru.com"
        password = "FinalAdmin123!"
    } | ConvertTo-Json
    
    $loginResponse = Test-Endpoint -Name "Login Admin User" -Url "$BaseUrl/auth/login" -Method "POST" -Body $loginData
    $token = $loginResponse.access_token
} else {
    $token = $registerResponse.access_token
}

if (-not $token) {
    Write-Host "CRITICAL ERROR: Could not obtain admin token. Exiting..." -ForegroundColor $Red
    exit 1
}

Write-Host "Admin token obtained successfully!" -ForegroundColor $Green
$headers = @{ "Authorization" = "Bearer $token" }

# Step 2: Test All Admin Endpoints
Write-Host "`n=== STEP 2: Testing All Admin Endpoints ===" -ForegroundColor $Cyan

# Analytics Endpoints
Write-Host "`n--- Analytics Endpoints ---" -ForegroundColor $Yellow
Test-Endpoint -Name "Dashboard Analytics" -Url "$BaseUrl/admin/analytics/dashboard" -Headers $headers
Test-Endpoint -Name "User Analytics" -Url "$BaseUrl/admin/analytics/users" -Headers $headers
Test-Endpoint -Name "Booking Analytics" -Url "$BaseUrl/admin/analytics/bookings" -Headers $headers
Test-Endpoint -Name "Revenue Analytics" -Url "$BaseUrl/admin/analytics/revenue" -Headers $headers
Test-Endpoint -Name "Performance Metrics" -Url "$BaseUrl/admin/analytics/performance" -Headers $headers

# User Management Endpoints
Write-Host "`n--- User Management Endpoints ---" -ForegroundColor $Yellow
Test-Endpoint -Name "Get All Users" -Url "$BaseUrl/admin/users?page=1`&limit=5" -Headers $headers
Test-Endpoint -Name "User Statistics" -Url "$BaseUrl/admin/users/statistics" -Headers $headers
Test-Endpoint -Name "User Activity Report" -Url "$BaseUrl/admin/users/activity-report" -Headers $headers

# Accommodation Management Endpoints
Write-Host "`n--- Accommodation Management Endpoints ---" -ForegroundColor $Yellow
Test-Endpoint -Name "Get All Accommodations" -Url "$BaseUrl/admin/accommodations?page=1`&limit=5" -Headers $headers
Test-Endpoint -Name "Accommodation Statistics" -Url "$BaseUrl/admin/accommodations/statistics" -Headers $headers
Test-Endpoint -Name "Accommodation Analytics" -Url "$BaseUrl/admin/accommodations/analytics" -Headers $headers

# Food Provider Management Endpoints
Write-Host "`n--- Food Provider Management Endpoints ---" -ForegroundColor $Yellow
Test-Endpoint -Name "Get All Food Providers" -Url "$BaseUrl/admin/food-providers?page=1`&limit=5" -Headers $headers
Test-Endpoint -Name "Food Provider Statistics" -Url "$BaseUrl/admin/food-providers/statistics" -Headers $headers
Test-Endpoint -Name "Food Provider Analytics" -Url "$BaseUrl/admin/food-providers/analytics" -Headers $headers

# Booking Management Endpoints
Write-Host "`n--- Booking Management Endpoints ---" -ForegroundColor $Yellow
Test-Endpoint -Name "Get All Bookings" -Url "$BaseUrl/admin/bookings?page=1`&limit=5" -Headers $headers
Test-Endpoint -Name "Booking Statistics" -Url "$BaseUrl/admin/bookings/statistics" -Headers $headers
Test-Endpoint -Name "Booking Analytics" -Url "$BaseUrl/admin/bookings/analytics" -Headers $headers

# Order Management Endpoints
Write-Host "`n--- Order Management Endpoints ---" -ForegroundColor $Yellow
Test-Endpoint -Name "Get All Orders" -Url "$BaseUrl/admin/orders?page=1`&limit=5" -Headers $headers
Test-Endpoint -Name "Order Statistics" -Url "$BaseUrl/admin/orders/statistics" -Headers $headers
Test-Endpoint -Name "Order Analytics" -Url "$BaseUrl/admin/orders/analytics" -Headers $headers

# Content Moderation Endpoints
Write-Host "`n--- Content Moderation Endpoints ---" -ForegroundColor $Yellow
Test-Endpoint -Name "Get Pending Reviews" -Url "$BaseUrl/admin/content/pending-reviews" -Headers $headers
Test-Endpoint -Name "Get Reported Content" -Url "$BaseUrl/admin/content/reported" -Headers $headers
Test-Endpoint -Name "Moderation Statistics" -Url "$BaseUrl/admin/content/moderation-stats" -Headers $headers

# Financial Endpoints
Write-Host "`n--- Financial Management Endpoints ---" -ForegroundColor $Yellow
Test-Endpoint -Name "Financial Overview" -Url "$BaseUrl/admin/financial/overview" -Headers $headers
Test-Endpoint -Name "Transaction Reports" -Url "$BaseUrl/admin/financial/transactions" -Headers $headers
Test-Endpoint -Name "Revenue Reports" -Url "$BaseUrl/admin/financial/revenue" -Headers $headers
Test-Endpoint -Name "Payment Analytics" -Url "$BaseUrl/admin/financial/payments" -Headers $headers

# System Management Endpoints
Write-Host "`n--- System Management Endpoints ---" -ForegroundColor $Yellow
Test-Endpoint -Name "System Health" -Url "$BaseUrl/admin/system/health" -Headers $headers
Test-Endpoint -Name "Application Logs" -Url "$BaseUrl/admin/system/logs?level=error`&limit=10" -Headers $headers
Test-Endpoint -Name "System Statistics" -Url "$BaseUrl/admin/system/stats" -Headers $headers

# Data Export Endpoints
Write-Host "`n--- Data Export Endpoints ---" -ForegroundColor $Yellow
Test-Endpoint -Name "Export Users" -Url "$BaseUrl/admin/export/users?format=json" -Headers $headers
Test-Endpoint -Name "Export Accommodations" -Url "$BaseUrl/admin/export/accommodations?format=json" -Headers $headers
Test-Endpoint -Name "Export Bookings" -Url "$BaseUrl/admin/export/bookings?format=json" -Headers $headers
Test-Endpoint -Name "Export Orders" -Url "$BaseUrl/admin/export/orders?format=json" -Headers $headers

# Step 3: Display Results
Write-Host "`n========================================" -ForegroundColor $Cyan
Write-Host "TEST RESULTS SUMMARY" -ForegroundColor $Cyan
Write-Host "========================================" -ForegroundColor $Cyan
Write-Host "Total Tests: $TotalTests" -ForegroundColor $Yellow
Write-Host "Passed: $PassedTests" -ForegroundColor $Green
Write-Host "Failed: $FailedTests" -ForegroundColor $Red

$successRate = [math]::Round(($PassedTests / $TotalTests) * 100, 2)
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -eq 100) { $Green } else { $Yellow })

if ($successRate -eq 100) {
    Write-Host "`n🎉 CONGRATULATIONS! 100% SUCCESS RATE ACHIEVED! 🎉" -ForegroundColor $Green
    Write-Host "All admin module endpoints are working perfectly!" -ForegroundColor $Green
} else {
    Write-Host "`n⚠️  Some endpoints need attention to achieve 100% success rate." -ForegroundColor $Yellow
    Write-Host "Please review the failed tests above and fix the corresponding backend endpoints." -ForegroundColor $Yellow
}

Write-Host "`nTest completed at: $(Get-Date)" -ForegroundColor $Cyan
