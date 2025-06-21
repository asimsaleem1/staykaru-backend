# Comprehensive Backend Test - Admin & Landlord
# Tests both admin and landlord functionality in sequence

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

Write-Host "=== STAYKARU COMPREHENSIVE BACKEND TEST ===" -ForegroundColor Cyan
Write-Host "Testing Admin & Landlord Functionality" -ForegroundColor Cyan
Write-Host "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "---------------------------------------" -ForegroundColor Cyan

# Statistics
$global:totalTests = 0
$global:passedTests = 0
$global:testResults = @()

function Test-Endpoint {
    param(
        [string]$name,
        [scriptblock]$test
    )
    
    $global:totalTests++
    Write-Host "`nTesting $name..." -ForegroundColor Yellow
    
    try {
        & $test
        Write-Host "✅ $name successful" -ForegroundColor Green
        $global:passedTests++
        $global:testResults += [PSCustomObject]@{
            TestName = $name
            Passed = $true
            Message = ""
        }
    } catch {
        Write-Host "❌ $name failed: $($_.Exception.Message)" -ForegroundColor Red
        $global:testResults += [PSCustomObject]@{
            TestName = $name
            Passed = $false
            Message = $_.Exception.Message
        }
    }
}

# Part 1: Admin Functionality
Write-Host "`n=== ADMIN FUNCTIONALITY ===" -ForegroundColor Magenta

# 1. Admin Login
$script:adminToken = ""
Test-Endpoint "Admin Login" {
    $loginData = @{
        email = "assaleemofficial@gmail.com"
        password = "Sarim786"
    }
    
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
    $script:adminToken = $response.access_token
    
    if (-not $script:adminToken) {
        throw "No admin token received"
    }
}

$script:adminHeaders = @{
    "Authorization" = "Bearer $script:adminToken"
    "Content-Type" = "application/json"
}

# 2. Get Admin Dashboard
Test-Endpoint "Admin Dashboard" {
    Invoke-RestMethod -Uri "$baseUrl/analytics/dashboard" -Method GET -Headers $script:adminHeaders | Out-Null
}

# 3. Get Pending Accommodations
Test-Endpoint "Pending Accommodations" {
    Invoke-RestMethod -Uri "$baseUrl/accommodations/admin/pending" -Method GET -Headers $script:adminHeaders | Out-Null
}

# 4. Get All Users
Test-Endpoint "All Users" {
    Invoke-RestMethod -Uri "$baseUrl/users/admin/all" -Method GET -Headers $script:adminHeaders | Out-Null
}

# 5. Get Food Providers
Test-Endpoint "Food Providers" {
    Invoke-RestMethod -Uri "$baseUrl/food-providers/admin/all" -Method GET -Headers $script:adminHeaders | Out-Null
}

# Part 2: Landlord Functionality
Write-Host "`n=== LANDLORD FUNCTIONALITY ===" -ForegroundColor Magenta

# 1. Register Landlord
$script:landlordEmail = "landlord.test.$(Get-Random)@test.com"
$script:landlordPassword = "Test123!@#"
Test-Endpoint "Landlord Registration" {
    $registerData = @{
        name = "Test Landlord"
        email = $script:landlordEmail
        password = $script:landlordPassword
        phone = "+1234567890"
        role = "landlord"
        gender = "male"
    }
    
    Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body ($registerData | ConvertTo-Json) -ContentType "application/json" | Out-Null
}

# 2. Landlord Login
$script:landlordToken = ""
Test-Endpoint "Landlord Login" {
    $loginData = @{
        email = $script:landlordEmail
        password = $script:landlordPassword
    }
    
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
    $script:landlordToken = $response.access_token
    
    if (-not $script:landlordToken) {
        throw "No landlord token received"
    }
}

$script:landlordHeaders = @{
    "Authorization" = "Bearer $script:landlordToken"
    "Content-Type" = "application/json"
}

# 3. Get Cities
$script:cityId = ""
Test-Endpoint "Get Cities" {
    $cities = Invoke-RestMethod -Uri "$baseUrl/location/cities" -Method GET
    if ($cities.Count -eq 0) {
        throw "No cities found"
    }
    $script:cityId = $cities[0]._id
}

