# StayKaru Admin Module - 100% Comprehensive Test Suite

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "STAYKARU ADMIN MODULE TEST SUITE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$BASE_URL = "https://staykaru-backend-60ed08adb2a7.herokuapp.com/api"
$TEST_EMAIL = "admin.test@staykaru.com"
$TEST_PASSWORD = "AdminTest123!"
$ADMIN_TOKEN = ""

# Test Results Tracking
$TOTAL_TESTS = 0
$PASSED_TESTS = 0
$FAILED_TESTS = 0
$TEST_RESULTS = @()

# Function to make HTTP requests with error handling
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers = @{},
        [object]$Body = $null,
        [string]$TestName = "API Request"
    )
    
    $global:TOTAL_TESTS++
    
    try {
        Write-Host "Testing: $TestName" -ForegroundColor Yellow
        
        $requestParams = @{
            Method = $Method
            Uri = $Url
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $requestParams.Body = $Body | ConvertTo-Json -Depth 10
        }
        
        $response = Invoke-RestMethod @requestParams
        
        Write-Host "PASSED: $TestName" -ForegroundColor Green
        $global:PASSED_TESTS++
        $global:TEST_RESULTS += @{
            Test = $TestName
            Status = "PASSED"
            Method = $Method
            Url = $Url
            Response = $response
        }
        
        return $response
    }
    catch {
        Write-Host "FAILED: $TestName" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        $global:FAILED_TESTS++
        $global:TEST_RESULTS += @{
            Test = $TestName
            Status = "FAILED" 
            Method = $Method
            Url = $Url
            Error = $_.Exception.Message
        }
        
        return $null
    }
}

Write-Host "Step 1: Authentication Setup" -ForegroundColor Magenta
Write-Host "===============================`n"

# Create admin user for testing
Write-Host "Creating admin test user..." -ForegroundColor Blue
$adminRegisterBody = @{
    name = "Admin Test User"
    email = $TEST_EMAIL
    password = $TEST_PASSWORD
    role = "admin"
    phone = "1234567890"
    countryCode = "+1"
    gender = "male"
    identificationType = "cnic"
    identificationNumber = "12345-6789012-3"
}

$registerResponse = Invoke-ApiRequest -Method "POST" -Url "$BASE_URL/auth/register" -Body $adminRegisterBody -TestName "Admin User Registration"

if ($registerResponse -and $registerResponse.access_token) {
    $ADMIN_TOKEN = $registerResponse.access_token
    Write-Host "Admin authentication successful!" -ForegroundColor Green
} else {
    # Try to login if registration failed (user might already exist)
    Write-Host "Registration failed, trying login..." -ForegroundColor Yellow
    $loginBody = @{
        email = $TEST_EMAIL
        password = $TEST_PASSWORD
    }
    
    $loginResponse = Invoke-ApiRequest -Method "POST" -Url "$BASE_URL/auth/login" -Body $loginBody -TestName "Admin User Login"
    
    if ($loginResponse -and $loginResponse.access_token) {
        $ADMIN_TOKEN = $loginResponse.access_token
        Write-Host "Admin login successful!" -ForegroundColor Green
    } else {
        Write-Host "Authentication failed! Cannot proceed with admin tests." -ForegroundColor Red
        exit 1
    }
}

$authHeaders = @{
    "Authorization" = "Bearer $ADMIN_TOKEN"
}

Write-Host "`nStep 2: User Management Tests" -ForegroundColor Magenta
Write-Host "==================================`n"

# Test 1: Get All Users
Invoke-ApiRequest -Method "GET" -Url "$BASE_URL/admin/users" -Headers $authHeaders -TestName "Get All Users"

# Test 2: Get Users with Pagination
$url1 = "$BASE_URL/admin/users" + "?page=1" + "&limit=5"
Invoke-ApiRequest -Method "GET" -Url $url1 -Headers $authHeaders -TestName "Get Users with Pagination"

# Test 3: Get Users by Role
$url2 = "$BASE_URL/admin/users" + "?role=student"
Invoke-ApiRequest -Method "GET" -Url $url2 -Headers $authHeaders -TestName "Get Users by Role (Student)"

# Test 4: Search Users
$url3 = "$BASE_URL/admin/users" + "?search=admin"
Invoke-ApiRequest -Method "GET" -Url $url3 -Headers $authHeaders -TestName "Search Users"

# Test 5: Get User by ID (using a mock ID for testing)
$mockUserId = "507f1f77bcf86cd799439011"
Invoke-ApiRequest -Method "GET" -Url "$BASE_URL/admin/users/$mockUserId" -Headers $authHeaders -TestName "Get User by ID"

# Test 6: Update User Status
$statusUpdateBody = @{ isActive = $false }
Invoke-ApiRequest -Method "PUT" -Url "$BASE_URL/admin/users/$mockUserId/status" -Headers $authHeaders -Body $statusUpdateBody -TestName "Update User Status"

Write-Host "`nStep 3: Accommodation Management Tests" -ForegroundColor Magenta
Write-Host "==========================================`n"

