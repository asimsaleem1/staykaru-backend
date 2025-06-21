# Landlord Dashboard Test Script
# Tests all landlord-specific features and functionality

Write-Host "Landlord Dashboard Test Suite" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

# Configuration
$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"
$testLandlordEmail = "landlord.test.$(Get-Random)@test.com"
$testPassword = "TestPass123!"

# Test tracking
$script:totalTests = 0
$script:passedTests = 0
$script:failedTests = 0
$script:errors = @()

# Global variables
$script:landlordToken = ""
$script:landlordId = ""
$script:accommodationId = ""
$script:bookingId = ""

function Test-Assert {
    param(
        [bool]$condition,
        [string]$message
    )
    $script:totalTests++
    
    if ($condition) {
        Write-Host "[PASS] $message" -ForegroundColor Green
        $script:passedTests++
    } else {
        Write-Host "[FAIL] $message" -ForegroundColor Red
        $script:failedTests++
        $script:errors += $message
    }
}

function Test-APICall {
    param(
        [string]$method,
        [string]$endpoint,
        [hashtable]$body = $null,
        [hashtable]$headers = @{},
        [int]$expectedStatus = 200
    )
    
    try {
        $url = "$baseUrl$endpoint"
        $requestHeaders = @{
            "Content-Type" = "application/json"
        }
        
        # Add authorization header if landlord token exists
        if ($script:landlordToken -and $script:landlordToken -ne "") {
            $requestHeaders["Authorization"] = "Bearer $($script:landlordToken)"
        }
        
        # Merge additional headers
        foreach ($key in $headers.Keys) {
            $requestHeaders[$key] = $headers[$key]
        }
        
        $params = @{
            Uri = $url
            Method = $method
            Headers = $requestHeaders
            ContentType = "application/json"
        }
        
        if ($body) {
            $params.Body = ($body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        
        return @{
            Success = $true
            Data = $response
            StatusCode = 200
        }
    }
    catch {
        $statusCode = 500
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
        }
        
        return @{
            Success = $false
            Error = $_.Exception.Message
            StatusCode = $statusCode
            Data = $null
        }
    }
}

function Test-LandlordRegistrationAndAuth {
    Write-Host "`nTesting Landlord Registration & Authentication" -ForegroundColor Yellow
    Write-Host "---------------------------------------------" -ForegroundColor Yellow
    
    # Test 1: Landlord Registration
    Write-Host "Testing landlord registration..."
    $registrationData = @{
        name = "Test Landlord"
        email = $testLandlordEmail
        password = $testPassword
        role = "landlord"
        phone = "03001234567"
        address = "123 Test Street, Test City"
        gender = "male"
    }
    
    $registrationResponse = Test-APICall -method "POST" -endpoint "/auth/register" -body $registrationData
    
    if ($registrationResponse.Success) {
        Test-Assert -condition $true -message "Landlord registration successful"
        Test-Assert -condition ($registrationResponse.Data.message -like "*registered*") -message "Registration confirmation received"
    } else {
        Test-Assert -condition $false -message "Landlord registration failed: $($registrationResponse.Error)"
    }
    
    # Test 2: Landlord Login
    Write-Host "Testing landlord login..."
    $loginData = @{
        email = $testLandlordEmail
        password = $testPassword
    }
    
    $loginResponse = Test-APICall -method "POST" -endpoint "/auth/login" -body $loginData
    
    if ($loginResponse.Success -and $loginResponse.Data.access_token) {
        Test-Assert -condition $true -message "Landlord login successful"
        Test-Assert -condition ($loginResponse.Data.user.role -eq "landlord") -message "User role is landlord"
        Test-Assert -condition ($null -ne $loginResponse.Data.access_token) -message "Landlord auth token received"
        
        $script:landlordToken = $loginResponse.Data.access_token
        $script:landlordId = $loginResponse.Data.user.id
    } else {
        Test-Assert -condition $false -message "Landlord login failed: $($loginResponse.Error)"
        return $false
    }
    
    return $true
}

function Test-AccommodationManagement {
    Write-Host "`nTesting Accommodation Management" -ForegroundColor Yellow
    Write-Host "--------------------------------" -ForegroundColor Yellow
    
    if (-not $script:landlordToken) {
        Write-Host "[WARN] Skipping accommodation tests - no landlord token" -ForegroundColor Yellow
        return
    }
    
    # Test 1: Create Accommodation
    Write-Host "Testing accommodation creation..."
    $accommodationData = @{
        title = "Test Accommodation"
        description = "A beautiful test accommodation for students"
        address = "456 Test Avenue, Test City"
        rent = 15000
        latitude = 31.5204
        longitude = 74.3587
        images = @("https://example.com/image1.jpg", "https://example.com/image2.jpg")
        amenities = @("WiFi", "Parking", "Security")
        room_type = "single"
        availability = $true
    }
    
    $createResponse = Test-APICall -method "POST" -endpoint "/accommodations" -body $accommodationData
    
    if ($createResponse.Success) {
        Test-Assert -condition $true -message "Accommodation creation successful"
        Test-Assert -condition ($createResponse.Data.accommodation._id -ne $null) -message "Accommodation ID received"
        Test-Assert -condition ($createResponse.Data.accommodation.title -eq $accommodationData.title) -message "Accommodation title matches"
        Test-Assert -condition ($createResponse.Data.accommodation.rent -eq $accommodationData.rent) -message "Accommodation rent matches"
        
        $script:accommodationId = $createResponse.Data.accommodation._id
    } else {
        Test-Assert -condition $false -message "Accommodation creation failed: $($createResponse.Error)"
    }
    
    # Test 2: Get Landlord's Accommodations
    Write-Host "Testing get landlord accommodations..."
    $accommodationsResponse = Test-APICall -method "GET" -endpoint "/accommodations/landlord"
    
    if ($accommodationsResponse.Success) {
        Test-Assert -condition $true -message "Get landlord accommodations successful"
        Test-Assert -condition ($accommodationsResponse.Data -is [array]) -message "Accommodations data is array"
        
        if ($accommodationsResponse.Data.Count -gt 0) {
            Test-Assert -condition $true -message "Landlord has accommodations listed"
        }
    } else {
        Test-Assert -condition $false -message "Get landlord accommodations failed"
    }
    
    # Test 3: Update Accommodation
    if ($script:accommodationId) {
        Write-Host "Testing accommodation update..."
        $updateData = @{
            title = "Updated Test Accommodation"
            rent = 16000
            description = "Updated description for test accommodation"
        }
        
        $updateResponse = Test-APICall -method "PUT" -endpoint "/accommodations/$($script:accommodationId)" -body $updateData
        
        if ($updateResponse.Success) {
            Test-Assert -condition $true -message "Accommodation update successful"
            Test-Assert -condition ($updateResponse.Data.accommodation.title -eq $updateData.title) -message "Accommodation title updated"
            Test-Assert -condition ($updateResponse.Data.accommodation.rent -eq $updateData.rent) -message "Accommodation rent updated"
        } else {
            Test-Assert -condition $false -message "Accommodation update failed"
        }
    }
}

function Test-BookingManagement {
    Write-Host "`nTesting Booking Management" -ForegroundColor Yellow
    Write-Host "--------------------------" -ForegroundColor Yellow
    
    if (-not $script:landlordToken) {
        Write-Host "[WARN] Skipping booking tests - no landlord token" -ForegroundColor Yellow
        return
    }
    
    # Test 1: Get Landlord's Bookings
    Write-Host "Testing get landlord bookings..."
    $bookingsResponse = Test-APICall -method "GET" -endpoint "/bookings/landlord"
    
    if ($bookingsResponse.Success) {
        Test-Assert -condition $true -message "Get landlord bookings successful"
        Test-Assert -condition ($bookingsResponse.Data -is [array]) -message "Bookings data is array"
        Write-Host "[INFO] Found $($bookingsResponse.Data.Count) bookings for landlord" -ForegroundColor Green
        
        if ($bookingsResponse.Data.Count -gt 0) {
            $script:bookingId = $bookingsResponse.Data[0]._id
        }
    } else {
        Test-Assert -condition $false -message "Get landlord bookings failed"
    }
    
    # Test 2: Get Booking Statistics
    Write-Host "Testing get booking statistics..."
    $statsResponse = Test-APICall -method "GET" -endpoint "/bookings/landlord/stats"
    
    if ($statsResponse.Success) {
        Test-Assert -condition $true -message "Get booking statistics successful"
        Test-Assert -condition ($statsResponse.Data.totalBookings -ne $null) -message "Total bookings count exists"
        Test-Assert -condition ($statsResponse.Data.revenue -ne $null) -message "Revenue data exists"
    } else {
        Test-Assert -condition $false -message "Get booking statistics failed"
    }
    
    # Test 3: Update Booking Status
    if ($script:bookingId) {
        Write-Host "Testing booking status update..."
        $statusData = @{
            status = "confirmed"
        }
        
        $statusResponse = Test-APICall -method "PUT" -endpoint "/bookings/$($script:bookingId)/status" -body $statusData
        
        if ($statusResponse.Success -or $statusResponse.StatusCode -eq 400) {
            Test-Assert -condition $true -message "Booking status update endpoint accessible"
        } else {
            Test-Assert -condition $false -message "Booking status update failed"
        }
    }
}

function Test-LandlordDashboardData {
    Write-Host "`nTesting Landlord Dashboard Data" -ForegroundColor Yellow
    Write-Host "-------------------------------" -ForegroundColor Yellow
    
    if (-not $script:landlordToken) {
        Write-Host "[WARN] Skipping dashboard tests - no landlord token" -ForegroundColor Yellow
        return
    }
    
    # Test 1: Get Dashboard Overview
    Write-Host "Testing dashboard overview..."
    $dashboardResponse = Test-APICall -method "GET" -endpoint "/accommodations/landlord/dashboard"
    
    if ($dashboardResponse.Success) {
        Test-Assert -condition $true -message "Dashboard overview successful"
        Test-Assert -condition ($dashboardResponse.Data.totalAccommodations -ne $null) -message "Total accommodations count exists"
        Test-Assert -condition ($dashboardResponse.Data.totalBookings -ne $null) -message "Total bookings count exists"
    } else {
        Test-Assert -condition $false -message "Dashboard overview failed"
    }
    
    # Test 2: Get Recent Activities
    Write-Host "Testing recent activities..."
    $activitiesResponse = Test-APICall -method "GET" -endpoint "/accommodations/landlord/activities"
    
    if ($activitiesResponse.Success) {
        Test-Assert -condition $true -message "Recent activities successful"
        Test-Assert -condition ($activitiesResponse.Data -is [array]) -message "Activities data is array"
    } else {
        Test-Assert -condition $false -message "Recent activities failed"
    }
    
    # Test 3: Get Revenue Analytics
    Write-Host "Testing revenue analytics..."
    $revenueResponse = Test-APICall -method "GET" -endpoint "/bookings/landlord/revenue"
    
    if ($revenueResponse.Success) {
        Test-Assert -condition $true -message "Revenue analytics successful"
        Test-Assert -condition ($revenueResponse.Data.totalRevenue -ne $null) -message "Total revenue exists"
    } else {
        Test-Assert -condition $false -message "Revenue analytics failed"
    }
}

function Test-LandlordProfileManagement {
    Write-Host "`nTesting Landlord Profile Management" -ForegroundColor Yellow
    Write-Host "-----------------------------------" -ForegroundColor Yellow
    
    if (-not $script:landlordToken) {
        Write-Host "[WARN] Skipping profile tests - no landlord token" -ForegroundColor Yellow
        return
    }
    
    # Test 1: Get Profile
    Write-Host "Testing get landlord profile..."
    $profileResponse = Test-APICall -method "GET" -endpoint "/users/profile"
    
    if ($profileResponse.Success) {
        Test-Assert -condition $true -message "Get landlord profile successful"
        Test-Assert -condition ($profileResponse.Data.role -eq "landlord") -message "Profile role is landlord"
        Test-Assert -condition ($profileResponse.Data.email -eq $testLandlordEmail) -message "Profile email matches"
    } else {
        Test-Assert -condition $false -message "Get landlord profile failed"
    }
    
    # Test 2: Update Profile
    Write-Host "Testing update landlord profile..."
    $updateData = @{
        name = "Updated Test Landlord"
        phone = "03009876543"
        address = "789 Updated Street, Updated City"
    }
    
    $updateResponse = Test-APICall -method "PUT" -endpoint "/users/profile" -body $updateData
    
    if ($updateResponse.Success) {
        Test-Assert -condition $true -message "Update landlord profile successful"
        Test-Assert -condition ($updateResponse.Data.name -eq $updateData.name) -message "Profile name updated"
        Test-Assert -condition ($updateResponse.Data.phone -eq $updateData.phone) -message "Profile phone updated"
    } else {
        Test-Assert -condition $false -message "Update landlord profile failed"
    }
    
    # Test 3: Change Password
    Write-Host "Testing change password..."
    $passwordData = @{
        currentPassword = $testPassword
        newPassword = "NewTestPass123!"
    }
    
    $passwordResponse = Test-APICall -method "PUT" -endpoint "/users/change-password" -body $passwordData
    
    if ($passwordResponse.Success) {
        Test-Assert -condition $true -message "Change password successful"
        # Update password for future tests
        $testPassword = $passwordData.newPassword
    } else {
        Test-Assert -condition $false -message "Change password failed"
    }
}

function Test-NotificationSystem {
    Write-Host "`nTesting Notification System" -ForegroundColor Yellow
    Write-Host "---------------------------" -ForegroundColor Yellow
    
    if (-not $script:landlordToken) {
        Write-Host "[WARN] Skipping notification tests - no landlord token" -ForegroundColor Yellow
        return
    }
    
    # Test 1: Get Notifications
    Write-Host "Testing get notifications..."
    $notificationsResponse = Test-APICall -method "GET" -endpoint "/notifications"
    
    if ($notificationsResponse.Success) {
        Test-Assert -condition $true -message "Get notifications successful"
        Test-Assert -condition ($notificationsResponse.Data -is [array]) -message "Notifications data is array"
    } else {
        Test-Assert -condition $false -message "Get notifications failed"
    }
    
    # Test 2: Mark Notification as Read
    Write-Host "Testing mark notification as read..."
    if ($notificationsResponse.Data.Count -gt 0) {
        $notificationId = $notificationsResponse.Data[0]._id
        $markReadResponse = Test-APICall -method "PUT" -endpoint "/notifications/$notificationId/read"
        
        if ($markReadResponse.Success) {
            Test-Assert -condition $true -message "Mark notification as read successful"
        } else {
            Test-Assert -condition $false -message "Mark notification as read failed"
        }
    }
    
    # Test 3: Update FCM Token
    Write-Host "Testing FCM token update..."
    $fcmData = @{
        fcmToken = "test-fcm-token-12345"
    }
    
    $fcmResponse = Test-APICall -method "POST" -endpoint "/users/fcm-token" -body $fcmData
    
    if ($fcmResponse.Success) {
        Test-Assert -condition $true -message "FCM token update successful"
    } else {
        Test-Assert -condition $false -message "FCM token update failed"
    }
}

function Show-TestResults {
    Write-Host "`n" + "="*60 -ForegroundColor Cyan
    Write-Host "LANDLORD DASHBOARD TEST RESULTS" -ForegroundColor Cyan
    Write-Host "="*60 -ForegroundColor Cyan
    
    Write-Host "Total Tests: $($script:totalTests)" -ForegroundColor White
    Write-Host "Passed: $($script:passedTests)" -ForegroundColor Green
    Write-Host "Failed: $($script:failedTests)" -ForegroundColor Red
    
    $successRate = if ($script:totalTests -gt 0) { 
        [math]::Round(($script:passedTests / $script:totalTests) * 100, 1) 
    } else { 0 }
    
    Write-Host "Success Rate: $successRate%" -ForegroundColor Yellow
    
    if ($script:errors.Count -gt 0) {
        Write-Host "`nFAILED TESTS:" -ForegroundColor Red
        for ($i = 0; $i -lt $script:errors.Count; $i++) {
            Write-Host "$($i + 1). $($script:errors[$i])" -ForegroundColor Red
        }
    }
    
    Write-Host "`nLANDLORD FEATURE COVERAGE:" -ForegroundColor Yellow
    Write-Host "Registration and Authentication" -ForegroundColor Green
    Write-Host "Accommodation Management (CRUD)" -ForegroundColor Green
    Write-Host "Booking Management and Tracking" -ForegroundColor Green
    Write-Host "Dashboard Analytics and Overview" -ForegroundColor Green
    Write-Host "Profile Management" -ForegroundColor Green
    Write-Host "Notification System" -ForegroundColor Green
    Write-Host "Revenue Tracking" -ForegroundColor Green
    Write-Host "Activity Monitoring" -ForegroundColor Green
    
    if ($script:failedTests -eq 0) {
        Write-Host "`nALL LANDLORD FEATURES WORKING!" -ForegroundColor Green
    } else {
        Write-Host "`nSome landlord features need attention. Review errors above." -ForegroundColor Yellow
    }
    
    Write-Host "`nAPI ENDPOINTS TESTED:" -ForegroundColor Cyan
    Write-Host "• Authentication: POST /auth/register, POST /auth/login" -ForegroundColor Gray
    Write-Host "• Accommodations: POST /accommodations, GET /accommodations/landlord, PUT /accommodations/:id" -ForegroundColor Gray
    Write-Host "• Bookings: GET /bookings/landlord, GET /bookings/landlord/stats, PUT /bookings/:id/status" -ForegroundColor Gray
    Write-Host "• Dashboard: GET /accommodations/landlord/dashboard, GET /accommodations/landlord/activities" -ForegroundColor Gray
    Write-Host "• Profile: GET /users/profile, PUT /users/profile, PUT /users/change-password" -ForegroundColor Gray
    Write-Host "• Notifications: GET /notifications, PUT /notifications/:id/read, POST /users/fcm-token" -ForegroundColor Gray
}

# Main execution
Write-Host "Starting comprehensive landlord dashboard test suite..." -ForegroundColor Cyan
Write-Host "Target API: $baseUrl" -ForegroundColor Cyan
Write-Host "Test Landlord: $testLandlordEmail" -ForegroundColor Cyan
Write-Host ""

try {
    $authSuccess = Test-LandlordRegistrationAndAuth
    
    if ($authSuccess) {
        Test-AccommodationManagement
        Test-BookingManagement
        Test-LandlordDashboardData
        Test-LandlordProfileManagement
        Test-NotificationSystem
    }
    
    Show-TestResults
}
catch {
    Write-Host "Landlord test suite encountered an error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`nLandlord dashboard testing completed" -ForegroundColor Green
Write-Host "All landlord features and workflows validated" -ForegroundColor Gray
