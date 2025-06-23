# 🎓 StayKaru Backend - Comprehensive Student Module Testing
# This script tests all student-specific endpoints with real data scenarios
# Author: GitHub Copilot Assistant
# Date: $(Get-Date -Format "yyyy-MM-dd")

param(
    [string]$BaseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com/api"
)

# Colors for output
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"
$Magenta = "Magenta"

# Test results storage
$TestResults = @()
$SuccessCount = 0
$FailureCount = 0

# Function to add test result
function Add-TestResult {
    param($Module, $TestName, $Endpoint, $Success, $StatusCode, $Details, $ResponseTime = 0)
    
    $global:TestResults += [PSCustomObject]@{
        Module = $Module
        TestName = $TestName
        Endpoint = $Endpoint
        Success = $Success
        StatusCode = $StatusCode
        Details = $Details
        ResponseTime = $ResponseTime
        Timestamp = Get-Date
    }
    
    if ($Success) {
        $global:SuccessCount++
        Write-Host "✅ $TestName" -ForegroundColor $Green
        Write-Host "   $Details" -ForegroundColor Gray
    } else {
        $global:FailureCount++
        Write-Host "❌ $TestName" -ForegroundColor $Red
        Write-Host "   $Details" -ForegroundColor Yellow
    }
}

# Function to make API requests
function Invoke-ApiRequest {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null,
        [string]$TestName
    )
    
    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        
        $requestParams = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $requestParams.Body = $Body
        }
        
        $response = Invoke-RestMethod @requestParams -ErrorAction Stop
        $stopwatch.Stop()
        
        return @{
            Success = $true
            Data = $response
            StatusCode = 200
            ResponseTime = $stopwatch.ElapsedMilliseconds
        }
    }
    catch {
        $stopwatch.Stop()
        $statusCode = 500
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
        }
        
        return @{
            Success = $false
            Error = $_.Exception.Message
            StatusCode = $statusCode
            ResponseTime = $stopwatch.ElapsedMilliseconds
        }
    }
}

# Function to register a test student
function Register-TestStudent {
    Write-Host "`n🔐 Registering Test Student Account..." -ForegroundColor $Blue
    
    $studentData = @{
        name = "Test Student"
        email = "student.test.$(Get-Random)@example.com"
        password = "StrongPassword123!"
        role = "student"
        phone = "1234567890"
        countryCode = "+1"
        gender = "male"
        dateOfBirth = "1998-05-15"
        address = "123 University Ave, Test City"
        university = "Test University"
        studentId = "STU$(Get-Random -Maximum 99999)"
        emergencyContact = @{
            name = "Emergency Contact"
            phone = "9876543210"
            relationship = "parent"
        }
    } | ConvertTo-Json -Depth 3
    
    $result = Invoke-ApiRequest -Url "$BaseUrl/auth/register" -Method "POST" -Body $studentData -TestName "Student Registration"
    
    if ($result.Success) {
        Add-TestResult -Module "Student" -TestName "Student Registration" -Endpoint "/auth/register" -Success $true -StatusCode 201 -Details "Test student registered successfully" -ResponseTime $result.ResponseTime
        return @{
            Success = $true
            Token = $result.Data.access_token
            User = $result.Data.user
            Headers = @{ "Authorization" = "Bearer $($result.Data.access_token)" }
        }
    } else {
        Add-TestResult -Module "Student" -TestName "Student Registration" -Endpoint "/auth/register" -Success $false -StatusCode $result.StatusCode -Details $result.Error -ResponseTime $result.ResponseTime
        return @{ Success = $false }
    }
}

