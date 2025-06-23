# StayKaru Admin Module 100% Test Script
param()

$ErrorActionPreference = "Continue"
$BaseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com/api"

Write-Host "StayKaru Admin Module 100% Test Suite" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Test counters
$TotalTests = 0
$PassedTests = 0
$FailedTests = 0

function Test-AdminEndpoint {
    param(
        [string]$TestName,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    $global:TotalTests++
    Write-Host ""
    Write-Host "[$global:TotalTests] $TestName" -ForegroundColor Yellow
    
    try {
        $requestParams = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
        }
        
        if ($Body) {
            $requestParams.Body = $Body
            $requestParams.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @requestParams
        Write-Host "PASS: $TestName" -ForegroundColor Green
        $global:PassedTests++
        return $response
    }
    catch {
        Write-Host "FAIL: $TestName" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        $global:FailedTests++
        return $null
    }
}

# Step 1: Get Admin Token
Write-Host ""
Write-Host "=== Getting Admin Token ===" -ForegroundColor Cyan

$adminRegisterData = @{
    name = "Admin Test User"
    email = "admintest@staykaru.com"
    password = "AdminTest123!"
    role = "admin"
    phone = "1234567890"
    countryCode = "+1"
    gender = "male"
} | ConvertTo-Json

$registerResponse = Test-AdminEndpoint -TestName "Register Admin User" -Url "$BaseUrl/auth/register" -Method "POST" -Body $adminRegisterData

if (-not $registerResponse) {
    # Try login if registration failed
    $loginData = @{
        email = "admintest@staykaru.com"
        password = "AdminTest123!"
    } | ConvertTo-Json
    
    $loginResponse = Test-AdminEndpoint -TestName "Login Admin User" -Url "$BaseUrl/auth/login" -Method "POST" -Body $loginData
    $token = $loginResponse.access_token
} else {
    $token = $registerResponse.access_token
}

if (-not $token) {
    Write-Host "ERROR: Could not get admin token" -ForegroundColor Red
    exit 1
}

$headers = @{ "Authorization" = "Bearer $token" }

# Step 2: Test Admin Endpoints
Write-Host ""
Write-Host "=== Testing Admin Endpoints ===" -ForegroundColor Cyan

# Analytics
Test-AdminEndpoint -TestName "Dashboard Analytics" -Url "$BaseUrl/admin/analytics/dashboard" -Headers $headers
Test-AdminEndpoint -TestName "User Analytics" -Url "$BaseUrl/admin/analytics/users" -Headers $headers
Test-AdminEndpoint -TestName "Booking Analytics" -Url "$BaseUrl/admin/analytics/bookings" -Headers $headers
Test-AdminEndpoint -TestName "Revenue Analytics" -Url "$BaseUrl/admin/analytics/revenue" -Headers $headers
Test-AdminEndpoint -TestName "Performance Metrics" -Url "$BaseUrl/admin/analytics/performance" -Headers $headers

# User Management
Test-AdminEndpoint -TestName "Get All Users" -Url "$BaseUrl/admin/users" -Headers $headers
Test-AdminEndpoint -TestName "User Statistics" -Url "$BaseUrl/admin/users/statistics" -Headers $headers
Test-AdminEndpoint -TestName "User Activity Report" -Url "$BaseUrl/admin/users/activity-report" -Headers $headers

# Accommodation Management
Test-AdminEndpoint -TestName "Get All Accommodations" -Url "$BaseUrl/admin/accommodations" -Headers $headers
Test-AdminEndpoint -TestName "Accommodation Statistics" -Url "$BaseUrl/admin/accommodations/statistics" -Headers $headers
Test-AdminEndpoint -TestName "Accommodation Analytics" -Url "$BaseUrl/admin/accommodations/analytics" -Headers $headers

# Food Provider Management
Test-AdminEndpoint -TestName "Get All Food Providers" -Url "$BaseUrl/admin/food-providers" -Headers $headers
Test-AdminEndpoint -TestName "Food Provider Statistics" -Url "$BaseUrl/admin/food-providers/statistics" -Headers $headers
Test-AdminEndpoint -TestName "Food Provider Analytics" -Url "$BaseUrl/admin/food-providers/analytics" -Headers $headers

# Booking Management
Test-AdminEndpoint -TestName "Get All Bookings" -Url "$BaseUrl/admin/bookings" -Headers $headers
Test-AdminEndpoint -TestName "Booking Statistics" -Url "$BaseUrl/admin/bookings/statistics" -Headers $headers
Test-AdminEndpoint -TestName "Booking Analytics" -Url "$BaseUrl/admin/bookings/analytics" -Headers $headers

# Order Management
Test-AdminEndpoint -TestName "Get All Orders" -Url "$BaseUrl/admin/orders" -Headers $headers
Test-AdminEndpoint -TestName "Order Statistics" -Url "$BaseUrl/admin/orders/statistics" -Headers $headers
Test-AdminEndpoint -TestName "Order Analytics" -Url "$BaseUrl/admin/orders/analytics" -Headers $headers

# Content Moderation
Test-AdminEndpoint -TestName "Pending Reviews" -Url "$BaseUrl/admin/content/pending-reviews" -Headers $headers
Test-AdminEndpoint -TestName "Reported Content" -Url "$BaseUrl/admin/content/reported" -Headers $headers
Test-AdminEndpoint -TestName "Moderation Stats" -Url "$BaseUrl/admin/content/moderation-stats" -Headers $headers

# Financial Management
Test-AdminEndpoint -TestName "Financial Overview" -Url "$BaseUrl/admin/financial/overview" -Headers $headers
Test-AdminEndpoint -TestName "Transaction Reports" -Url "$BaseUrl/admin/financial/transactions" -Headers $headers
Test-AdminEndpoint -TestName "Revenue Reports" -Url "$BaseUrl/admin/financial/revenue" -Headers $headers
Test-AdminEndpoint -TestName "Payment Analytics" -Url "$BaseUrl/admin/financial/payments" -Headers $headers

# System Management
Test-AdminEndpoint -TestName "System Health" -Url "$BaseUrl/admin/system/health" -Headers $headers
Test-AdminEndpoint -TestName "Application Logs" -Url "$BaseUrl/admin/system/logs" -Headers $headers
Test-AdminEndpoint -TestName "System Statistics" -Url "$BaseUrl/admin/system/stats" -Headers $headers

# Data Export
Test-AdminEndpoint -TestName "Export Users" -Url "$BaseUrl/admin/export/users" -Headers $headers
Test-AdminEndpoint -TestName "Export Accommodations" -Url "$BaseUrl/admin/export/accommodations" -Headers $headers
Test-AdminEndpoint -TestName "Export Bookings" -Url "$BaseUrl/admin/export/bookings" -Headers $headers
Test-AdminEndpoint -TestName "Export Orders" -Url "$BaseUrl/admin/export/orders" -Headers $headers

# Results Summary
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Total Tests: $TotalTests" -ForegroundColor Yellow
Write-Host "Passed: $PassedTests" -ForegroundColor Green
Write-Host "Failed: $FailedTests" -ForegroundColor Red

$successRate = [math]::Round(($PassedTests / $TotalTests) * 100, 2)
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -eq 100) { "Green" } else { "Yellow" })

if ($successRate -eq 100) {
    Write-Host ""
    Write-Host "CONGRATULATIONS! 100% SUCCESS RATE ACHIEVED!" -ForegroundColor Green
    Write-Host "All admin module endpoints are working perfectly!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Some endpoints need attention to achieve 100% success rate." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Test completed at: $(Get-Date)" -ForegroundColor Cyan
