# StayKaru Final Landlord Dashboard Test
# This script tests all landlord functionality in the StayKaru platform
# Date: June 21, 2025

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

Write-Host "=== STAYKARU LANDLORD DASHBOARD FINAL TEST ===" -ForegroundColor Cyan
Write-Host "Running comprehensive test of all landlord functionality" -ForegroundColor Cyan
Write-Host "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "---------------------------------------------" -ForegroundColor Cyan

$totalTests = 0
$passedTests = 0
$testResults = @()

function Write-TestResult {
    param (
        [string]$testName,
        [bool]$passed,
        [string]$message = ""
    )
    
    $global:totalTests++
    if ($passed) {
        $global:passedTests++
        Write-Host "✅ $testName" -ForegroundColor Green
    } else {
        Write-Host "❌ $testName - $message" -ForegroundColor Red
    }
    
    $global:testResults = $global:testResults + @([PSCustomObject]@{
        TestName = $testName
        Passed = $passed
        Message = $message
    })
}

# 1. Register a new landlord
Write-Host "`n1. REGISTRATION AND AUTHENTICATION" -ForegroundColor Yellow
$randomSuffix = Get-Random
$registerData = @{
    name = "Test Landlord Final"
    email = "landlord.final.$randomSuffix@test.com"
    password = "Test123!@#"
    phone = "+1234567890"
    role = "landlord"
    gender = "male"
}

try {    Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body ($registerData | ConvertTo-Json) -ContentType "application/json" | Out-Null
    Write-TestResult -testName "User Registration (Landlord)" -passed $true
} catch {
    Write-TestResult -testName "User Registration (Landlord)" -passed $false -message $_.Exception.Message
    exit
}

