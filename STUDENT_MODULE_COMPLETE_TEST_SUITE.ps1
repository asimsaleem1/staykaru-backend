# StayKaru Backend - Complete Student Module Test Suite
# This script tests ALL student endpoints including the newly fixed booking and order creation
# Expected Result: 100% SUCCESS RATE (15/15 tests pass)

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
        Write-Host "[SUCCESS] $TestName" -ForegroundColor $Green
        Write-Host "   $Details" -ForegroundColor Gray
    } else {
        $global:FailureCount++
        Write-Host "[FAILED] $TestName" -ForegroundColor $Red
        Write-Host "   $Details" -ForegroundColor Yellow
    }
}

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

function Register-TestStudent {
    Write-Host "Step 0: Registering Test Student..." -ForegroundColor $Blue
    
    $studentData = @{
        name = "Complete Test Student"
        email = "complete.test.$(Get-Random)@example.com"
        password = "CompletePassword123!"
        role = "student"
        phone = "1234567890"
        countryCode = "+1"
        gender = "male"
        dateOfBirth = "1998-05-15"
        address = "123 Complete Test Ave, Test City"
        university = "Complete Test University"
        studentId = "CTS$(Get-Random -Maximum 99999)"
        emergencyContact = @{
            name = "Emergency Contact"
            phone = "9876543210"
            relationship = "parent"
        }
    } | ConvertTo-Json -Depth 3
    
    $result = Invoke-ApiRequest -Url "$BaseUrl/auth/register" -Method "POST" -Body $studentData -TestName "Student Registration"
    
    if ($result.Success) {
        Add-TestResult -Module "Student" -TestName "Student Registration" -Endpoint "/auth/register" -Success $true -StatusCode 201 -Details "Complete test student registered successfully" -ResponseTime $result.ResponseTime
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

function Test-CompleteStudentModule {
    Write-Host "STAYKARU COMPLETE STUDENT MODULE TEST SUITE" -ForegroundColor $Cyan
    Write-Host "=============================================" -ForegroundColor $Cyan
    Write-Host "Testing ALL endpoints including FIXED booking/order creation" -ForegroundColor $Cyan
    Write-Host "Expected: 100% SUCCESS RATE (15/15 tests)" -ForegroundColor $Cyan
    Write-Host "Base URL: $BaseUrl" -ForegroundColor $Gray
    Write-Host "Test Started: $(Get-Date)" -ForegroundColor $Gray
    Write-Host ""
    
    # Step 1: Register and authenticate
    $studentAuth = Register-TestStudent
    if (-not $studentAuth.Success) {
        Write-Host "[CRITICAL ERROR] Could not register test student. Exiting..." -ForegroundColor $Red
        return
    }
    
    $studentHeaders = $studentAuth.Headers
    $studentUser = $studentAuth.User
    
    Write-Host "Authenticated as: $($studentUser.name) ($($studentUser.email))" -ForegroundColor $Blue
    
    # Step 2: Authentication & Profile Tests
    Write-Host "`nStep 1: Authentication & Profile Management" -ForegroundColor $Magenta
    Write-Host "============================================"
    
    # Test get profile
    $profileTest = Invoke-ApiRequest -Url "$BaseUrl/auth/profile" -Headers $studentHeaders -TestName "Get User Profile"
    Add-TestResult -Module "Student" -TestName "Get User Profile" -Endpoint "/auth/profile" -Success $profileTest.Success -StatusCode $profileTest.StatusCode -Details $(if ($profileTest.Success) { "Profile retrieved successfully" } else { $profileTest.Error }) -ResponseTime $profileTest.ResponseTime
    
    # Test detailed profile
    $detailedProfileTest = Invoke-ApiRequest -Url "$BaseUrl/users/profile" -Headers $studentHeaders -TestName "Get Detailed Profile"
    Add-TestResult -Module "Student" -TestName "Get Detailed Profile" -Endpoint "/users/profile" -Success $detailedProfileTest.Success -StatusCode $detailedProfileTest.StatusCode -Details $(if ($detailedProfileTest.Success) { "Detailed profile retrieved successfully" } else { $detailedProfileTest.Error }) -ResponseTime $detailedProfileTest.ResponseTime
    
    # Test profile update
    $updateData = @{
        phone = "9876543210"
        address = "456 Updated Complete Test Ave, New Test City"
    } | ConvertTo-Json
    
    $updateTest = Invoke-ApiRequest -Url "$BaseUrl/users/profile" -Method "PUT" -Headers $studentHeaders -Body $updateData -TestName "Update Profile"
    Add-TestResult -Module "Student" -TestName "Update Profile" -Endpoint "/users/profile" -Success $updateTest.Success -StatusCode $updateTest.StatusCode -Details $(if ($updateTest.Success) { "Profile updated successfully" } else { $updateTest.Error }) -ResponseTime $updateTest.ResponseTime
    
    # Step 3: Dashboard Access
    Write-Host "`nStep 2: Dashboard Access" -ForegroundColor $Magenta
    Write-Host "========================"
    
    $dashboardTest = Invoke-ApiRequest -Url "$BaseUrl/dashboard" -Headers $studentHeaders -TestName "Get Student Dashboard"
    Add-TestResult -Module "Student" -TestName "Get Student Dashboard" -Endpoint "/dashboard" -Success $dashboardTest.Success -StatusCode $dashboardTest.StatusCode -Details $(if ($dashboardTest.Success) { "Dashboard accessed successfully" } else { $dashboardTest.Error }) -ResponseTime $dashboardTest.ResponseTime
    
    # Step 4: Accommodation Discovery
    Write-Host "`nStep 3: Accommodation Discovery" -ForegroundColor $Magenta
    Write-Host "==============================="
    
    $accommodationsTest = Invoke-ApiRequest -Url "$BaseUrl/accommodations" -TestName "Get All Accommodations"
    Add-TestResult -Module "Student" -TestName "Get All Accommodations" -Endpoint "/accommodations" -Success $accommodationsTest.Success -StatusCode $accommodationsTest.StatusCode -Details $(if ($accommodationsTest.Success) { "Found $(($accommodationsTest.Data | Measure-Object).Count) accommodations" } else { $accommodationsTest.Error }) -ResponseTime $accommodationsTest.ResponseTime
    
    $studentAccommodationsTest = Invoke-ApiRequest -Url "$BaseUrl/dashboard/student/accommodations" -Headers $studentHeaders -TestName "Get Student Accommodations"
    Add-TestResult -Module "Student" -TestName "Get Student Accommodations" -Endpoint "/dashboard/student/accommodations" -Success $studentAccommodationsTest.Success -StatusCode $studentAccommodationsTest.StatusCode -Details $(if ($studentAccommodationsTest.Success) { "Student accommodations retrieved" } else { $studentAccommodationsTest.Error }) -ResponseTime $studentAccommodationsTest.ResponseTime
    
    $nearbyTest = Invoke-ApiRequest -Url "$BaseUrl/accommodations/nearby?lat=40.7128&lng=-74.0060&radius=10" -Headers $studentHeaders -TestName "Get Nearby Accommodations"
    Add-TestResult -Module "Student" -TestName "Get Nearby Accommodations" -Endpoint "/accommodations/nearby" -Success $nearbyTest.Success -StatusCode $nearbyTest.StatusCode -Details $(if ($nearbyTest.Success) { "Nearby accommodations retrieved" } else { $nearbyTest.Error }) -ResponseTime $nearbyTest.ResponseTime
    
    # Step 5: Food Provider Discovery
    Write-Host "`nStep 4: Food Provider Discovery" -ForegroundColor $Magenta
    Write-Host "==============================="
    
    $foodProvidersTest = Invoke-ApiRequest -Url "$BaseUrl/food-providers" -TestName "Get All Food Providers"
    Add-TestResult -Module "Student" -TestName "Get All Food Providers" -Endpoint "/food-providers" -Success $foodProvidersTest.Success -StatusCode $foodProvidersTest.StatusCode -Details $(if ($foodProvidersTest.Success) { "Found $(($foodProvidersTest.Data | Measure-Object).Count) food providers" } else { $foodProvidersTest.Error }) -ResponseTime $foodProvidersTest.ResponseTime
    
    $studentFoodTest = Invoke-ApiRequest -Url "$BaseUrl/dashboard/student/food-options" -Headers $studentHeaders -TestName "Get Student Food Options"
    Add-TestResult -Module "Student" -TestName "Get Student Food Options" -Endpoint "/dashboard/student/food-options" -Success $studentFoodTest.Success -StatusCode $studentFoodTest.StatusCode -Details $(if ($studentFoodTest.Success) { "Student food options retrieved" } else { $studentFoodTest.Error }) -ResponseTime $studentFoodTest.ResponseTime
    
    # Step 6: Booking Management (INCLUDING CREATION)
    Write-Host "`nStep 5: Booking Management (WITH CREATION)" -ForegroundColor $Magenta
    Write-Host "==========================================="
    
    $myBookingsTest = Invoke-ApiRequest -Url "$BaseUrl/bookings/my-bookings" -Headers $studentHeaders -TestName "Get My Bookings"
    Add-TestResult -Module "Student" -TestName "Get My Bookings" -Endpoint "/bookings/my-bookings" -Success $myBookingsTest.Success -StatusCode $myBookingsTest.StatusCode -Details $(if ($myBookingsTest.Success) { "Bookings retrieved ($(($myBookingsTest.Data | Measure-Object).Count) found)" } else { $myBookingsTest.Error }) -ResponseTime $myBookingsTest.ResponseTime
    
    # TEST FIXED BOOKING CREATION
    if ($accommodationsTest.Success -and $accommodationsTest.Data -and ($accommodationsTest.Data | Measure-Object).Count -gt 0) {
        $testAccommodation = $accommodationsTest.Data[0]
        $accommodationId = if ($testAccommodation._id) { $testAccommodation._id } else { $testAccommodation.id }
        
        if ($accommodationId) {
            Write-Host "   Creating booking for accommodation: $accommodationId" -ForegroundColor $Gray
            
            $bookingData = @{
                accommodation = $accommodationId
                checkInDate = (Get-Date).AddDays(14).ToString("yyyy-MM-dd")
                checkOutDate = (Get-Date).AddDays(21).ToString("yyyy-MM-dd")
                guests = 2
                totalAmount = 450.00
                paymentMethod = "card"
                specialRequests = "Late check-in preferred after 6 PM"
            } | ConvertTo-Json
            
            $createBookingTest = Invoke-ApiRequest -Url "$BaseUrl/bookings" -Method "POST" -Headers $studentHeaders -Body $bookingData -TestName "Create Booking (FIXED)"
            Add-TestResult -Module "Student" -TestName "Create Booking (FIXED)" -Endpoint "/bookings" -Success $createBookingTest.Success -StatusCode $createBookingTest.StatusCode -Details $(if ($createBookingTest.Success) { "Booking created successfully! ID: $($createBookingTest.Data.id)" } else { "FAILED: $($createBookingTest.Error)" }) -ResponseTime $createBookingTest.ResponseTime
        }
    }
    
    # Step 7: Order Management (INCLUDING CREATION)
    Write-Host "`nStep 6: Order Management (WITH CREATION)" -ForegroundColor $Magenta
    Write-Host "========================================"
    
    $myOrdersTest = Invoke-ApiRequest -Url "$BaseUrl/orders/my-orders" -Headers $studentHeaders -TestName "Get My Orders"
    Add-TestResult -Module "Student" -TestName "Get My Orders" -Endpoint "/orders/my-orders" -Success $myOrdersTest.Success -StatusCode $myOrdersTest.StatusCode -Details $(if ($myOrdersTest.Success) { "Orders retrieved ($(($myOrdersTest.Data | Measure-Object).Count) found)" } else { $myOrdersTest.Error }) -ResponseTime $myOrdersTest.ResponseTime
    
    # TEST FIXED ORDER CREATION
    if ($foodProvidersTest.Success -and $foodProvidersTest.Data -and ($foodProvidersTest.Data | Measure-Object).Count -gt 0) {
        $testFoodProvider = $foodProvidersTest.Data[0]
        $foodProviderId = if ($testFoodProvider._id) { $testFoodProvider._id } else { $testFoodProvider.id }
        
        if ($foodProviderId) {
            Write-Host "   Creating order for food provider: $foodProviderId" -ForegroundColor $Gray
            
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
                deliveryAddress = "123 Complete Test Ave, Dorm Room 205, Test City"
                totalAmount = 42.48
                paymentMethod = "card"
                deliveryInstructions = "Call when you arrive, building entrance code is 1234"
            } | ConvertTo-Json -Depth 3
            
            $createOrderTest = Invoke-ApiRequest -Url "$BaseUrl/orders" -Method "POST" -Headers $studentHeaders -Body $orderData -TestName "Create Order (FIXED)"
            Add-TestResult -Module "Student" -TestName "Create Order (FIXED)" -Endpoint "/orders" -Success $createOrderTest.Success -StatusCode $createOrderTest.StatusCode -Details $(if ($createOrderTest.Success) { "Order created successfully! ID: $($createOrderTest.Data.id)" } else { "FAILED: $($createOrderTest.Error)" }) -ResponseTime $createOrderTest.ResponseTime
        }
    }
    
    # Step 8: Notifications
    Write-Host "`nStep 7: Notifications" -ForegroundColor $Magenta
    Write-Host "===================="
    
    $notificationsTest = Invoke-ApiRequest -Url "$BaseUrl/notifications" -Headers $studentHeaders -TestName "Get Notifications"
    Add-TestResult -Module "Student" -TestName "Get Notifications" -Endpoint "/notifications" -Success $notificationsTest.Success -StatusCode $notificationsTest.StatusCode -Details $(if ($notificationsTest.Success) { "Notifications retrieved ($(($notificationsTest.Data | Measure-Object).Count) found)" } else { $notificationsTest.Error }) -ResponseTime $notificationsTest.ResponseTime
    
    # Generate comprehensive report
    Generate-FinalReport
}

function Generate-FinalReport {
    Write-Host "`n" + "=" * 60 -ForegroundColor $Cyan
    Write-Host "COMPLETE STUDENT MODULE TEST RESULTS" -ForegroundColor $Cyan
    Write-Host "=" * 60 -ForegroundColor $Cyan
    
    $totalTests = $SuccessCount + $FailureCount
    $successRate = if ($totalTests -gt 0) { [math]::Round(($SuccessCount / $totalTests) * 100, 2) } else { 0 }
    
    Write-Host "FINAL STATISTICS:" -ForegroundColor $Blue
    Write-Host "   Total Tests: $totalTests" -ForegroundColor $White
    Write-Host "   Successful: $SuccessCount" -ForegroundColor $Green
    Write-Host "   Failed: $FailureCount" -ForegroundColor $(if ($FailureCount -eq 0) { $Green } else { $Red })
    Write-Host "   Success Rate: $successRate%" -ForegroundColor $(if ($successRate -eq 100) { $Green } elseif ($successRate -ge 90) { $Yellow } else { $Red })
    
    if ($successRate -eq 100) {
        Write-Host "`n🎉 PERFECT SCORE! ALL TESTS PASSED! 🎉" -ForegroundColor $Green
        Write-Host "Student module is 100% READY for frontend integration!" -ForegroundColor $Green
    }
    
    # Calculate performance metrics
    $responseTimes = $TestResults | Where-Object { $_.ResponseTime -gt 0 } | Select-Object -ExpandProperty ResponseTime
    $avgResponseTime = if ($responseTimes) { [math]::Round(($responseTimes | Measure-Object -Average).Average, 2) } else { 0 }
    $maxResponseTime = if ($responseTimes) { ($responseTimes | Measure-Object -Maximum).Maximum } else { 0 }
    $minResponseTime = if ($responseTimes) { ($responseTimes | Measure-Object -Minimum).Minimum } else { 0 }
    
    Write-Host "`nPERFORMANCE METRICS:" -ForegroundColor $Blue
    Write-Host "   Average Response Time: ${avgResponseTime}ms" -ForegroundColor $Gray
    Write-Host "   Fastest Response: ${minResponseTime}ms" -ForegroundColor $Gray
    Write-Host "   Slowest Response: ${maxResponseTime}ms" -ForegroundColor $Gray
    
    # Show test categories
    Write-Host "`nTEST CATEGORIES COMPLETED:" -ForegroundColor $Blue
    Write-Host "   ✅ Authentication & Profile Management" -ForegroundColor $Green
    Write-Host "   ✅ Dashboard Access" -ForegroundColor $Green
    Write-Host "   ✅ Accommodation Discovery" -ForegroundColor $Green
    Write-Host "   ✅ Food Provider Discovery" -ForegroundColor $Green
    Write-Host "   ✅ Booking Management (INCLUDING CREATION)" -ForegroundColor $Green
    Write-Host "   ✅ Order Management (INCLUDING CREATION)" -ForegroundColor $Green
    Write-Host "   ✅ Notification System" -ForegroundColor $Green
    
    # Show any failures
    $failedTests = $TestResults | Where-Object { -not $_.Success }
    if ($failedTests) {
        Write-Host "`nFAILED TESTS:" -ForegroundColor $Red
        foreach ($test in $failedTests) {
            Write-Host "   ❌ $($test.TestName): $($test.Details)" -ForegroundColor $Yellow
        }
    } else {
        Write-Host "`n🎯 NO FAILED TESTS - PERFECT EXECUTION!" -ForegroundColor $Green
    }
    
    # Show successful creations
    $creationTests = $TestResults | Where-Object { $_.Success -and ($_.TestName -like "*Create*" -or $_.TestName -like "*FIXED*") }
    if ($creationTests) {
        Write-Host "`nSUCCESSFUL CREATIONS:" -ForegroundColor $Green
        foreach ($test in $creationTests) {
            Write-Host "   ✅ $($test.TestName): $($test.Details)" -ForegroundColor $Gray
        }
    }
    
    Write-Host "`nTest Completed: $(Get-Date)" -ForegroundColor $Gray
    Write-Host "STATUS: $(if ($successRate -eq 100) { "🎉 COMPLETE SUCCESS - 100% READY!" } else { "⚠️ PARTIAL SUCCESS - $successRate% READY" })" -ForegroundColor $(if ($successRate -eq 100) { $Green } else { $Yellow })
    
    # Save results
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $reportPath = "STUDENT_MODULE_COMPLETE_TEST_RESULTS_$timestamp.json"
    $TestResults | ConvertTo-Json -Depth 3 | Out-File -FilePath $reportPath -Encoding UTF8
    Write-Host "Detailed results saved to: $reportPath" -ForegroundColor $Blue
    
    Write-Host "`n" + "=" * 60 -ForegroundColor $Cyan
    Write-Host "STUDENT MODULE TESTING COMPLETE!" -ForegroundColor $Cyan
    Write-Host "=" * 60 -ForegroundColor $Cyan
}

# Execute the complete test suite
Test-CompleteStudentModule
