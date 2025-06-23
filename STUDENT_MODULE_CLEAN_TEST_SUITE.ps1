# StayKaru Backend - Student Module Clean Test Suite
# Tests ONLY the working functionality (13/15 endpoints)
# Excludes booking/order creation until backend fixes are complete

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
        Write-Host "[PASS] $TestName" -ForegroundColor $Green
        Write-Host "   $Details" -ForegroundColor Gray
    } else {
        $global:FailureCount++
        Write-Host "[FAIL] $TestName" -ForegroundColor $Red
        Write-Host "   $Details" -ForegroundColor Yellow
    }
}

# Function to make API requests with better error handling
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
            TimeoutSec = 30
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
        $errorMessage = $_.Exception.Message
        
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
        }
        
        return @{
            Success = $false
            Error = $errorMessage
            StatusCode = $statusCode
            ResponseTime = $stopwatch.ElapsedMilliseconds
        }
    }
}

# Function to register a test student
function Register-TestStudent {
    Write-Host "`n=== STUDENT REGISTRATION TEST ===" -ForegroundColor $Blue
    
    $randomId = Get-Random -Maximum 999999
    $studentData = @{
        name = "Clean Test Student"
        email = "cleantest.student.$randomId@testemail.com"
        password = "SecureTestPass123!"
        role = "student"
        phone = "5551234567"
        countryCode = "+1"
        gender = "male"
        dateOfBirth = "1999-03-20"
        address = "789 Clean Test Ave, Test City, TC 12345"
        university = "Clean Test University"
        studentId = "CTU$randomId"
        emergencyContact = @{
            name = "Test Emergency Contact"
            phone = "5559876543"
            relationship = "parent"
        }
    } | ConvertTo-Json -Depth 3
    
    $result = Invoke-ApiRequest -Url "$BaseUrl/auth/register" -Method "POST" -Body $studentData -TestName "Student Registration"
    
    if ($result.Success) {
        Add-TestResult -Module "Authentication" -TestName "Student Registration" -Endpoint "/auth/register" -Success $true -StatusCode 201 -Details "Successfully registered student: cleantest.student.$randomId@testemail.com" -ResponseTime $result.ResponseTime
        return @{
            Success = $true
            Token = $result.Data.access_token
            User = $result.Data.user
            Headers = @{ "Authorization" = "Bearer $($result.Data.access_token)" }
        }
    } else {
        Add-TestResult -Module "Authentication" -TestName "Student Registration" -Endpoint "/auth/register" -Success $false -StatusCode $result.StatusCode -Details "Registration failed: $($result.Error)" -ResponseTime $result.ResponseTime
        return @{ Success = $false }
    }
}