# 2. Login with landlord credentials
$loginData = @{
    email = $registerData.email
    password = $registerData.password
}

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
    $token = $loginResponse.access_token
    Write-TestResult -testName "User Login" -passed $true
} catch {
    Write-TestResult -testName "User Login" -passed $false -message $_.Exception.Message
    exit
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 3. Get existing cities
Write-Host "`n2. ACCOMMODATION MANAGEMENT" -ForegroundColor Yellow
try {
    $citiesResponse = Invoke-RestMethod -Uri "$baseUrl/location/cities" -Method GET
    $existingCityId = $citiesResponse[0]._id
    Write-TestResult -testName "Get Available Cities" -passed $true
} catch {
    Write-TestResult -testName "Get Available Cities" -passed $false -message $_.Exception.Message
    $existingCityId = "683700350f8a15197d2abf4f"  # Fallback ID
}

# 4. Create accommodation
$accommodationData = @{
    title = "Luxury Apartment Final Test $randomSuffix"
    description = "A comfortable 2-bedroom apartment in the city center with amazing amenities"
    city = $existingCityId
    price = 1500
    amenities = @("WiFi", "Parking", "Kitchen", "AC", "Swimming Pool")
    availability = @("2025-06-22", "2025-06-23", "2025-06-24", "2025-06-25")
}

try {    $accommodationResponse = Invoke-RestMethod -Uri "$baseUrl/accommodations" -Method POST -Body ($accommodationData | ConvertTo-Json) -Headers $headers
    # Store ID for potential future use
    $script:accommodationId = $accommodationResponse._id
    Write-TestResult -testName "Create Accommodation" -passed $true
} catch {
    Write-TestResult -testName "Create Accommodation" -passed $false -message $_.Exception.Message
}

# 5. Get landlord dashboard overview
Write-Host "`n3. LANDLORD DASHBOARD" -ForegroundColor Yellow
try {    Invoke-RestMethod -Uri "$baseUrl/accommodations/landlord/dashboard" -Method GET -Headers $headers | Out-Null
    Write-TestResult -testName "Get Dashboard Overview" -passed $true
} catch {
    Write-TestResult -testName "Get Dashboard Overview" -passed $false -message $_.Exception.Message
}

# 6. Get landlord accommodations
try {    Invoke-RestMethod -Uri "$baseUrl/accommodations/landlord" -Method GET -Headers $headers | Out-Null
    Write-TestResult -testName "Get Landlord Accommodations" -passed $true
} catch {
    Write-TestResult -testName "Get Landlord Accommodations" -passed $false -message $_.Exception.Message
}

# 7. Get landlord profile
Write-Host "`n4. LANDLORD PROFILE AND STATISTICS" -ForegroundColor Yellow
try {    Invoke-RestMethod -Uri "$baseUrl/users/landlord/profile" -Method GET -Headers $headers | Out-Null
    Write-TestResult -testName "Get Landlord Profile" -passed $true
} catch {
    Write-TestResult -testName "Get Landlord Profile" -passed $false -message $_.Exception.Message
}

# 8. Update landlord profile
$updateProfileData = @{
    name = "Updated Landlord Name"
    phone = "+9876543210"
}

try {    Invoke-RestMethod -Uri "$baseUrl/users/profile" -Method PATCH -Body ($updateProfileData | ConvertTo-Json) -Headers $headers | Out-Null
    Write-TestResult -testName "Update Landlord Profile" -passed $true
} catch {
    Write-TestResult -testName "Update Landlord Profile" -passed $false -message $_.Exception.Message
}

# 9. Get landlord statistics
try {    Invoke-RestMethod -Uri "$baseUrl/users/landlord/statistics" -Method GET -Headers $headers | Out-Null
    Write-TestResult -testName "Get Landlord Statistics" -passed $true
} catch {
    Write-TestResult -testName "Get Landlord Statistics" -passed $false -message $_.Exception.Message
}

# 10. Get landlord revenue
try {    Invoke-RestMethod -Uri "$baseUrl/users/landlord/revenue" -Method GET -Headers $headers | Out-Null
    Write-TestResult -testName "Get Landlord Revenue" -passed $true
} catch {
    Write-TestResult -testName "Get Landlord Revenue" -passed $false -message $_.Exception.Message
}

# 11. Get landlord bookings
try {    Invoke-RestMethod -Uri "$baseUrl/users/landlord/bookings" -Method GET -Headers $headers | Out-Null
    Write-TestResult -testName "Get Landlord Bookings" -passed $true
} catch {
    Write-TestResult -testName "Get Landlord Bookings" -passed $false -message $_.Exception.Message
}

# 12. Update FCM token (for notifications)
Write-Host "`n5. NOTIFICATIONS AND SETTINGS" -ForegroundColor Yellow
$fcmTokenData = @{
    fcmToken = "test_fcm_token_$randomSuffix"
}

try {    Invoke-RestMethod -Uri "$baseUrl/users/fcm-token" -Method POST -Body ($fcmTokenData | ConvertTo-Json) -Headers $headers | Out-Null
    Write-TestResult -testName "Update FCM Token" -passed $true
} catch {
    Write-TestResult -testName "Update FCM Token" -passed $false -message $_.Exception.Message
}

# 13. Change password
$changePasswordData = @{
    oldPassword = $registerData.password
    newPassword = "NewTest123!@#"
}

try {    Invoke-RestMethod -Uri "$baseUrl/users/change-password" -Method PUT -Body ($changePasswordData | ConvertTo-Json) -Headers $headers | Out-Null
    Write-TestResult -testName "Change Password" -passed $true
} catch {
    Write-TestResult -testName "Change Password" -passed $false -message $_.Exception.Message
}

# 14. Login with new password
$loginData = @{
    email = $registerData.email
    password = $changePasswordData.newPassword
}

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
    $token = $loginResponse.access_token
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    Write-TestResult -testName "Login with New Password" -passed $true
} catch {
    Write-TestResult -testName "Login with New Password" -passed $false -message $_.Exception.Message
}

# Calculate success rate
$successRate = if ($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100, 1) } else { 0 }

Write-Host "`n=== FINAL TEST SUMMARY ===" -ForegroundColor Green
Write-Host "Total Tests: $totalTests" -ForegroundColor Cyan
Write-Host "Passed Tests: $passedTests" -ForegroundColor Green
Write-Host "Failed Tests: $($totalTests - $passedTests)" -ForegroundColor Red
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -gt 90) { "Green" } elseif ($successRate -gt 70) { "Yellow" } else { "Red" })

if ($successRate -eq 100) {
    Write-Host "`n🎉 PERFECT: All landlord dashboard functionality is working perfectly!" -ForegroundColor Green
} elseif ($successRate -gt 90) {
    Write-Host "`n🎉 EXCELLENT: Landlord dashboard functionality is working very well!" -ForegroundColor Green
} elseif ($successRate -gt 70) {
    Write-Host "`n👍 GOOD: Most landlord features are working correctly!" -ForegroundColor Yellow
} else {
    Write-Host "`n⚠️ NEEDS WORK: Several landlord features still need fixing!" -ForegroundColor Red
}

Write-Host "`nDetailed Test Results:" -ForegroundColor Cyan
foreach ($result in $testResults) {
    $statusColor = if ($result.Passed) { "Green" } else { "Red" }
    $statusSymbol = if ($result.Passed) { "✅" } else { "❌" }
    Write-Host "$statusSymbol $($result.TestName)" -ForegroundColor $statusColor
    if (-not $result.Passed -and $result.Message) {
        Write-Host "   Error: $($result.Message)" -ForegroundColor Red
    }
}

Write-Host "`nTest Completed at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