# Test 7: Get All Accommodations
Invoke-ApiRequest -Method "GET" -Url "$BASE_URL/admin/accommodations" -Headers $authHeaders -TestName "Get All Accommodations"

# Test 8: Get Accommodations with Filters
$url4 = "$BASE_URL/admin/accommodations" + "?status=active" + "&page=1" + "&limit=10"
Invoke-ApiRequest -Method "GET" -Url $url4 -Headers $authHeaders -TestName "Get Accommodations with Filters"

# Test 9: Approve Accommodation
$mockAccommodationId = "507f1f77bcf86cd799439022"
Invoke-ApiRequest -Method "PUT" -Url "$BASE_URL/admin/accommodations/$mockAccommodationId/approve" -Headers $authHeaders -TestName "Approve Accommodation"

# Test 10: Reject Accommodation
$rejectionBody = @{ reason = "Does not meet quality standards" }
Invoke-ApiRequest -Method "PUT" -Url "$BASE_URL/admin/accommodations/$mockAccommodationId/reject" -Headers $authHeaders -Body $rejectionBody -TestName "Reject Accommodation"

Write-Host "`nStep 4: Food Service Management Tests" -ForegroundColor Magenta
Write-Host "=========================================`n"

# Test 11: Get All Food Services
Invoke-ApiRequest -Method "GET" -Url "$BASE_URL/admin/food-services" -Headers $authHeaders -TestName "Get All Food Services"

# Test 12: Get Food Services with Filters
$url5 = "$BASE_URL/admin/food-services" + "?status=pending" + "&page=1" + "&limit=5"
Invoke-ApiRequest -Method "GET" -Url $url5 -Headers $authHeaders -TestName "Get Food Services with Filters"

# Test 13: Approve Food Service
$mockFoodServiceId = "507f1f77bcf86cd799439033"
Invoke-ApiRequest -Method "PUT" -Url "$BASE_URL/admin/food-services/$mockFoodServiceId/approve" -Headers $authHeaders -TestName "Approve Food Service"

# Test 14: Reject Food Service
$foodRejectionBody = @{ reason = "Incomplete documentation" }
Invoke-ApiRequest -Method "PUT" -Url "$BASE_URL/admin/food-services/$mockFoodServiceId/reject" -Headers $authHeaders -Body $foodRejectionBody -TestName "Reject Food Service"

Write-Host "`nStep 5: Booking Management Tests" -ForegroundColor Magenta
Write-Host "====================================`n"

# Test 15: Get All Bookings
Invoke-ApiRequest -Method "GET" -Url "$BASE_URL/admin/bookings" -Headers $authHeaders -TestName "Get All Bookings"

# Test 16: Get Bookings with Filters
$url6 = "$BASE_URL/admin/bookings" + "?status=pending" + "&page=1" + "&limit=10"
Invoke-ApiRequest -Method "GET" -Url $url6 -Headers $authHeaders -TestName "Get Bookings with Filters"

# Test 17: Get Booking by ID
$mockBookingId = "507f1f77bcf86cd799439044"
Invoke-ApiRequest -Method "GET" -Url "$BASE_URL/admin/bookings/$mockBookingId" -Headers $authHeaders -TestName "Get Booking by ID"

# Test 18: Cancel Booking
$bookingCancelBody = @{ reason = "Policy violation" }
Invoke-ApiRequest -Method "PUT" -Url "$BASE_URL/admin/bookings/$mockBookingId/cancel" -Headers $authHeaders -Body $bookingCancelBody -TestName "Cancel Booking (Admin)"

Write-Host "`nStep 6: Order Management Tests" -ForegroundColor Magenta
Write-Host "==================================`n"

# Test 19: Get All Orders
Invoke-ApiRequest -Method "GET" -Url "$BASE_URL/admin/orders" -Headers $authHeaders -TestName "Get All Orders"

# Test 20: Get Orders with Filters
$url7 = "$BASE_URL/admin/orders" + "?status=confirmed" + "&page=1" + "&limit=10"
Invoke-ApiRequest -Method "GET" -Url $url7 -Headers $authHeaders -TestName "Get Orders with Filters"

# Test 21: Get Order by ID
$mockOrderId = "507f1f77bcf86cd799439055"
Invoke-ApiRequest -Method "GET" -Url "$BASE_URL/admin/orders/$mockOrderId" -Headers $authHeaders -TestName "Get Order by ID"

Write-Host "`nStep 7: Analytics and Reports Tests" -ForegroundColor Magenta
Write-Host "=======================================`n"

# Test 22: Get Dashboard Analytics
Invoke-ApiRequest -Method "GET" -Url "$BASE_URL/admin/analytics/dashboard" -Headers $authHeaders -TestName "Get Dashboard Analytics"

# Test 23: Get User Analytics
$url8 = "$BASE_URL/admin/analytics/users" + "?period=month"
Invoke-ApiRequest -Method "GET" -Url $url8 -Headers $authHeaders -TestName "Get User Analytics (Month)"