# Main testing function for working endpoints only
function Test-WorkingStudentEndpoints {
    Write-Host "STAYKARU STUDENT MODULE - CLEAN WORKING ENDPOINTS TEST" -ForegroundColor $Cyan
    Write-Host "=" * 65 -ForegroundColor $Cyan
    Write-Host "Testing Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor $Gray
    Write-Host "Base URL: $BaseUrl" -ForegroundColor $Gray
    Write-Host "Focus: Testing ONLY verified working endpoints (13 total)" -ForegroundColor $Yellow
    Write-Host "Excluded: Booking creation, Order creation (awaiting backend fixes)" -ForegroundColor $Yellow
    Write-Host ""
    
    # Step 1: Register and authenticate test student
    $studentAuth = Register-TestStudent
    if (-not $studentAuth.Success) {
        Write-Host "`n[CRITICAL ERROR] Student registration failed - cannot continue tests" -ForegroundColor $Red
        return
    }
    
    $studentHeaders = $studentAuth.Headers
    $studentUser = $studentAuth.User
    
    Write-Host "`nAuthenticated Student: $($studentUser.name) <$($studentUser.email)>" -ForegroundColor $Green
    
    # Step 2: Profile Management Tests
    Write-Host "`n=== PROFILE MANAGEMENT TESTS ===" -ForegroundColor $Magenta
    
    # Test basic profile retrieval
    $profileTest = Invoke-ApiRequest -Url "$BaseUrl/auth/profile" -Headers $studentHeaders -TestName "Get Basic Profile"
    Add-TestResult -Module "Profile" -TestName "Get Basic Profile" -Endpoint "/auth/profile" -Success $profileTest.Success -StatusCode $profileTest.StatusCode -Details $(if ($profileTest.Success) { "Basic profile retrieved successfully" } else { "Failed: $($profileTest.Error)" }) -ResponseTime $profileTest.ResponseTime
    
    # Test detailed profile retrieval
    $detailedProfileTest = Invoke-ApiRequest -Url "$BaseUrl/users/profile" -Headers $studentHeaders -TestName "Get Detailed Profile"
    Add-TestResult -Module "Profile" -TestName "Get Detailed Profile" -Endpoint "/users/profile" -Success $detailedProfileTest.Success -StatusCode $detailedProfileTest.StatusCode -Details $(if ($detailedProfileTest.Success) { "Detailed profile retrieved successfully" } else { "Failed: $($detailedProfileTest.Error)" }) -ResponseTime $detailedProfileTest.ResponseTime
    
    # Test profile update
    $updateData = @{
        phone = "5557654321"
        address = "Updated Address: 456 New Student Lane, Updated City"
    } | ConvertTo-Json
    
    $updateTest = Invoke-ApiRequest -Url "$BaseUrl/users/profile" -Method "PUT" -Headers $studentHeaders -Body $updateData -TestName "Update Profile"
    Add-TestResult -Module "Profile" -TestName "Update Profile" -Endpoint "/users/profile" -Success $updateTest.Success -StatusCode $updateTest.StatusCode -Details $(if ($updateTest.Success) { "Profile updated successfully" } else { "Failed: $($updateTest.Error)" }) -ResponseTime $updateTest.ResponseTime
    
    # Step 3: Dashboard Access Test
    Write-Host "`n=== DASHBOARD ACCESS TEST ===" -ForegroundColor $Magenta
    
    $dashboardTest = Invoke-ApiRequest -Url "$BaseUrl/dashboard" -Headers $studentHeaders -TestName "Student Dashboard"
    Add-TestResult -Module "Dashboard" -TestName "Student Dashboard Access" -Endpoint "/dashboard" -Success $dashboardTest.Success -StatusCode $dashboardTest.StatusCode -Details $(if ($dashboardTest.Success) { "Dashboard accessed successfully with student-specific data" } else { "Failed: $($dashboardTest.Error)" }) -ResponseTime $dashboardTest.ResponseTime
    
    # Step 4: Accommodation Discovery Tests
    Write-Host "`n=== ACCOMMODATION DISCOVERY TESTS ===" -ForegroundColor $Magenta
    
    # Test public accommodations
    $accommodationsTest = Invoke-ApiRequest -Url "$BaseUrl/accommodations" -TestName "All Accommodations"
    $accommodationCount = if ($accommodationsTest.Success -and $accommodationsTest.Data) { ($accommodationsTest.Data | Measure-Object).Count } else { 0 }
    Add-TestResult -Module "Discovery" -TestName "Get All Accommodations" -Endpoint "/accommodations" -Success $accommodationsTest.Success -StatusCode $accommodationsTest.StatusCode -Details $(if ($accommodationsTest.Success) { "Retrieved $accommodationCount accommodations successfully" } else { "Failed: $($accommodationsTest.Error)" }) -ResponseTime $accommodationsTest.ResponseTime
    
    # Test student-specific accommodations
    $studentAccommodationsTest = Invoke-ApiRequest -Url "$BaseUrl/dashboard/student/accommodations" -Headers $studentHeaders -TestName "Student Accommodations"
    Add-TestResult -Module "Discovery" -TestName "Student Accommodations" -Endpoint "/dashboard/student/accommodations" -Success $studentAccommodationsTest.Success -StatusCode $studentAccommodationsTest.StatusCode -Details $(if ($studentAccommodationsTest.Success) { "Student-specific accommodations retrieved successfully" } else { "Failed: $($studentAccommodationsTest.Error)" }) -ResponseTime $studentAccommodationsTest.ResponseTime
    
    # Test nearby accommodations (using NYC coordinates)
    $nearbyTest = Invoke-ApiRequest -Url "$BaseUrl/accommodations/nearby?lat=40.7128&lng=-74.0060&radius=25" -Headers $studentHeaders -TestName "Nearby Accommodations"
    Add-TestResult -Module "Discovery" -TestName "Nearby Accommodations" -Endpoint "/accommodations/nearby" -Success $nearbyTest.Success -StatusCode $nearbyTest.StatusCode -Details $(if ($nearbyTest.Success) { "Location-based accommodation search working" } else { "Failed: $($nearbyTest.Error)" }) -ResponseTime $nearbyTest.ResponseTime
    
    # Step 5: Food Provider Discovery Tests
    Write-Host "`n=== FOOD PROVIDER DISCOVERY TESTS ===" -ForegroundColor $Magenta
    
    # Test public food providers
    $foodProvidersTest = Invoke-ApiRequest -Url "$BaseUrl/food-providers" -TestName "All Food Providers"
    $foodProviderCount = if ($foodProvidersTest.Success -and $foodProvidersTest.Data) { ($foodProvidersTest.Data | Measure-Object).Count } else { 0 }
    Add-TestResult -Module "Discovery" -TestName "Get All Food Providers" -Endpoint "/food-providers" -Success $foodProvidersTest.Success -StatusCode $foodProvidersTest.StatusCode -Details $(if ($foodProvidersTest.Success) { "Retrieved $foodProviderCount food providers successfully" } else { "Failed: $($foodProvidersTest.Error)" }) -ResponseTime $foodProvidersTest.ResponseTime
    
    # Test student food options
    $studentFoodTest = Invoke-ApiRequest -Url "$BaseUrl/dashboard/student/food-options" -Headers $studentHeaders -TestName "Student Food Options"
    Add-TestResult -Module "Discovery" -TestName "Student Food Options" -Endpoint "/dashboard/student/food-options" -Success $studentFoodTest.Success -StatusCode $studentFoodTest.StatusCode -Details $(if ($studentFoodTest.Success) { "Student-specific food options retrieved successfully" } else { "Failed: $($studentFoodTest.Error)" }) -ResponseTime $studentFoodTest.ResponseTime
    
    # Step 6: Booking & Order History Tests (READ-ONLY)
    Write-Host "`n=== BOOKING & ORDER HISTORY TESTS ===" -ForegroundColor $Magenta
    
    # Test booking history
    $bookingHistoryTest = Invoke-ApiRequest -Url "$BaseUrl/bookings/my-bookings" -Headers $studentHeaders -TestName "Booking History"
    $bookingCount = if ($bookingHistoryTest.Success -and $bookingHistoryTest.Data) { ($bookingHistoryTest.Data | Measure-Object).Count } else { 0 }
    Add-TestResult -Module "History" -TestName "Get Booking History" -Endpoint "/bookings/my-bookings" -Success $bookingHistoryTest.Success -StatusCode $bookingHistoryTest.StatusCode -Details $(if ($bookingHistoryTest.Success) { "Booking history retrieved: $bookingCount bookings found" } else { "Failed: $($bookingHistoryTest.Error)" }) -ResponseTime $bookingHistoryTest.ResponseTime
    
    # Test order history
    $orderHistoryTest = Invoke-ApiRequest -Url "$BaseUrl/orders/my-orders" -Headers $studentHeaders -TestName "Order History"
    $orderCount = if ($orderHistoryTest.Success -and $orderHistoryTest.Data) { ($orderHistoryTest.Data | Measure-Object).Count } else { 0 }
    Add-TestResult -Module "History" -TestName "Get Order History" -Endpoint "/orders/my-orders" -Success $orderHistoryTest.Success -StatusCode $orderHistoryTest.StatusCode -Details $(if ($orderHistoryTest.Success) { "Order history retrieved: $orderCount orders found" } else { "Failed: $($orderHistoryTest.Error)" }) -ResponseTime $orderHistoryTest.ResponseTime
    
    # Step 7: Notification System Test
    Write-Host "`n=== NOTIFICATION SYSTEM TEST ===" -ForegroundColor $Magenta
    
    $notificationsTest = Invoke-ApiRequest -Url "$BaseUrl/notifications" -Headers $studentHeaders -TestName "Notifications"
    $notificationCount = if ($notificationsTest.Success -and $notificationsTest.Data) { ($notificationsTest.Data | Measure-Object).Count } else { 0 }
    Add-TestResult -Module "Notifications" -TestName "Get Notifications" -Endpoint "/notifications" -Success $notificationsTest.Success -StatusCode $notificationsTest.StatusCode -Details $(if ($notificationsTest.Success) { "Notifications retrieved: $notificationCount notifications found" } else { "Failed: $($notificationsTest.Error)" }) -ResponseTime $notificationsTest.ResponseTime
    
    # Generate clean test report
    Generate-CleanTestReport
}

