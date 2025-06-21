# StayKaru Food Provider Deletion Test Script
# This script tests the food provider deletion functionality
# Date: June 21, 2025

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

Write-Host "=== STAYKARU FOOD PROVIDER DELETION TEST ===" -ForegroundColor Cyan
Write-Host "Testing food provider deletion functionality" -ForegroundColor Cyan
Write-Host "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "---------------------------------------------" -ForegroundColor Cyan

$global:totalTests = 0
$global:passedTests = 0
$global:testResults = @()

function Write-TestResult {
    param (
        [string]$testName,
        [bool]$passed,
        [string]$message = "",
        [string]$category = "GENERAL"
    )
    
    $global:totalTests++
    if ($passed) {
        $global:passedTests++
        Write-Host "✅ [$category] $testName" -ForegroundColor Green
    } else {
        Write-Host "❌ [$category] $testName - $message" -ForegroundColor Red
    }
    
    $global:testResults += [PSCustomObject]@{
        TestName = $testName
        Category = $category
        Passed = $passed
        Message = $message
    }
}

# Generate random data for testing
$randomSuffix = Get-Random
$testEmail = "foodprovider.deletion.$randomSuffix@test.com"
$testPassword = "StrongP@ss123"

# ============ 1. SETUP ============
Write-Host "`n1. SETUP" -ForegroundColor Yellow

# 1.1 Register food provider account
$registerData = @{
    name = "Food Provider for Deletion Test $randomSuffix"
    email = $testEmail
    password = $testPassword
    phone = "+1234567890"
    role = "food_provider"
    gender = "male"
}

try {
    Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body ($registerData | ConvertTo-Json) -ContentType "application/json" | Out-Null
    Write-TestResult -testName "Register food provider account" -passed $true -category "SETUP"
} catch {
    Write-TestResult -testName "Register food provider account" -passed $false -message $_.Exception.Message -category "SETUP"
    exit 1  # Exit if registration fails
}

# 1.2 Login to get token
$loginData = @{
    email = $testEmail
    password = $testPassword
}

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
    $script:token = $loginResponse.access_token
    Write-TestResult -testName "Login and get token" -passed ($null -ne $script:token) -category "SETUP"
} catch {
    Write-TestResult -testName "Login and get token" -passed $false -message $_.Exception.Message -category "SETUP"
    exit 1  # Exit if login fails
}

$script:headers = @{
    "Authorization" = "Bearer $script:token"
    "Content-Type" = "application/json"
}

# 1.3 Create a food provider
$foodProviderData = @{
    name = "Test Restaurant for Deletion $randomSuffix"
    description = "Restaurant created for deletion testing"
    cuisine_type = "Test Cuisine"
    location = "646a4aaef90c5295e820c18a"  # Using a valid location ID from the database
    operating_hours = @{
        open = "09:00"
        close = "22:00"
    }
    contact_info = @{
        phone = "+1234567890"
        email = "deletion.test.$randomSuffix@restaurant.com"
    }
}

try {
    $createdProvider = Invoke-RestMethod -Uri "$baseUrl/food-providers" -Method POST -Body ($foodProviderData | ConvertTo-Json -Depth 5) -Headers $script:headers
    $script:foodProviderId = $createdProvider._id
    Write-TestResult -testName "Create food provider" -passed ($null -ne $script:foodProviderId) -category "SETUP"
} catch {
    Write-TestResult -testName "Create food provider" -passed $false -message $_.Exception.Message -category "SETUP"
    exit 1  # Exit if provider creation fails
}

# ============ 2. DELETION TESTS ============
Write-Host "`n2. DELETION TESTS" -ForegroundColor Yellow

# 2.1 Verify provider exists before deletion
    $providerExists = $true
    try {
        $provider = Invoke-RestMethod -Uri "$baseUrl/food-providers/$script:foodProviderId" -Method GET
        Write-TestResult -testName "Verify provider exists before deletion" -passed $true -category "DELETION"
    } catch {
        $providerExists = $false
        Write-TestResult -testName "Verify provider exists before deletion" -passed $false -message $_.Exception.Message -category "DELETION"
    }

# 2.2 Delete food provider
try {
    $deleteResponse = Invoke-RestMethod -Uri "$baseUrl/food-providers/$script:foodProviderId" -Method DELETE -Headers $script:headers
    Write-TestResult -testName "Delete food provider" -passed ($deleteResponse.message -eq "Food provider deleted successfully") -category "DELETION"
} catch {
    Write-TestResult -testName "Delete food provider" -passed $false -message $_.Exception.Message -category "DELETION"
}

# 2.3 Verify provider is deleted (should return 404)
try {
    Invoke-RestMethod -Uri "$baseUrl/food-providers/$script:foodProviderId" -Method GET -ErrorAction SilentlyContinue
    Write-TestResult -testName "Verify provider is deleted" -passed $false -message "Provider still exists after deletion" -category "DELETION"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-TestResult -testName "Verify provider is deleted" -passed $true -category "DELETION"
    } else {
        Write-TestResult -testName "Verify provider is deleted" -passed $false -message "Unexpected error: $($_.Exception.Message)" -category "DELETION"
    }
}