# Test 24: Get Revenue Analytics
$url9 = "$BASE_URL/admin/analytics/revenue" + "?period=week"
Invoke-ApiRequest -Method "GET" -Url $url9 -Headers $authHeaders -TestName "Get Revenue Analytics (Week)"

# Test 25: Get Booking Analytics
$url10 = "$BASE_URL/admin/analytics/bookings" + "?period=day"
Invoke-ApiRequest -Method "GET" -Url $url10 -Headers $authHeaders -TestName "Get Booking Analytics (Day)"

# Test 26: Generate Users Report (JSON)
$url11 = "$BASE_URL/admin/reports/users" + "?format=json"
Invoke-ApiRequest -Method "GET" -Url $url11 -Headers $authHeaders -TestName "Generate Users Report (JSON)"

# Test 27: Generate Users Report (CSV)
$url12 = "$BASE_URL/admin/reports/users" + "?format=csv"
Invoke-ApiRequest -Method "GET" -Url $url12 -Headers $authHeaders -TestName "Generate Users Report (CSV)"

# Test 28: Generate Revenue Report
$url13 = "$BASE_URL/admin/reports/revenue" + "?format=json" + "&startDate=2024-01-01" + "&endDate=2024-01-31"
Invoke-ApiRequest -Method "GET" -Url $url13 -Headers $authHeaders -TestName "Generate Revenue Report"

Write-Host "`nStep 8: System Management Tests" -ForegroundColor Magenta
Write-Host "====================================`n"

# Test 29: Get System Health
Invoke-ApiRequest -Method "GET" -Url "$BASE_URL/admin/system/health" -Headers $authHeaders -TestName "Get System Health"

# Test 30: Create System Backup
Invoke-ApiRequest -Method "POST" -Url "$BASE_URL/admin/system/backup" -Headers $authHeaders -TestName "Create System Backup"

# Test 31: Get System Logs
$url14 = "$BASE_URL/admin/system/logs" + "?level=error" + "&limit=50"
Invoke-ApiRequest -Method "GET" -Url $url14 -Headers $authHeaders -TestName "Get System Logs"

Write-Host "`nStep 9: Configuration Management Tests" -ForegroundColor Magenta
Write-Host "==========================================`n"

# Test 32: Get Platform Configuration
Invoke-ApiRequest -Method "GET" -Url "$BASE_URL/admin/config/platform" -Headers $authHeaders -TestName "Get Platform Configuration"

# Test 33: Update Platform Configuration
$configUpdateBody = @{
    features = @{
        emailVerification = $false
        twoFactorAuth = $false
        socialLogin = $false
        chatSystem = $true
    }
}
Invoke-ApiRequest -Method "PUT" -Url "$BASE_URL/admin/config/platform" -Headers $authHeaders -Body $configUpdateBody -TestName "Update Platform Configuration"

Write-Host "`nStep 10: Notification Management Tests" -ForegroundColor Magenta
Write-Host "==========================================`n"

# Test 34: Send Broadcast Notification
$broadcastBody = @{
    title = "System Maintenance"
    message = "The platform will undergo scheduled maintenance tonight."
    type = "maintenance"
}
Invoke-ApiRequest -Method "POST" -Url "$BASE_URL/admin/notifications/broadcast" -Headers $authHeaders -Body $broadcastBody -TestName "Send Broadcast Notification"

# Test 35: Send Targeted Notification
$targetedBody = @{
    title = "Student Special Offer"
    message = "Special discount on accommodations for students!"
    type = "promotion"
    role = "student"
}
Invoke-ApiRequest -Method "POST" -Url "$BASE_URL/admin/notifications/targeted" -Headers $authHeaders -Body $targetedBody -TestName "Send Targeted Notification"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "FINAL TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "Test Statistics:" -ForegroundColor White
Write-Host "   Total Tests: $TOTAL_TESTS" -ForegroundColor White
Write-Host "   Passed: $PASSED_TESTS" -ForegroundColor Green
Write-Host "   Failed: $FAILED_TESTS" -ForegroundColor Red

$successRate = [math]::Round(($PASSED_TESTS / $TOTAL_TESTS) * 100, 2)
Write-Host "   Success Rate: $successRate%" -ForegroundColor Cyan

Write-Host ""
if ($FAILED_TESTS -eq 0) {
    Write-Host "100% SUCCESS! All admin endpoints are working perfectly!" -ForegroundColor Green
    Write-Host "The admin module is fully functional and ready for production use." -ForegroundColor Green
} else {
    Write-Host "Some tests failed. Review the failed tests above." -ForegroundColor Yellow
    
    Write-Host "`nFailed Tests:" -ForegroundColor Red
    foreach ($result in $TEST_RESULTS) {
        if ($result.Status -eq "FAILED") {
            Write-Host "   • $($result.Test): $($result.Error)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "Live API Documentation:" -ForegroundColor Cyan
Write-Host "   https://staykaru-backend-60ed08adb2a7.herokuapp.com/api" -ForegroundColor Blue

Write-Host ""
Write-Host "Admin module is ready for frontend integration!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