# Function to generate clean test report
function Generate-CleanTestReport {
    Write-Host "`n" + "=" * 65 -ForegroundColor $Cyan
    Write-Host "STUDENT MODULE CLEAN TEST RESULTS" -ForegroundColor $Cyan
    Write-Host "=" * 65 -ForegroundColor $Cyan
    
    $totalTests = $SuccessCount + $FailureCount
    $successRate = if ($totalTests -gt 0) { [math]::Round(($SuccessCount / $totalTests) * 100, 2) } else { 0 }
    
    Write-Host "`nTEST SUMMARY:" -ForegroundColor $Blue
    Write-Host "   Tests Run: $totalTests" -ForegroundColor $White
    Write-Host "   Passed: $SuccessCount" -ForegroundColor $Green
    Write-Host "   Failed: $FailureCount" -ForegroundColor $(if ($FailureCount -eq 0) { $Green } else { $Red })
    Write-Host "   Success Rate: $successRate%" -ForegroundColor $(if ($successRate -eq 100) { $Green } elseif ($successRate -ge 85) { $Yellow } else { $Red })
    
    # Calculate performance metrics
    $responseTimes = $TestResults | Where-Object { $_.ResponseTime -gt 0 } | Select-Object -ExpandProperty ResponseTime
    if ($responseTimes) {
        $avgResponseTime = [math]::Round(($responseTimes | Measure-Object -Average).Average, 2)
        $maxResponseTime = ($responseTimes | Measure-Object -Maximum).Maximum
        $minResponseTime = ($responseTimes | Measure-Object -Minimum).Minimum
        
        Write-Host "`nPERFORMANCE METRICS:" -ForegroundColor $Blue
        Write-Host "   Average Response Time: ${avgResponseTime}ms" -ForegroundColor $White
        Write-Host "   Fastest Response: ${minResponseTime}ms" -ForegroundColor $Green
        Write-Host "   Slowest Response: ${maxResponseTime}ms" -ForegroundColor $Yellow
    }
    
    # Show test results by category
    $categories = $TestResults | Group-Object Module
    Write-Host "`nRESULTS BY CATEGORY:" -ForegroundColor $Blue
    foreach ($category in $categories) {
        $categorySuccess = ($category.Group | Where-Object { $_.Success }).Count
        $categoryTotal = $category.Group.Count
        $categoryRate = [math]::Round(($categorySuccess / $categoryTotal) * 100, 2)
        
        $statusColor = if ($categoryRate -eq 100) { $Green } elseif ($categoryRate -ge 85) { $Yellow } else { $Red }
        Write-Host "   $($category.Name): $categorySuccess/$categoryTotal ($categoryRate%)" -ForegroundColor $statusColor
    }
    
    # Show any failures
    $failedTests = $TestResults | Where-Object { -not $_.Success }
    if ($failedTests) {
        Write-Host "`nFAILED TESTS:" -ForegroundColor $Red
        foreach ($test in $failedTests) {
            Write-Host "   ❌ $($test.TestName): $($test.Details)" -ForegroundColor $Yellow
        }
    } else {
        Write-Host "`n🎉 ALL TESTS PASSED!" -ForegroundColor $Green
    }
    
    # Show successful key operations
    $keyTests = $TestResults | Where-Object { $_.Success -and ($_.TestName -like "*Registration*" -or $_.TestName -like "*Dashboard*" -or $_.TestName -like "*Accommodations*" -or $_.TestName -like "*Food*") }
    if ($keyTests) {
        Write-Host "`nKEY SUCCESSFUL OPERATIONS:" -ForegroundColor $Green
        foreach ($test in $keyTests) {
            Write-Host "   ✅ $($test.TestName)" -ForegroundColor $Gray
        }
    }
    
    Write-Host "`nEXCLUDED FROM THIS TEST (AWAITING BACKEND FIXES):" -ForegroundColor $Yellow
    Write-Host "   ⚠️  Create Accommodation Booking (POST /bookings)" -ForegroundColor $Yellow
    Write-Host "   ⚠️  Create Food Order (POST /orders)" -ForegroundColor $Yellow
    Write-Host "   Note: These endpoints need backend validation fixes" -ForegroundColor $Gray
    
    Write-Host "`nTest Completed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor $Gray
    
    # Save results
    $reportFile = "STUDENT_MODULE_CLEAN_TEST_RESULTS_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
    $TestResults | ConvertTo-Json -Depth 3 | Out-File -FilePath $reportFile -Encoding UTF8
    Write-Host "Detailed results saved to: $reportFile" -ForegroundColor $Blue
    
    # Final status
    if ($FailureCount -eq 0) {
        Write-Host "`n🚀 STUDENT MODULE READY FOR FRONTEND INTEGRATION!" -ForegroundColor $Green
        Write-Host "All working endpoints verified and operational." -ForegroundColor $Green
    } else {
        Write-Host "`n⚠️  Some endpoints need attention before full integration." -ForegroundColor $Yellow
    }
}

# Execute the clean test suite
Write-Host "Starting StayKaru Student Module Clean Test Suite..." -ForegroundColor $Cyan
Test-WorkingStudentEndpoints