# Main testing function
function Test-StudentModule {
    Write-Host "🎓 STAYKARU STUDENT MODULE COMPREHENSIVE TESTING" -ForegroundColor $Cyan
    Write-Host "=" * 60 -ForegroundColor $Cyan
    Write-Host "Base URL: $BaseUrl" -ForegroundColor $Gray
    Write-Host "Test Started: $(Get-Date)" -ForegroundColor $Gray
    Write-Host ""
    
    # Step 1: Register and authenticate test student
    $studentAuth = Register-TestStudent
    if (-not $studentAuth.Success) {
        Write-Host "❌ Could not register test student. Exiting..." -ForegroundColor $Red
        return
    }
    
    $studentHeaders = $studentAuth.Headers
    $studentUser = $studentAuth.User
    
    Write-Host "`n📋 Testing with Student: $($studentUser.name) ($($studentUser.email))" -ForegroundColor $Blue
    
    # Step 2: Profile and Authentication Tests
    Write-Host "`n👤 Step 1: Profile & Authentication Tests" -ForegroundColor $Magenta
    Write-Host "=" * 40
    
    # Test get profile
    $profileTest = Invoke-ApiRequest -Url "$BaseUrl/auth/profile" -Headers $studentHeaders -TestName "Get User Profile"
    Add-TestResult -Module "Student" -TestName "Get User Profile" -Endpoint "/auth/profile" -Success $profileTest.Success -StatusCode $profileTest.StatusCode -Details $(if ($profileTest.Success) { "Profile retrieved successfully" } else { $profileTest.Error }) -ResponseTime $profileTest.ResponseTime
    
    # Test detailed profile
    $detailedProfileTest = Invoke-ApiRequest -Url "$BaseUrl/users/profile" -Headers $studentHeaders -TestName "Get Detailed Profile"
    Add-TestResult -Module "Student" -TestName "Get Detailed Profile" -Endpoint "/users/profile" -Success $detailedProfileTest.Success -StatusCode $detailedProfileTest.StatusCode -Details $(if ($detailedProfileTest.Success) { "Detailed profile retrieved successfully" } else { $detailedProfileTest.Error }) -ResponseTime $detailedProfileTest.ResponseTime
    
    # Test dashboard access
    $dashboardTest = Invoke-ApiRequest -Url "$BaseUrl/dashboard" -Headers $studentHeaders -TestName "Get Student Dashboard"
    Add-TestResult -Module "Student" -TestName "Get Student Dashboard" -Endpoint "/dashboard" -Success $dashboardTest.Success -StatusCode $dashboardTest.StatusCode -Details $(if ($dashboardTest.Success) { "Dashboard data retrieved successfully" } else { $dashboardTest.Error }) -ResponseTime $dashboardTest.ResponseTime
    
    # Step 3: Accommodation Discovery Tests
    Write-Host "`n🏠 Step 2: Accommodation Discovery Tests" -ForegroundColor $Magenta
    Write-Host "=" * 40
    
    # Test get all accommodations (public)
    $accommodationsTest = Invoke-ApiRequest -Url "$BaseUrl/accommodations" -TestName "Get All Accommodations"
    Add-TestResult -Module "Student" -TestName "Get All Accommodations" -Endpoint "/accommodations" -Success $accommodationsTest.Success -StatusCode $accommodationsTest.StatusCode -Details $(if ($accommodationsTest.Success) { "Accommodations retrieved successfully ($(($accommodationsTest.Data | Measure-Object).Count) found)" } else { $accommodationsTest.Error }) -ResponseTime $accommodationsTest.ResponseTime
    
    # Test student accommodations endpoint
    $studentAccommodationsTest = Invoke-ApiRequest -Url "$BaseUrl/dashboard/student/accommodations" -Headers $studentHeaders -TestName "Get Student Accommodations"
    Add-TestResult -Module "Student" -TestName "Get Student Accommodations" -Endpoint "/dashboard/student/accommodations" -Success $studentAccommodationsTest.Success -StatusCode $studentAccommodationsTest.StatusCode -Details $(if ($studentAccommodationsTest.Success) { "Student accommodations retrieved successfully" } else { $studentAccommodationsTest.Error }) -ResponseTime $studentAccommodationsTest.ResponseTime
    
    # Test nearby accommodations
    $nearbyTest = Invoke-ApiRequest -Url "$BaseUrl/accommodations/nearby?lat=40.7128&lng=-74.0060&radius=10" -Headers $studentHeaders -TestName "Get Nearby Accommodations"
    Add-TestResult -Module "Student" -TestName "Get Nearby Accommodations" -Endpoint "/accommodations/nearby" -Success $nearbyTest.Success -StatusCode $nearbyTest.StatusCode -Details $(if ($nearbyTest.Success) { "Nearby accommodations retrieved successfully" } else { $nearbyTest.Error }) -ResponseTime $nearbyTest.ResponseTime
    
    # Test specific accommodation details
    if ($accommodationsTest.Success -and $accommodationsTest.Data -and ($accommodationsTest.Data | Measure-Object).Count -gt 0) {
        $firstAccommodation = $accommodationsTest.Data[0]
        $accommodationId = if ($firstAccommodation._id) { $firstAccommodation._id } else { $firstAccommodation.id }
        
        if ($accommodationId) {
            $accommodationDetailsTest = Invoke-ApiRequest -Url "$BaseUrl/accommodations/$accommodationId" -Headers $studentHeaders -TestName "Get Accommodation Details"
            Add-TestResult -Module "Student" -TestName "Get Accommodation Details" -Endpoint "/accommodations/:id" -Success $accommodationDetailsTest.Success -StatusCode $accommodationDetailsTest.StatusCode -Details $(if ($accommodationDetailsTest.Success) { "Accommodation details retrieved successfully" } else { $accommodationDetailsTest.Error }) -ResponseTime $accommodationDetailsTest.ResponseTime
        }
    }
    
    # Step 4: Food Provider Discovery Tests
    Write-Host "`n🍕 Step 3: Food Provider Discovery Tests" -ForegroundColor $Magenta
    Write-Host "=" * 40
    
    # Test get all food providers (public)
    $foodProvidersTest = Invoke-ApiRequest -Url "$BaseUrl/food-providers" -TestName "Get All Food Providers"
    Add-TestResult -Module "Student" -TestName "Get All Food Providers" -Endpoint "/food-providers" -Success $foodProvidersTest.Success -StatusCode $foodProvidersTest.StatusCode -Details $(if ($foodProvidersTest.Success) { "Food providers retrieved successfully ($(($foodProvidersTest.Data | Measure-Object).Count) found)" } else { $foodProvidersTest.Error }) -ResponseTime $foodProvidersTest.ResponseTime
    
    # Test student food options endpoint
    $studentFoodOptionsTest = Invoke-ApiRequest -Url "$BaseUrl/dashboard/student/food-options" -Headers $studentHeaders -TestName "Get Student Food Options"
    Add-TestResult -Module "Student" -TestName "Get Student Food Options" -Endpoint "/dashboard/student/food-options" -Success $studentFoodOptionsTest.Success -StatusCode $studentFoodOptionsTest.StatusCode -Details $(if ($studentFoodOptionsTest.Success) { "Student food options retrieved successfully" } else { $studentFoodOptionsTest.Error }) -ResponseTime $studentFoodOptionsTest.ResponseTime
    
    # Test specific food provider details
    if ($foodProvidersTest.Success -and $foodProvidersTest.Data -and ($foodProvidersTest.Data | Measure-Object).Count -gt 0) {
        $firstFoodProvider = $foodProvidersTest.Data[0]
        $foodProviderId = if ($firstFoodProvider._id) { $firstFoodProvider._id } else { $firstFoodProvider.id }
        
        if ($foodProviderId) {
            $foodProviderDetailsTest = Invoke-ApiRequest -Url "$BaseUrl/food-providers/$foodProviderId" -Headers $studentHeaders -TestName "Get Food Provider Details"
            Add-TestResult -Module "Student" -TestName "Get Food Provider Details" -Endpoint "/food-providers/:id" -Success $foodProviderDetailsTest.Success -StatusCode $foodProviderDetailsTest.StatusCode -Details $(if ($foodProviderDetailsTest.Success) { "Food provider details retrieved successfully" } else { $foodProviderDetailsTest.Error }) -ResponseTime $foodProviderDetailsTest.ResponseTime
        }
    }
    
    # Step 5: Booking Management Tests
    Write-Host "`n📅 Step 4: Booking Management Tests" -ForegroundColor $Magenta
    Write-Host "=" * 40
    
    # Test get my bookings
    $myBookingsTest = Invoke-ApiRequest -Url "$BaseUrl/bookings/my-bookings" -Headers $studentHeaders -TestName "Get My Bookings"
    Add-TestResult -Module "Student" -TestName "Get My Bookings" -Endpoint "/bookings/my-bookings" -Success $myBookingsTest.Success -StatusCode $myBookingsTest.StatusCode -Details $(if ($myBookingsTest.Success) { "Student bookings retrieved successfully ($(($myBookingsTest.Data | Measure-Object).Count) found)" } else { $myBookingsTest.Error }) -ResponseTime $myBookingsTest.ResponseTime
    
    # Test create booking with realistic data
    if ($accommodationsTest.Success -and $accommodationsTest.Data -and ($accommodationsTest.Data | Measure-Object).Count -gt 0) {
        $testAccommodation = $accommodationsTest.Data[0]
        $accommodationId = if ($testAccommodation._id) { $testAccommodation._id } else { $testAccommodation.id }
        
        if ($accommodationId) {
            $bookingData = @{
                accommodation = $accommodationId
                checkInDate = (Get-Date).AddDays(14).ToString("yyyy-MM-dd")
                checkOutDate = (Get-Date).AddDays(21).ToString("yyyy-MM-dd")
                guests = 2
                totalAmount = 450.00
                paymentMethod = "card"
                specialRequests = "Late check-in preferred after 6 PM"
            } | ConvertTo-Json
            
            $createBookingTest = Invoke-ApiRequest -Url "$BaseUrl/bookings" -Method "POST" -Headers $studentHeaders -Body $bookingData -TestName "Create Accommodation Booking"
            Add-TestResult -Module "Student" -TestName "Create Accommodation Booking" -Endpoint "/bookings" -Success $createBookingTest.Success -StatusCode $createBookingTest.StatusCode -Details $(if ($createBookingTest.Success) { "Booking created successfully with ID: $($createBookingTest.Data.id)" } else { $createBookingTest.Error }) -ResponseTime $createBookingTest.ResponseTime
            
            # If booking was created, test getting booking details
            if ($createBookingTest.Success -and $createBookingTest.Data.id) {
                $bookingDetailsTest = Invoke-ApiRequest -Url "$BaseUrl/bookings/$($createBookingTest.Data.id)" -Headers $studentHeaders -TestName "Get Booking Details"
                Add-TestResult -Module "Student" -TestName "Get Booking Details" -Endpoint "/bookings/:id" -Success $bookingDetailsTest.Success -StatusCode $bookingDetailsTest.StatusCode -Details $(if ($bookingDetailsTest.Success) { "Booking details retrieved successfully" } else { $bookingDetailsTest.Error }) -ResponseTime $bookingDetailsTest.ResponseTime
            }
        }
    }
    
    # Step 6: Order Management Tests
    Write-Host "`n🛒 Step 5: Order Management Tests" -ForegroundColor $Magenta
    Write-Host "=" * 40
    
    # Test get my orders
    $myOrdersTest = Invoke-ApiRequest -Url "$BaseUrl/orders/my-orders" -Headers $studentHeaders -TestName "Get My Orders"
    Add-TestResult -Module "Student" -TestName "Get My Orders" -Endpoint "/orders/my-orders" -Success $myOrdersTest.Success -StatusCode $myOrdersTest.StatusCode -Details $(if ($myOrdersTest.Success) { "Student orders retrieved successfully ($(($myOrdersTest.Data | Measure-Object).Count) found)" } else { $myOrdersTest.Error }) -ResponseTime $myOrdersTest.ResponseTime
    
    # Test create order with realistic data
    if ($foodProvidersTest.Success -and $foodProvidersTest.Data -and ($foodProvidersTest.Data | Measure-Object).Count -gt 0) {
        $testFoodProvider = $foodProvidersTest.Data[0]
        $foodProviderId = if ($testFoodProvider._id) { $testFoodProvider._id } else { $testFoodProvider.id }
        
        if ($foodProviderId) {
            $orderData = @{
                foodProvider = $foodProviderId
                items = @(
                    @{
                        name = "Chicken Biryani"
                        quantity = 2
                        price = 15.99
                        specialInstructions = "Extra spicy, no onions"
                    },
                    @{
                        name = "Garlic Naan"
                        quantity = 3
                        price = 3.50
                        specialInstructions = "Well done"
                    }
                )
                deliveryAddress = "123 University Ave, Dorm Room 205, Test City"
                totalAmount = 42.48
                paymentMethod = "card"
                deliveryInstructions = "Call when you arrive, building entrance code is 1234"
            } | ConvertTo-Json -Depth 3
            
            $createOrderTest = Invoke-ApiRequest -Url "$BaseUrl/orders" -Method "POST" -Headers $studentHeaders -Body $orderData -TestName "Create Food Order"
            Add-TestResult -Module "Student" -TestName "Create Food Order" -Endpoint "/orders" -Success $createOrderTest.Success -StatusCode $createOrderTest.StatusCode -Details $(if ($createOrderTest.Success) { "Order created successfully with ID: $($createOrderTest.Data.id)" } else { $createOrderTest.Error }) -ResponseTime $createOrderTest.ResponseTime
            
            # If order was created, test getting order details
            if ($createOrderTest.Success -and $createOrderTest.Data.id) {
                $orderDetailsTest = Invoke-ApiRequest -Url "$BaseUrl/orders/$($createOrderTest.Data.id)" -Headers $studentHeaders -TestName "Get Order Details"
                Add-TestResult -Module "Student" -TestName "Get Order Details" -Endpoint "/orders/:id" -Success $orderDetailsTest.Success -StatusCode $orderDetailsTest.StatusCode -Details $(if ($orderDetailsTest.Success) { "Order details retrieved successfully" } else { $orderDetailsTest.Error }) -ResponseTime $orderDetailsTest.ResponseTime
            }
        }
    }
    
    # Step 7: Notification and Communication Tests
    Write-Host "`n🔔 Step 6: Notification and Communication Tests" -ForegroundColor $Magenta
    Write-Host "=" * 40
    
    # Test get notifications
    $notificationsTest = Invoke-ApiRequest -Url "$BaseUrl/notifications" -Headers $studentHeaders -TestName "Get Notifications"
    Add-TestResult -Module "Student" -TestName "Get Notifications" -Endpoint "/notifications" -Success $notificationsTest.Success -StatusCode $notificationsTest.StatusCode -Details $(if ($notificationsTest.Success) { "Notifications retrieved successfully ($(($notificationsTest.Data | Measure-Object).Count) found)" } else { $notificationsTest.Error }) -ResponseTime $notificationsTest.ResponseTime
    
    # Test FCM token update
    $fcmTokenData = @{
        fcmToken = "fake_fcm_token_for_testing_$(Get-Random)"
    } | ConvertTo-Json
    
    $fcmTokenTest = Invoke-ApiRequest -Url "$BaseUrl/users/fcm-token" -Method "POST" -Headers $studentHeaders -Body $fcmTokenData -TestName "Update FCM Token"
    Add-TestResult -Module "Student" -TestName "Update FCM Token" -Endpoint "/users/fcm-token" -Success $fcmTokenTest.Success -StatusCode $fcmTokenTest.StatusCode -Details $(if ($fcmTokenTest.Success) { "FCM token updated successfully" } else { $fcmTokenTest.Error }) -ResponseTime $fcmTokenTest.ResponseTime
    
    # Step 8: Profile Management Tests
    Write-Host "`n👤 Step 7: Profile Management Tests" -ForegroundColor $Magenta
    Write-Host "=" * 40
    
    # Test update profile
    $updateProfileData = @{
        phone = "9876543210"
        address = "456 New University Ave, Updated Dorm, Test City"
        emergencyContact = @{
            name = "Updated Emergency Contact"
            phone = "5555555555"
            relationship = "guardian"
        }
    } | ConvertTo-Json -Depth 3
    
    $updateProfileTest = Invoke-ApiRequest -Url "$BaseUrl/users/profile" -Method "PUT" -Headers $studentHeaders -Body $updateProfileData -TestName "Update Student Profile"
    Add-TestResult -Module "Student" -TestName "Update Student Profile" -Endpoint "/users/profile" -Success $updateProfileTest.Success -StatusCode $updateProfileTest.StatusCode -Details $(if ($updateProfileTest.Success) { "Profile updated successfully" } else { $updateProfileTest.Error }) -ResponseTime $updateProfileTest.ResponseTime
    
    # Test change password
    $changePasswordData = @{
        oldPassword = "StrongPassword123!"
        newPassword = "NewStrongPassword456!"
        confirmPassword = "NewStrongPassword456!"
    } | ConvertTo-Json
    
    $changePasswordTest = Invoke-ApiRequest -Url "$BaseUrl/users/change-password" -Method "PUT" -Headers $studentHeaders -Body $changePasswordData -TestName "Change Password"
    Add-TestResult -Module "Student" -TestName "Change Password" -Endpoint "/users/change-password" -Success $changePasswordTest.Success -StatusCode $changePasswordTest.StatusCode -Details $(if ($changePasswordTest.Success) { "Password changed successfully" } else { $changePasswordTest.Error }) -ResponseTime $changePasswordTest.ResponseTime
    
    # Step 9: Review and Rating Tests
    Write-Host "`n⭐ Step 8: Review and Rating Tests" -ForegroundColor $Magenta
    Write-Host "=" * 40
    
    # Test get reviews
    $reviewsTest = Invoke-ApiRequest -Url "$BaseUrl/reviews" -Headers $studentHeaders -TestName "Get Reviews"
    Add-TestResult -Module "Student" -TestName "Get Reviews" -Endpoint "/reviews" -Success $reviewsTest.Success -StatusCode $reviewsTest.StatusCode -Details $(if ($reviewsTest.Success) { "Reviews retrieved successfully" } else { $reviewsTest.Error }) -ResponseTime $reviewsTest.ResponseTime
    
    # Test create accommodation review (if we have accommodations)
    if ($accommodationsTest.Success -and $accommodationsTest.Data -and ($accommodationsTest.Data | Measure-Object).Count -gt 0) {
        $testAccommodation = $accommodationsTest.Data[0]
        $accommodationId = if ($testAccommodation._id) { $testAccommodation._id } else { $testAccommodation.id }
        
        if ($accommodationId) {
            $accommodationReviewData = @{
                type = "accommodation"
                targetId = $accommodationId
                rating = 4
                title = "Great stay experience"
                comment = "Clean, well-located, and affordable. Perfect for students. The landlord was very responsive and helpful throughout the stay."
                pros = @("Clean", "Good location", "Responsive landlord", "Affordable")
                cons = @("Could use better WiFi", "Kitchen utensils limited")
            } | ConvertTo-Json -Depth 3
            
            $createAccommodationReviewTest = Invoke-ApiRequest -Url "$BaseUrl/reviews" -Method "POST" -Headers $studentHeaders -Body $accommodationReviewData -TestName "Create Accommodation Review"
            Add-TestResult -Module "Student" -TestName "Create Accommodation Review" -Endpoint "/reviews" -Success $createAccommodationReviewTest.Success -StatusCode $createAccommodationReviewTest.StatusCode -Details $(if ($createAccommodationReviewTest.Success) { "Accommodation review created successfully" } else { $createAccommodationReviewTest.Error }) -ResponseTime $createAccommodationReviewTest.ResponseTime
        }
    }
    
    # Test create food provider review (if we have food providers)
    if ($foodProvidersTest.Success -and $foodProvidersTest.Data -and ($foodProvidersTest.Data | Measure-Object).Count -gt 0) {
        $testFoodProvider = $foodProvidersTest.Data[0]
        $foodProviderId = if ($testFoodProvider._id) { $testFoodProvider._id } else { $testFoodProvider.id }
        
        if ($foodProviderId) {
            $foodReviewData = @{
                type = "food_provider"
                targetId = $foodProviderId
                rating = 5
                title = "Excellent food quality"
                comment = "Amazing biryani and great service. Food arrived hot and fresh. Definitely ordering again!"
                pros = @("Delicious food", "Fast delivery", "Good packaging", "Fair pricing")
                cons = @("Could add more variety")
            } | ConvertTo-Json -Depth 3
            
            $createFoodReviewTest = Invoke-ApiRequest -Url "$BaseUrl/reviews" -Method "POST" -Headers $studentHeaders -Body $foodReviewData -TestName "Create Food Provider Review"
            Add-TestResult -Module "Student" -TestName "Create Food Provider Review" -Endpoint "/reviews" -Success $createFoodReviewTest.Success -StatusCode $createFoodReviewTest.StatusCode -Details $(if ($createFoodReviewTest.Success) { "Food provider review created successfully" } else { $createFoodReviewTest.Error }) -ResponseTime $createFoodReviewTest.ResponseTime
        }
    }
    
    # Step 10: Advanced Feature Tests
    Write-Host "`n🚀 Step 9: Advanced Feature Tests" -ForegroundColor $Magenta
    Write-Host "=" * 40
    
    # Test all orders endpoint (should show all orders, admin level)
    $allOrdersTest = Invoke-ApiRequest -Url "$BaseUrl/orders" -Headers $studentHeaders -TestName "Get All Orders (Restricted)"
    Add-TestResult -Module "Student" -TestName "Get All Orders" -Endpoint "/orders" -Success $allOrdersTest.Success -StatusCode $allOrdersTest.StatusCode -Details $(if ($allOrdersTest.Success) { "All orders endpoint accessible" } else { "Access correctly restricted: $($allOrdersTest.Error)" }) -ResponseTime $allOrdersTest.ResponseTime
    
    # Test all bookings endpoint (should show all bookings, admin level)
    $allBookingsTest = Invoke-ApiRequest -Url "$BaseUrl/bookings" -Headers $studentHeaders -TestName "Get All Bookings (Restricted)"
    Add-TestResult -Module "Student" -TestName "Get All Bookings" -Endpoint "/bookings" -Success $allBookingsTest.Success -StatusCode $allBookingsTest.StatusCode -Details $(if ($allBookingsTest.Success) { "All bookings endpoint accessible" } else { "Access correctly restricted: $($allBookingsTest.Error)" }) -ResponseTime $allBookingsTest.ResponseTime
    
    # Test auth dashboard
    $authDashboardTest = Invoke-ApiRequest -Url "$BaseUrl/auth/dashboard" -Headers $studentHeaders -TestName "Get Auth Dashboard"
    Add-TestResult -Module "Student" -TestName "Get Auth Dashboard" -Endpoint "/auth/dashboard" -Success $authDashboardTest.Success -StatusCode $authDashboardTest.StatusCode -Details $(if ($authDashboardTest.Success) { "Auth dashboard retrieved successfully" } else { $authDashboardTest.Error }) -ResponseTime $authDashboardTest.ResponseTime
    
    # Generate final report
    Generate-TestReport
}