# 4. Create Accommodation
$script:accommodationId = ""
Test-Endpoint "Create Accommodation" {
    $accommodationData = @{
        title = "Test Accommodation $(Get-Random)"
        description = "A test accommodation for comprehensive testing"
        city = $script:cityId
        price = 1000
        amenities = @("WiFi", "Parking")
        availability = @("2025-06-22", "2025-06-23")
    }
    
    $response = Invoke-RestMethod -Uri "$baseUrl/accommodations" -Method POST -Body ($accommodationData | ConvertTo-Json) -Headers $script:landlordHeaders
    $script:accommodationId = $response._id
    
    if (-not $script:accommodationId) {
        throw "No accommodation ID received"
    }
}

# 5. Get Landlord Dashboard
Test-Endpoint "Landlord Dashboard" {
    Invoke-RestMethod -Uri "$baseUrl/accommodations/landlord/dashboard" -Method GET -Headers $script:landlordHeaders | Out-Null
}

# 6. Get Landlord Accommodations
Test-Endpoint "Landlord Accommodations" {
    Invoke-RestMethod -Uri "$baseUrl/accommodations/landlord" -Method GET -Headers $script:landlordHeaders | Out-Null
}

# 7. Get Landlord Profile
Test-Endpoint "Landlord Profile" {
    Invoke-RestMethod -Uri "$baseUrl/users/landlord/profile" -Method GET -Headers $script:landlordHeaders | Out-Null
}

# 8. Get Landlord Statistics
Test-Endpoint "Landlord Statistics" {
    Invoke-RestMethod -Uri "$baseUrl/users/landlord/statistics" -Method GET -Headers $script:landlordHeaders | Out-Null
}

# 9. Change Password
Test-Endpoint "Change Password" {
    $changePasswordData = @{
        oldPassword = $script:landlordPassword
        newPassword = "NewTest123!@#"
    }
    
    Invoke-RestMethod -Uri "$baseUrl/users/change-password" -Method PUT -Body ($changePasswordData | ConvertTo-Json) -Headers $script:landlordHeaders | Out-Null
}

# 10. Login with New Password
Test-Endpoint "Login with New Password" {
    $loginData = @{
        email = $script:landlordEmail
        password = "NewTest123!@#"
    }
    
    Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json" | Out-Null
}

# Calculate success rate
$successRate = if ($global:totalTests -gt 0) { [math]::Round(($global:passedTests / $global:totalTests) * 100, 1) } else { 0 }

Write-Host "`n=== TEST SUMMARY ===" -ForegroundColor Green
Write-Host "Total Tests: $global:totalTests" -ForegroundColor Cyan
Write-Host "Passed Tests: $global:passedTests" -ForegroundColor Green
Write-Host "Failed Tests: $($global:totalTests - $global:passedTests)" -ForegroundColor Red
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -gt 90) { "Green" } elseif ($successRate -gt 70) { "Yellow" } else { "Red" })

if ($successRate -eq 100) {
    Write-Host "`n🎉 PERFECT: All backend functionality is working perfectly!" -ForegroundColor Green
} elseif ($successRate -gt 90) {
    Write-Host "`n🎉 EXCELLENT: Backend functionality is working very well!" -ForegroundColor Green
} elseif ($successRate -gt 70) {
    Write-Host "`n👍 GOOD: Most backend features are working correctly!" -ForegroundColor Yellow
} else {
    Write-Host "`n⚠️ NEEDS WORK: Several backend features still need fixing!" -ForegroundColor Red
}

Write-Host "`nDetailed Test Results:" -ForegroundColor Cyan
foreach ($result in $global:testResults) {
    $statusColor = if ($result.Passed) { "Green" } else { "Red" }
    $statusSymbol = if ($result.Passed) { "✅" } else { "❌" }
    Write-Host "$statusSymbol $($result.TestName)" -ForegroundColor $statusColor
    if (-not $result.Passed -and $result.Message) {
        Write-Host "   Error: $($result.Message)" -ForegroundColor Red
    }
}

Write-Host "`nTest Completed at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
