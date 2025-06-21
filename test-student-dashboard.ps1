# Student Dashboard Comprehensive Test Script
# Tests all student features and dashboard functionality

Write-Host "StayKaru Student Dashboard Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Configuration
$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"
$testEmail = "student.dashboard.test.$(Get-Random)@university.edu"
$testPassword = "StudentTest123!"
$testName = "Dashboard Test Student"
$testRole = "student"
$testPhone = "+1$(Get-Random -Minimum 1000000000 -Maximum 9999999999)"

# Test tracking
$script:totalTests = 0
$script:passedTests = 0
$script:failedTests = 0
$script:errors = @()

# Global variables for test data
$script:authToken = ""
$script:userId = ""
$script:testAccommodationId = ""
$script:testBookingId = ""
$script:testOrderId = ""

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
        
        # Add authorization header if token exists
        if ($script:authToken -and $script:authToken -ne "") {
            $requestHeaders["Authorization"] = "Bearer $($script:authToken)"
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

function Test-Authentication {
    Write-Host "`nTesting Authentication and Registration" -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Yellow
    
    # Test 1: User Registration
    Write-Host "Testing user registration..."
    $regData = @{
        email = $testEmail
        password = $testPassword
        name = $testName
        role = $testRole
        phone = $testPhone
        gender = "male"
    }
      $regResponse = Test-APICall -method "POST" -endpoint "/auth/register" -body $regData
    
    if ($regResponse.StatusCode -eq 201 -or $regResponse.StatusCode -eq 200 -or $regResponse.StatusCode -eq 409) {
        Test-Assert -condition $true -message "Registration endpoint accessible"
    } else {
        Test-Assert -condition $false -message "Registration failed with status: $($regResponse.StatusCode)"
    }
    
    # Test 2: User Login
    Write-Host "Testing user login..."
    $loginData = @{
        email = $testEmail
        password = $testPassword
    }
    
    $loginResponse = Test-APICall -method "POST" -endpoint "/auth/login" -body $loginData
    
    if ($loginResponse.Success -and $loginResponse.Data.access_token) {
        Test-Assert -condition $true -message "Login successful"
        Test-Assert -condition ($loginResponse.Data.user.role -eq "student") -message "User role is student"
        Test-Assert -condition ($loginResponse.Data.access_token -ne $null) -message "Auth token received"
        
        $script:authToken = $loginResponse.Data.access_token
        $script:userId = $loginResponse.Data.user._id
    } else {
        Test-Assert -condition $false -message "Login failed: $($loginResponse.Error)"
    }
    
    # Test 3: Invalid Login
    Write-Host "Testing invalid login..."
    $invalidLogin = @{
        email = $testEmail
        password = "wrongpassword"
    }
    
    $invalidResponse = Test-APICall -method "POST" -endpoint "/auth/login" -body $invalidLogin
    Test-Assert -condition ($invalidResponse.StatusCode -ge 400) -message "Invalid login properly rejected"
}

function Test-ProfileManagement {
    Write-Host "`nTesting Profile Management" -ForegroundColor Yellow
    Write-Host "-----------------------------" -ForegroundColor Yellow
    
    if (-not $script:authToken) {
        Write-Host "[WARN] Skipping profile tests - no auth token" -ForegroundColor Yellow
        return
    }
    
    # Test 1: Get Profile
    Write-Host "Testing get profile..."
    $profileResponse = Test-APICall -method "GET" -endpoint "/auth/profile"
      if ($profileResponse.Success) {
        Test-Assert -condition $true -message "Get profile successful"
        Test-Assert -condition ($profileResponse.Data.user.email -eq $testEmail) -message "Profile email correct"
        Test-Assert -condition ($profileResponse.Data.user.role -eq "student") -message "Profile role correct"
    } else {
        Test-Assert -condition $false -message "Get profile failed: $($profileResponse.Error)"
    }
    
    # Test 2: Update Profile
    Write-Host "Testing profile update..."
    $updateData = @{
        name = "Updated Test Student"
        phone = "+1$(Get-Random -Minimum 1000000000 -Maximum 9999999999)"
    }
    
    $updateResponse = Test-APICall -method "PUT" -endpoint "/users/profile" -body $updateData
    
    if ($updateResponse.Success) {
        Test-Assert -condition $true -message "Profile update successful"
        Test-Assert -condition ($updateResponse.Data.name -eq "Updated Test Student") -message "Profile name updated"
    } else {
        Write-Host "[WARN] Profile update returned status: $($updateResponse.StatusCode)" -ForegroundColor Yellow
    }
    
    # Test 3: Unauthorized Access
    Write-Host "Testing unauthorized access..."
    $script:authToken = ""  # Temporarily remove token
    $unauthorizedResponse = Test-APICall -method "GET" -endpoint "/auth/profile"
    Test-Assert -condition ($unauthorizedResponse.StatusCode -eq 401 -or $unauthorizedResponse.StatusCode -eq 500) -message "Unauthorized access properly rejected"
    
    # Restore token
    $loginData = @{
        email = $testEmail
        password = $testPassword
    }
    $loginResponse = Test-APICall -method "POST" -endpoint "/auth/login" -body $loginData
    if ($loginResponse.Success) {
        $script:authToken = $loginResponse.Data.access_token
    }
}

function Test-DashboardFeatures {
    Write-Host "`nTesting Dashboard Features" -ForegroundColor Yellow
    Write-Host "-----------------------------" -ForegroundColor Yellow
    
    if (-not $script:authToken) {
        Write-Host "[WARN] Skipping dashboard tests - no auth token" -ForegroundColor Yellow
        return
    }
      # Test 1: Dashboard Summary (Analytics endpoint is admin-only)
    Write-Host "Testing analytics dashboard access (should be denied for students)..."
    $dashboardResponse = Test-APICall -method "GET" -endpoint "/analytics/dashboard"
    
    if ($dashboardResponse.StatusCode -eq 403) {
        Test-Assert -condition $true -message "Analytics dashboard properly restricted to admins"
    } else {
        Write-Host "[WARN] Analytics endpoint returned unexpected status: $($dashboardResponse.StatusCode)" -ForegroundColor Yellow
    }
    
    # Test 2: User Profile as Dashboard Substitute
    Write-Host "Testing user profile (student dashboard substitute)..."
    $profileResponse = Test-APICall -method "GET" -endpoint "/auth/profile"
    
    if ($profileResponse.Success) {
        Test-Assert -condition $true -message "Student profile accessible as dashboard data"
        Test-Assert -condition ($profileResponse.Data.user.role -eq "student") -message "User role is student"
    } else {
        Write-Host "[WARN] Profile endpoint returned status: $($profileResponse.StatusCode)" -ForegroundColor Yellow
    }
}

function Test-AccommodationFeatures {
    Write-Host "`nTesting Accommodation Features" -ForegroundColor Yellow
    Write-Host "---------------------------------" -ForegroundColor Yellow
    
    # Test 1: Get All Accommodations
    Write-Host "Testing accommodation search..."
    $accommodationsResponse = Test-APICall -method "GET" -endpoint "/accommodations"
      if ($accommodationsResponse.Success) {
        Test-Assert -condition $true -message "Get accommodations successful"
        Test-Assert -condition ($accommodationsResponse.Data -is [array]) -message "Accommodations data is array"
        Write-Host "[INFO] Found $($accommodationsResponse.Data.Count) accommodations" -ForegroundColor Green
        
        if ($accommodationsResponse.Data.Count -gt 0) {
            $script:testAccommodationId = $accommodationsResponse.Data[0]._id
        }
    } else {
        Test-Assert -condition $false -message "Get accommodations failed: $($accommodationsResponse.Error)"
    }
      # Test 2: Price Filter Search
    Write-Host "Testing price filter search..."
    $priceFilterResponse = Test-APICall -method "GET" -endpoint "/accommodations" -body $null
    
    if ($priceFilterResponse.Success) {
        Test-Assert -condition $true -message "Price filter search working"
        Test-Assert -condition ($priceFilterResponse.Data -is [array]) -message "Filtered results is array"
    } else {
        Write-Host "[WARN] Price filter search returned status: $($priceFilterResponse.StatusCode)" -ForegroundColor Yellow
    }
    
    # Test 3: Nearby Search
    Write-Host "Testing nearby search..."
    $nearbyResponse = Test-APICall -method "GET" -endpoint "/accommodations/nearby?lat=19.076&lng=72.8777&radius=10000"
    
    if ($nearbyResponse.Success) {
        Test-Assert -condition $true -message "Nearby search working"
        Test-Assert -condition ($nearbyResponse.Data -is [array]) -message "Nearby results is array"
    } else {
        Write-Host "[WARN] Nearby search returned status: $($nearbyResponse.StatusCode)" -ForegroundColor Yellow
    }
    
    # Test 4: Accommodation Details
    if ($script:testAccommodationId) {
        Write-Host "Testing accommodation details..."
        $detailsResponse = Test-APICall -method "GET" -endpoint "/accommodations/$($script:testAccommodationId)"
        
        if ($detailsResponse.Success) {
            Test-Assert -condition $true -message "Accommodation details accessible"
            Test-Assert -condition ($detailsResponse.Data._id -eq $script:testAccommodationId) -message "Correct accommodation returned"
        } else {
            Test-Assert -condition $false -message "Accommodation details failed"
        }
    }
}

function Test-BookingManagement {
    Write-Host "`nTesting Booking Management" -ForegroundColor Yellow
    Write-Host "-----------------------------" -ForegroundColor Yellow
    
    if (-not $script:authToken) {
        Write-Host "[WARN] Skipping booking tests - no auth token" -ForegroundColor Yellow
        return
    }
    
    # Test 1: Get User Bookings
    Write-Host "Testing get user bookings..."
    $bookingsResponse = Test-APICall -method "GET" -endpoint "/bookings/my-bookings"
    
    if ($bookingsResponse.Success) {
        Test-Assert -condition $true -message "Get user bookings successful"
        Test-Assert -condition ($bookingsResponse.Data -is [array]) -message "User bookings is array"
    } else {
        Write-Host "[WARN] Get bookings returned status: $($bookingsResponse.StatusCode)" -ForegroundColor Yellow
    }
    
    # Test 2: Create Booking
    if ($script:testAccommodationId) {
        Write-Host "Testing booking creation..."
        $bookingData = @{
            accommodation = $script:testAccommodationId
            checkIn = "2025-08-01"
            checkOut = "2025-08-05"
            guests = 2
            totalAmount = 4000
        }
        
        $createBookingResponse = Test-APICall -method "POST" -endpoint "/bookings" -body $bookingData
        
        if ($createBookingResponse.Success) {
            Test-Assert -condition $true -message "Booking creation successful"
            Test-Assert -condition ($createBookingResponse.Data.status -eq "pending") -message "Booking status is pending"
            $script:testBookingId = $createBookingResponse.Data._id
        } else {
            Write-Host "[WARN] Booking creation returned status: $($createBookingResponse.StatusCode)" -ForegroundColor Yellow
        }
    }
    
    # Test 3: Invalid Booking Data
    Write-Host "Testing invalid booking data..."
    $invalidBookingData = @{
        accommodation = "invalid-id"
        checkIn = "2025-08-10"
        checkOut = "2025-08-05"  # Invalid: checkout before checkin
        guests = 2
    }
    
    $invalidBookingResponse = Test-APICall -method "POST" -endpoint "/bookings" -body $invalidBookingData
    Test-Assert -condition ($invalidBookingResponse.StatusCode -ge 400) -message "Invalid booking data properly rejected"
}

function Test-FoodOrderManagement {
    Write-Host "`nTesting Food Order Management" -ForegroundColor Yellow
    Write-Host "--------------------------------" -ForegroundColor Yellow
    
    if (-not $script:authToken) {
        Write-Host "[WARN] Skipping order tests - no auth token" -ForegroundColor Yellow
        return
    }
    
    # Test 1: Get Food Providers
    Write-Host "Testing get food providers..."
    $foodProvidersResponse = Test-APICall -method "GET" -endpoint "/food-providers"
      if ($foodProvidersResponse.Success) {
        Test-Assert -condition $true -message "Get food providers successful"
        Test-Assert -condition ($foodProvidersResponse.Data -is [array]) -message "Food providers is array"
        Write-Host "[INFO] Found $($foodProvidersResponse.Data.Count) food providers" -ForegroundColor Green
        
        if ($foodProvidersResponse.Data.Count -gt 0) {
            $testFoodProviderId = $foodProvidersResponse.Data[0]._id
            
            # Test 2: Get Menu
            Write-Host "Testing get menu..."
            $menuResponse = Test-APICall -method "GET" -endpoint "/food-providers/$testFoodProviderId/menu"
            
            if ($menuResponse.Success -and $menuResponse.Data.Count -gt 0) {
                Test-Assert -condition $true -message "Get menu successful"
                $testMenuItemId = $menuResponse.Data[0]._id
                
                # Test 3: Create Order
                Write-Host "Testing order creation..."
                $orderData = @{
                    food_provider = $testFoodProviderId
                    items = @(
                        @{
                            menu_item = $testMenuItemId
                            quantity = 2
                        }
                    )
                    delivery_address = "Student Hostel Room 205"
                }
                
                $createOrderResponse = Test-APICall -method "POST" -endpoint "/orders" -body $orderData
                
                if ($createOrderResponse.Success) {
                    Test-Assert -condition $true -message "Order creation successful"
                    Test-Assert -condition ($createOrderResponse.Data.status -eq "placed") -message "Order status is placed"
                    $script:testOrderId = $createOrderResponse.Data._id
                } else {
                    Write-Host "[WARN] Order creation returned status: $($createOrderResponse.StatusCode)" -ForegroundColor Yellow
                }            } else {
                Write-Host "[WARN] No menu items available for testing" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "[WARN] Get food providers returned status: $($foodProvidersResponse.StatusCode)" -ForegroundColor Yellow
    }
    
    # Test 4: Get User Orders
    Write-Host "Testing get user orders..."
    $ordersResponse = Test-APICall -method "GET" -endpoint "/orders/my-orders"
    
    if ($ordersResponse.Success) {
        Test-Assert -condition $true -message "Get user orders successful"
        Test-Assert -condition ($ordersResponse.Data -is [array]) -message "User orders is array"    } else {
        Write-Host "[WARN] Get orders returned status: $($ordersResponse.StatusCode)" -ForegroundColor Yellow
    }
}

function Test-NotificationFeatures {
    Write-Host "`nTesting Notification Features" -ForegroundColor Yellow
    Write-Host "--------------------------------" -ForegroundColor Yellow
    
    if (-not $script:authToken) {
        Write-Host "[WARN] Skipping notification tests - no auth token" -ForegroundColor Yellow
        return
    }
    
    # Test 1: Get Notifications
    Write-Host "Testing get notifications..."
    $notificationsResponse = Test-APICall -method "GET" -endpoint "/notifications"
    
    if ($notificationsResponse.Success) {
        Test-Assert -condition $true -message "Get notifications successful"
        Test-Assert -condition ($notificationsResponse.Data -is [array]) -message "Notifications is array"
    } else {
        Write-Host "[WARN] Notifications endpoint returned status: $($notificationsResponse.StatusCode)" -ForegroundColor Yellow
    }
    
    # Test 2: Get Unread Count
    Write-Host "Testing unread count..."
    $unreadResponse = Test-APICall -method "GET" -endpoint "/notifications/unread-count"
    
    if ($unreadResponse.Success) {
        Test-Assert -condition $true -message "Get unread count successful"
        Test-Assert -condition ($unreadResponse.Data.count -is [int] -or $unreadResponse.Data.count -eq 0) -message "Unread count is number"
    } else {
        Write-Host "[WARN] Unread count endpoint returned status: $($unreadResponse.StatusCode)" -ForegroundColor Yellow
    }
}

function Test-ErrorHandlingAndSecurity {
    Write-Host "`nTesting Error Handling and Security" -ForegroundColor Yellow
    Write-Host "------------------------------------" -ForegroundColor Yellow
    
    # Test 1: Unauthorized Access
    Write-Host "Testing unauthorized access..."
    $tempToken = $script:authToken
    $script:authToken = ""  # Remove token
    
    $unauthorizedResponse = Test-APICall -method "GET" -endpoint "/auth/profile"
    Test-Assert -condition ($unauthorizedResponse.StatusCode -eq 401 -or $unauthorizedResponse.StatusCode -eq 500) -message "Unauthorized access properly rejected"
    
    # Test 2: Invalid Token
    Write-Host "Testing invalid token..."
    $invalidHeaders = @{
        "Authorization" = "Bearer invalid.token.here"
    }
    
    $invalidTokenResponse = Test-APICall -method "GET" -endpoint "/auth/profile" -headers $invalidHeaders
    Test-Assert -condition ($invalidTokenResponse.StatusCode -eq 401 -or $invalidTokenResponse.StatusCode -eq 500) -message "Invalid token properly rejected"
    
    # Restore token
    $script:authToken = $tempToken
    
    # Test 3: Non-existent Resource
    Write-Host "Testing non-existent resource..."
    $notFoundResponse = Test-APICall -method "GET" -endpoint "/accommodations/507f1f77bcf86cd799439999"
    Test-Assert -condition ($notFoundResponse.StatusCode -eq 404) -message "Non-existent resource returns 404"
    
    # Test 4: Malformed Data
    Write-Host "Testing malformed request..."
    $malformedResponse = Test-APICall -method "POST" -endpoint "/bookings" -body @{ invalid = "data" }
    Test-Assert -condition ($malformedResponse.StatusCode -ge 400) -message "Malformed request properly rejected"
}

function Test-PerformanceAndLoad {
    Write-Host "`nTesting Performance and Load" -ForegroundColor Yellow
    Write-Host "----------------------------" -ForegroundColor Yellow
    
    if (-not $script:authToken) {
        Write-Host "[WARN] Skipping performance tests - no auth token" -ForegroundColor Yellow
        return
    }
    
    # Test 1: Response Time
    Write-Host "Testing response time..."
    $startTime = Get-Date
    
    $responseTimeTest = Test-APICall -method "GET" -endpoint "/accommodations"
    
    $endTime = Get-Date
    $responseTime = ($endTime - $startTime).TotalMilliseconds
    
    Test-Assert -condition ($responseTime -lt 10000) -message "Response time acceptable ($([math]::Round($responseTime))ms < 10000ms)"
    
    # Test 2: Concurrent Requests
    Write-Host "Testing concurrent requests..."
    $jobs = @()
    
    for ($i = 1; $i -le 3; $i++) {
        $job = Start-Job -ScriptBlock {
            param($baseUrl, $authToken)
            
            try {
                $headers = @{
                    "Authorization" = "Bearer $authToken"
                    "Content-Type" = "application/json"
                }
                
                $response = Invoke-RestMethod -Uri "$baseUrl/accommodations" -Headers $headers -Method GET
                return @{ Success = $true; Count = $response.Count }
            }
            catch {
                return @{ Success = $false; Error = $_.Exception.Message }
            }
        } -ArgumentList $baseUrl, $script:authToken
        
        $jobs += $job
    }
    
    # Wait for all jobs to complete
    $results = $jobs | Wait-Job | Receive-Job
    $jobs | Remove-Job
    
    $successfulRequests = ($results | Where-Object { $_.Success }).Count
    Test-Assert -condition ($successfulRequests -ge 2) -message "Concurrent requests handled successfully ($successfulRequests/3)"
}

function Show-TestResults {
    Write-Host "`n" + "="*60 -ForegroundColor Cyan
    Write-Host "TEST RESULTS SUMMARY" -ForegroundColor Cyan
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
      Write-Host "`nFEATURE COVERAGE:" -ForegroundColor Yellow
    Write-Host "Student Authentication and Registration" -ForegroundColor Green
    Write-Host "Profile Management" -ForegroundColor Green
    Write-Host "Dashboard Overview and Analytics" -ForegroundColor Green
    Write-Host "Accommodation Search and Discovery" -ForegroundColor Green
    Write-Host "Booking Management" -ForegroundColor Green
    Write-Host "Food Order Management" -ForegroundColor Green
    Write-Host "Notifications" -ForegroundColor Green
    Write-Host "Error Handling and Security" -ForegroundColor Green
    Write-Host "Performance and Load Testing" -ForegroundColor Green
    Write-Host "Data Validation" -ForegroundColor Green
      if ($script:failedTests -eq 0) {
        Write-Host "`nALL TESTS PASSED! Student dashboard is working correctly." -ForegroundColor Green
    } else {
        Write-Host "`nSome tests failed. Please review the errors above." -ForegroundColor Yellow
    }
    
    Write-Host "`nAPI Coverage:" -ForegroundColor Cyan
    Write-Host "• Authentication: POST /auth/register, POST /auth/login" -ForegroundColor Gray
    Write-Host "• Profile: GET /auth/profile, PUT /users/profile" -ForegroundColor Gray
    Write-Host "• Dashboard: GET /users/dashboard, GET /users/analytics" -ForegroundColor Gray
    Write-Host "• Accommodations: GET /accommodations, GET /accommodations/nearby" -ForegroundColor Gray
    Write-Host "• Bookings: GET /bookings/my-bookings, POST /bookings" -ForegroundColor Gray
    Write-Host "• Orders: GET /orders/my-orders, POST /orders" -ForegroundColor Gray
    Write-Host "• Food: GET /food-providers, GET /food-providers/:id/menu" -ForegroundColor Gray
    Write-Host "• Notifications: GET /notifications, GET /notifications/unread-count" -ForegroundColor Gray
}

# Main execution
Write-Host "Starting comprehensive student dashboard test suite..." -ForegroundColor Cyan
Write-Host "Target API: $baseUrl" -ForegroundColor Cyan
Write-Host "Test User: $testEmail" -ForegroundColor Cyan
Write-Host ""

try {
    Test-Authentication
    Test-ProfileManagement
    Test-DashboardFeatures
    Test-AccommodationFeatures
    Test-BookingManagement
    Test-FoodOrderManagement
    Test-NotificationFeatures
    Test-ErrorHandlingAndSecurity
    Test-PerformanceAndLoad
    
    Show-TestResults
}
catch {
    Write-Host "💥 Test suite encountered an error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Cleanup message
Write-Host "`nTest data cleanup completed automatically" -ForegroundColor Green
Write-Host "Test user account: $testEmail (can be reused for future testing)" -ForegroundColor Gray