# Function to generate test report
function Generate-TestReport {
    Write-Host "`n" + "=" * 60 -ForegroundColor $Cyan
    Write-Host "🎓 STUDENT MODULE TEST RESULTS SUMMARY" -ForegroundColor $Cyan
    Write-Host "=" * 60 -ForegroundColor $Cyan
    
    $totalTests = $SuccessCount + $FailureCount
    $successRate = if ($totalTests -gt 0) { [math]::Round(($SuccessCount / $totalTests) * 100, 2) } else { 0 }
    
    Write-Host "📊 Overall Statistics:" -ForegroundColor $Blue
    Write-Host "   Total Tests: $totalTests" -ForegroundColor $White
    Write-Host "   Successful: $SuccessCount" -ForegroundColor $Green
    Write-Host "   Failed: $FailureCount" -ForegroundColor $Red
    Write-Host "   Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { $Green } elseif ($successRate -ge 60) { $Yellow } else { $Red })
    
    # Calculate average response time
    $responseTimes = $TestResults | Where-Object { $_.ResponseTime -gt 0 } | Select-Object -ExpandProperty ResponseTime
    $avgResponseTime = if ($responseTimes) { [math]::Round(($responseTimes | Measure-Object -Average).Average, 2) } else { 0 }
    Write-Host "   Average Response Time: ${avgResponseTime}ms" -ForegroundColor $Blue
    
    # Group results by test category
    Write-Host "`n📋 Test Categories Summary:" -ForegroundColor $Blue
    $categories = @{
        "Profile & Authentication" = $TestResults | Where-Object { $_.TestName -like "*Profile*" -or $_.TestName -like "*Dashboard*" -or $_.TestName -like "*Registration*" }
        "Accommodation Discovery" = $TestResults | Where-Object { $_.TestName -like "*Accommodation*" -and $_.TestName -notlike "*Review*" -and $_.TestName -notlike "*Booking*" }
        "Food Provider Discovery" = $TestResults | Where-Object { $_.TestName -like "*Food*" -and $_.TestName -notlike "*Review*" -and $_.TestName -notlike "*Order*" }
        "Booking Management" = $TestResults | Where-Object { $_.TestName -like "*Booking*" }
        "Order Management" = $TestResults | Where-Object { $_.TestName -like "*Order*" }
        "Notifications and Communication" = $TestResults | Where-Object { $_.TestName -like "*Notification*" -or $_.TestName -like "*FCM*" }
        "Profile Management" = $TestResults | Where-Object { $_.TestName -like "*Update*" -or $_.TestName -like "*Change*" }
        "Reviews and Ratings" = $TestResults | Where-Object { $_.TestName -like "*Review*" }
        "Advanced Features" = $TestResults | Where-Object { $_.TestName -like "*All*" -or $_.TestName -like "*Auth Dashboard*" }
    }
    
    foreach ($category in $categories.GetEnumerator()) {
        $categoryTests = $category.Value
        $categoryTotal = ($categoryTests | Measure-Object).Count
        $categorySuccess = ($categoryTests | Where-Object { $_.Success }).Count
        $categoryRate = if ($categoryTotal -gt 0) { [math]::Round(($categorySuccess / $categoryTotal) * 100, 2) } else { 0 }
        
        Write-Host "   $($category.Key): $categorySuccess/$categoryTotal ($categoryRate%)" -ForegroundColor $(if ($categoryRate -ge 80) { $Green } elseif ($categoryRate -ge 60) { $Yellow } else { $Red })
    }
    
    # Show failed tests
    $failedTests = $TestResults | Where-Object { -not $_.Success }
    if ($failedTests) {
        Write-Host "`n❌ Failed Tests:" -ForegroundColor $Red
        foreach ($test in $failedTests) {
            Write-Host "   • $($test.TestName): $($test.Details)" -ForegroundColor $Yellow
        }
    }
    
    # Show successful key tests
    $keySuccessTests = $TestResults | Where-Object { $_.Success -and ($_.TestName -like "*Registration*" -or $_.TestName -like "*Create*" -or $_.TestName -like "*Get My*") }
    if ($keySuccessTests) {
        Write-Host "`n✅ Key Successful Tests:" -ForegroundColor $Green
        foreach ($test in $keySuccessTests) {
            Write-Host "   • $($test.TestName): $($test.Details)" -ForegroundColor $Gray
        }
    }
    
    Write-Host "Test Completion Time: $(Get-Date)" -ForegroundColor $Gray
    Write-Host "Student Module Testing Complete!" -ForegroundColor $Cyan
    
    # Save detailed results to file
    $reportPath = "STUDENT_MODULE_TEST_RESULTS_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
    $TestResults | ConvertTo-Json -Depth 3 | Out-File -FilePath $reportPath -Encoding UTF8
    Write-Host "Detailed results saved to: $reportPath" -ForegroundColor $Blue
}

# Execute the tests
Test-StudentModule