# 2.4 Try to delete the same provider again (should fail)
try {
    Invoke-RestMethod -Uri "$baseUrl/food-providers/$script:foodProviderId" -Method DELETE -Headers $script:headers -ErrorAction SilentlyContinue
    Write-TestResult -testName "Delete already deleted provider (should fail)" -passed $false -message "Expected failure but deletion succeeded" -category "DELETION"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-TestResult -testName "Delete already deleted provider (should fail)" -passed $true -category "DELETION"
    } else {
        Write-TestResult -testName "Delete already deleted provider (should fail)" -passed $false -message "Unexpected error: $($_.Exception.Message)" -category "DELETION"
    }
}

# 2.5 Create a second food provider to test authorization
$secondProviderData = @{
    name = "Second Restaurant for Auth Test $randomSuffix"
    description = "Restaurant created for authorization testing"
    cuisine_type = "Test Cuisine"
    location = "646a4aaef90c5295e820c18a"  # Using a valid location ID from the database
    operating_hours = @{
        open = "09:00"
        close = "22:00"
    }
    contact_info = @{
        phone = "+1234567890"
        email = "second.deletion.test.$randomSuffix@restaurant.com"
    }
}

try {
    $secondProvider = Invoke-RestMethod -Uri "$baseUrl/food-providers" -Method POST -Body ($secondProviderData | ConvertTo-Json -Depth 5) -Headers $script:headers
    $script:secondProviderId = $secondProvider._id
    Write-TestResult -testName "Create second food provider" -passed ($null -ne $script:secondProviderId) -category "AUTHORIZATION"
} catch {
    Write-TestResult -testName "Create second food provider" -passed $false -message $_.Exception.Message -category "AUTHORIZATION"
}

# 2.6 Create a student account to test role-based access
$studentData = @{
    name = "Student for Auth Test $randomSuffix"
    email = "student.deletion.$randomSuffix@test.com"
    password = $testPassword
    phone = "+1234567890"
    role = "student"
    gender = "female"
}

try {
    Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body ($studentData | ConvertTo-Json) -ContentType "application/json" | Out-Null
    Write-TestResult -testName "Register student account" -passed $true -category "AUTHORIZATION"
} catch {
    Write-TestResult -testName "Register student account" -passed $false -message $_.Exception.Message -category "AUTHORIZATION"
}

# 2.7 Login as student
$studentLoginData = @{
    email = $studentData.email
    password = $studentData.password
}

try {
    $studentLoginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body ($studentLoginData | ConvertTo-Json) -ContentType "application/json"
    $script:studentToken = $studentLoginResponse.access_token
    Write-TestResult -testName "Login as student" -passed ($null -ne $script:studentToken) -category "AUTHORIZATION"
} catch {
    Write-TestResult -testName "Login as student" -passed $false -message $_.Exception.Message -category "AUTHORIZATION"
}

$script:studentHeaders = @{
    "Authorization" = "Bearer $script:studentToken"
    "Content-Type" = "application/json"
}

# 2.8 Try to delete provider as student (should fail)
try {
    Invoke-RestMethod -Uri "$baseUrl/food-providers/$script:secondProviderId" -Method DELETE -Headers $script:studentHeaders -ErrorAction SilentlyContinue
    Write-TestResult -testName "Delete provider as student (should fail)" -passed $false -message "Expected failure but deletion succeeded" -category "AUTHORIZATION"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 403) {
        Write-TestResult -testName "Delete provider as student (should fail)" -passed $true -category "AUTHORIZATION"
    } else {
        Write-TestResult -testName "Delete provider as student (should fail)" -passed $false -message "Unexpected error: $($_.Exception.Message)" -category "AUTHORIZATION"
    }
}

# 2.9 Delete the second provider as the owner
try {
    $deleteResponse = Invoke-RestMethod -Uri "$baseUrl/food-providers/$script:secondProviderId" -Method DELETE -Headers $script:headers
    Write-TestResult -testName "Delete second provider as owner" -passed ($deleteResponse.message -eq "Food provider deleted successfully") -category "CLEANUP"
} catch {
    Write-TestResult -testName "Delete second provider as owner" -passed $false -message $_.Exception.Message -category "CLEANUP"
}

# Calculate success rate and generate summary
$successRate = if ($global:totalTests -gt 0) { [math]::Round(($global:passedTests / $global:totalTests) * 100, 1) } else { 0 }

Write-Host "`n=== TEST SUMMARY ===" -ForegroundColor Green
Write-Host "Total Tests: $global:totalTests" -ForegroundColor Cyan
Write-Host "Passed Tests: $global:passedTests" -ForegroundColor Green
Write-Host "Failed Tests: $($global:totalTests - $global:passedTests)" -ForegroundColor Red
Write-Host "Overall Success Rate: $successRate%" -ForegroundColor $(if ($successRate -gt 95) { "Green" } elseif ($successRate -gt 80) { "Yellow" } else { "Red" })

Write-Host "`n=== FAILED TESTS ===" -ForegroundColor Red
$failedTests = $global:testResults | Where-Object { $_.Passed -eq $false }
if ($failedTests.Count -eq 0) {
    Write-Host "No failed tests! All tests passed successfully." -ForegroundColor Green
} else {
    foreach ($test in $failedTests) {
        Write-Host "❌ [$($test.Category)] $($test.TestName) - $($test.Message)" -ForegroundColor Red
    }
}

Write-Host "`nTest Completed at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "==============================================`n" -ForegroundColor Cyan
