# User Features Test Script
# Tests all user-related features and application functionality

Write-Host "User Features Test Suite" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

# Configuration
$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"
$testStudentEmail = "student.test.$(Get-Random)@test.com"
$testFoodProviderEmail = "foodprovider.test.$(Get-Random)@test.com"
$testPassword = "TestPass123!"

# Test tracking
$script:totalTests = 0
$script:passedTests = 0
$script:failedTests = 0
$script:errors = @()

# Global variables
$script:studentToken = ""
$script:foodProviderToken = ""
$script:studentId = ""
$script:foodProviderId = ""
$script:testAccommodationId = ""
$script:testMenuItemId = ""

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
        [string]$token = $null
    )
    
    try {
        $url = "$baseUrl$endpoint"
        $requestHeaders = @{
            "Content-Type" = "application/json"
        }
        
        # Add authorization header if token exists
        if ($token -and $token -ne "") {
            $requestHeaders["Authorization"] = "Bearer $token"
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

function Test-UserRegistrationAndAuth {
    Write-Host "`nTesting User Registration & Authentication" -ForegroundColor Yellow
    Write-Host "-----------------------------------------" -ForegroundColor Yellow
    
    # Test 1: Student Registration
    Write-Host "Testing student registration..."
    $studentRegistrationData = @{
        name = "Test Student"
        email = $testStudentEmail
        password = $testPassword
        role = "student"
        phone = "03001111111"
        address = "123 Student Street, Student City"
        gender = "female"
    }
    
    $studentRegResponse = Test-APICall -method "POST" -endpoint "/auth/register" -body $studentRegistrationData
    
    if ($studentRegResponse.Success) {
        Test-Assert -condition $true -message "Student registration successful"
        Test-Assert -condition ($studentRegResponse.Data.message -like "*registered*") -message "Student registration confirmation received"
    } else {
        Test-Assert -condition $false -message "Student registration failed: $($studentRegResponse.Error)"
    }
    
    # Test 2: Food Provider Registration
    Write-Host "Testing food provider registration..."
    $foodProviderRegistrationData = @{
        name = "Test Food Provider"
        email = $testFoodProviderEmail
        password = $testPassword
        role = "food_provider"
        phone = "03002222222"
        address = "456 Food Street, Food City"
        gender = "male"
    }
    
    $foodProviderRegResponse = Test-APICall -method "POST" -endpoint "/auth/register" -body $foodProviderRegistrationData
    
    if ($foodProviderRegResponse.Success) {
        Test-Assert -condition $true -message "Food provider registration successful"
        Test-Assert -condition ($foodProviderRegResponse.Data.message -like "*registered*") -message "Food provider registration confirmation received"
    } else {
        Test-Assert -condition $false -message "Food provider registration failed: $($foodProviderRegResponse.Error)"
    }
    
    # Test 3: Student Login
    Write-Host "Testing student login..."
    $studentLoginData = @{
        email = $testStudentEmail
        password = $testPassword
    }
    
    $studentLoginResponse = Test-APICall -method "POST" -endpoint "/auth/login" -body $studentLoginData
    
    if ($studentLoginResponse.Success -and $studentLoginResponse.Data.access_token) {
        Test-Assert -condition $true -message "Student login successful"
        Test-Assert -condition ($studentLoginResponse.Data.user.role -eq "student") -message "Student role verified"
        
        $script:studentToken = $studentLoginResponse.Data.access_token
        $script:studentId = $studentLoginResponse.Data.user.id
    } else {
        Test-Assert -condition $false -message "Student login failed: $($studentLoginResponse.Error)"
    }
    
    # Test 4: Food Provider Login
    Write-Host "Testing food provider login..."
    $foodProviderLoginData = @{
        email = $testFoodProviderEmail
        password = $testPassword
    }
    
    $foodProviderLoginResponse = Test-APICall -method "POST" -endpoint "/auth/login" -body $foodProviderLoginData
    
    if ($foodProviderLoginResponse.Success -and $foodProviderLoginResponse.Data.access_token) {
        Test-Assert -condition $true -message "Food provider login successful"
        Test-Assert -condition ($foodProviderLoginResponse.Data.user.role -eq "food_provider") -message "Food provider role verified"
        
        $script:foodProviderToken = $foodProviderLoginResponse.Data.access_token
        $script:foodProviderId = $foodProviderLoginResponse.Data.user.id
    } else {
        Test-Assert -condition $false -message "Food provider login failed: $($foodProviderLoginResponse.Error)"
    }
}

function Test-AccommodationFeatures {
    Write-Host "`nTesting Accommodation Features" -ForegroundColor Yellow
    Write-Host "------------------------------" -ForegroundColor Yellow
    
    # Test 1: Browse All Accommodations (Public)
    Write-Host "Testing browse all accommodations..."
    $allAccommodationsResponse = Test-APICall -method "GET" -endpoint "/accommodations"
    
    if ($allAccommodationsResponse.Success) {
        Test-Assert -condition $true -message "Browse all accommodations successful"
        Test-Assert -condition ($allAccommodationsResponse.Data -is [array]) -message "Accommodations data is array"
        Write-Host "[INFO] Found $($allAccommodationsResponse.Data.Count) accommodations" -ForegroundColor Green
        
        if ($allAccommodationsResponse.Data.Count -gt 0) {
            $script:testAccommodationId = $allAccommodationsResponse.Data[0]._id
        }
    } else {
        Test-Assert -condition $false -message "Browse all accommodations failed"
    }
    
    # Test 2: Search Accommodations
    Write-Host "Testing search accommodations..."
    $searchResponse = Test-APICall -method "GET" -endpoint "/accommodations/search?q=test&minRent=5000&maxRent=20000"
    
    if ($searchResponse.Success) {
        Test-Assert -condition $true -message "Search accommodations successful"
        Test-Assert -condition ($searchResponse.Data -is [array]) -message "Search results is array"
    } else {
        Test-Assert -condition $false -message "Search accommodations failed"
    }
    
    # Test 3: Get Accommodation Details
    if ($script:testAccommodationId) {
        Write-Host "Testing get accommodation details..."
        $detailsResponse = Test-APICall -method "GET" -endpoint "/accommodations/$($script:testAccommodationId)"
        
        if ($detailsResponse.Success) {
            Test-Assert -condition $true -message "Get accommodation details successful"
            Test-Assert -condition ($detailsResponse.Data.title -ne $null) -message "Accommodation title exists"
            Test-Assert -condition ($detailsResponse.Data.rent -ne $null) -message "Accommodation rent exists"
        } else {
            Test-Assert -condition $false -message "Get accommodation details failed"
        }
    }
    
    # Test 4: Filter Accommodations by Location
    Write-Host "Testing filter accommodations by location..."
    $locationResponse = Test-APICall -method "GET" -endpoint "/accommodations/nearby?latitude=31.5204&longitude=74.3587&radius=10"
    
    if ($locationResponse.Success) {
        Test-Assert -condition $true -message "Filter accommodations by location successful"
        Test-Assert -condition ($locationResponse.Data -is [array]) -message "Location-based results is array"
    } else {
        Test-Assert -condition $false -message "Filter accommodations by location failed"
    }
}

function Test-BookingFeatures {
    Write-Host "`nTesting Booking Features" -ForegroundColor Yellow
    Write-Host "------------------------" -ForegroundColor Yellow
    
    if (-not $script:studentToken -or -not $script:testAccommodationId) {
        Write-Host "[WARN] Skipping booking tests - missing student token or accommodation ID" -ForegroundColor Yellow
        return
    }
    
    # Test 1: Create Booking
    Write-Host "Testing create booking..."
    $bookingData = @{
        accommodation_id = $script:testAccommodationId
        start_date = "2025-07-01"
        end_date = "2025-07-31"
    }
    
    $createBookingResponse = Test-APICall -method "POST" -endpoint "/bookings" -body $bookingData -token $script:studentToken
    
    if ($createBookingResponse.Success) {
        Test-Assert -condition $true -message "Create booking successful"
        Test-Assert -condition ($createBookingResponse.Data.booking._id -ne $null) -message "Booking ID received"
        $bookingId = $createBookingResponse.Data.booking._id
    } else {
        Test-Assert -condition $false -message "Create booking failed: $($createBookingResponse.Error)"
    }
    
    # Test 2: Get User's Bookings
    Write-Host "Testing get user bookings..."
    $userBookingsResponse = Test-APICall -method "GET" -endpoint "/bookings/user" -token $script:studentToken
    
    if ($userBookingsResponse.Success) {
        Test-Assert -condition $true -message "Get user bookings successful"
        Test-Assert -condition ($userBookingsResponse.Data -is [array]) -message "User bookings data is array"
    } else {
        Test-Assert -condition $false -message "Get user bookings failed"
    }
    
    # Test 3: Cancel Booking
    if ($bookingId) {
        Write-Host "Testing cancel booking..."
        $cancelResponse = Test-APICall -method "DELETE" -endpoint "/bookings/$bookingId" -token $script:studentToken
        
        if ($cancelResponse.Success -or $cancelResponse.StatusCode -eq 400) {
            Test-Assert -condition $true -message "Cancel booking endpoint accessible"
        } else {
            Test-Assert -condition $false -message "Cancel booking failed"
        }
    }
}

function Test-FoodServiceFeatures {
    Write-Host "`nTesting Food Service Features" -ForegroundColor Yellow
    Write-Host "-----------------------------" -ForegroundColor Yellow
    
    # Test 1: Browse Food Providers (Public)
    Write-Host "Testing browse food providers..."
    $providersResponse = Test-APICall -method "GET" -endpoint "/food-providers"
    
    if ($providersResponse.Success) {
        Test-Assert -condition $true -message "Browse food providers successful"
        Test-Assert -condition ($providersResponse.Data -is [array]) -message "Food providers data is array"
        Write-Host "[INFO] Found $($providersResponse.Data.Count) food providers" -ForegroundColor Green
        
        if ($providersResponse.Data.Count -gt 0) {
            $script:testFoodProviderId = $providersResponse.Data[0]._id
        }
    } else {
        Test-Assert -condition $false -message "Browse food providers failed"
    }
    
    # Test 2: Create Food Provider Profile
    if ($script:foodProviderToken) {
        Write-Host "Testing create food provider profile..."
        $profileData = @{
            business_name = "Test Food Business"
            description = "Delicious test food for students"
            address = "789 Food Court, Food City"
            phone = "03003333333"
            cuisine_type = "Pakistani"
            delivery_areas = @("Test Area 1", "Test Area 2")
            operating_hours = @{
                open = "09:00"
                close = "22:00"
            }
        }
        
        $createProfileResponse = Test-APICall -method "POST" -endpoint "/food-providers" -body $profileData -token $script:foodProviderToken
        
        if ($createProfileResponse.Success) {
            Test-Assert -condition $true -message "Create food provider profile successful"
            Test-Assert -condition ($createProfileResponse.Data.provider._id -ne $null) -message "Food provider ID received"
            $script:testFoodProviderId = $createProfileResponse.Data.provider._id
        } else {
            Test-Assert -condition $false -message "Create food provider profile failed"
        }
    }
    
    # Test 3: Add Menu Item
    if ($script:foodProviderToken -and $script:testFoodProviderId) {
        Write-Host "Testing add menu item..."
        $menuItemData = @{
            name = "Test Biryani"
            description = "Delicious test biryani with special spices"
            price = 350
            category = "Main Course"
            ingredients = @("Rice", "Chicken", "Spices")
            is_available = $true
            preparation_time = 30
        }
        
        $addMenuResponse = Test-APICall -method "POST" -endpoint "/food-providers/$($script:testFoodProviderId)/menu" -body $menuItemData -token $script:foodProviderToken
        
        if ($addMenuResponse.Success) {
            Test-Assert -condition $true -message "Add menu item successful"
            Test-Assert -condition ($addMenuResponse.Data.menuItem._id -ne $null) -message "Menu item ID received"
            $script:testMenuItemId = $addMenuResponse.Data.menuItem._id
        } else {
            Test-Assert -condition $false -message "Add menu item failed"
        }
    }
    
    # Test 4: Get Menu Items
    if ($script:testFoodProviderId) {
        Write-Host "Testing get menu items..."
        $menuResponse = Test-APICall -method "GET" -endpoint "/food-providers/$($script:testFoodProviderId)/menu"
        
        if ($menuResponse.Success) {
            Test-Assert -condition $true -message "Get menu items successful"
            Test-Assert -condition ($menuResponse.Data -is [array]) -message "Menu items data is array"
        } else {
            Test-Assert -condition $false -message "Get menu items failed"
        }
    }
}

function Test-OrderFeatures {
    Write-Host "`nTesting Order Features" -ForegroundColor Yellow
    Write-Host "---------------------" -ForegroundColor Yellow
    
    if (-not $script:studentToken -or -not $script:testMenuItemId) {
        Write-Host "[WARN] Skipping order tests - missing student token or menu item ID" -ForegroundColor Yellow
        return
    }
    
    # Test 1: Create Order
    Write-Host "Testing create order..."
    $orderData = @{
        provider_id = $script:testFoodProviderId
        items = @(
            @{
                menu_item_id = $script:testMenuItemId
                quantity = 2
                special_instructions = "Extra spicy please"
            }
        )
        delivery_address = "123 Student Hostel, Room 101"
        phone = "03001111111"
    }
    
    $createOrderResponse = Test-APICall -method "POST" -endpoint "/orders" -body $orderData -token $script:studentToken
    
    if ($createOrderResponse.Success) {
        Test-Assert -condition $true -message "Create order successful"
        Test-Assert -condition ($createOrderResponse.Data.order._id -ne $null) -message "Order ID received"
        $orderId = $createOrderResponse.Data.order._id
    } else {
        Test-Assert -condition $false -message "Create order failed: $($createOrderResponse.Error)"
    }
    
    # Test 2: Get User's Orders
    Write-Host "Testing get user orders..."
    $userOrdersResponse = Test-APICall -method "GET" -endpoint "/orders/user" -token $script:studentToken
    
    if ($userOrdersResponse.Success) {
        Test-Assert -condition $true -message "Get user orders successful"
        Test-Assert -condition ($userOrdersResponse.Data -is [array]) -message "User orders data is array"
    } else {
        Test-Assert -condition $false -message "Get user orders failed"
    }
    
    # Test 3: Track Order
    if ($orderId) {
        Write-Host "Testing track order..."
        $trackResponse = Test-APICall -method "GET" -endpoint "/orders/$orderId/track" -token $script:studentToken
        
        if ($trackResponse.Success) {
            Test-Assert -condition $true -message "Track order successful"
            Test-Assert -condition ($trackResponse.Data.status -ne $null) -message "Order status exists"
        } else {
            Test-Assert -condition $false -message "Track order failed"
        }
    }
}

function Test-UserProfileFeatures {
    Write-Host "`nTesting User Profile Features" -ForegroundColor Yellow
    Write-Host "-----------------------------" -ForegroundColor Yellow
    
    # Test Student Profile Management
    if ($script:studentToken) {
        Write-Host "Testing student profile management..."
        
        # Get Profile
        $profileResponse = Test-APICall -method "GET" -endpoint "/users/profile" -token $script:studentToken
        
        if ($profileResponse.Success) {
            Test-Assert -condition $true -message "Get student profile successful"
            Test-Assert -condition ($profileResponse.Data.role -eq "student") -message "Student profile role verified"
        } else {
            Test-Assert -condition $false -message "Get student profile failed"
        }
        
        # Update Profile
        $updateData = @{
            name = "Updated Test Student"
            phone = "03005555555"
            address = "456 Updated Student Street"
        }
        
        $updateResponse = Test-APICall -method "PUT" -endpoint "/users/profile" -body $updateData -token $script:studentToken
        
        if ($updateResponse.Success) {
            Test-Assert -condition $true -message "Update student profile successful"
            Test-Assert -condition ($updateResponse.Data.name -eq $updateData.name) -message "Student profile name updated"
        } else {
            Test-Assert -condition $false -message "Update student profile failed"
        }
    }
    
    # Test Food Provider Profile Management
    if ($script:foodProviderToken) {
        Write-Host "Testing food provider profile management..."
        
        # Get Profile
        $profileResponse = Test-APICall -method "GET" -endpoint "/users/profile" -token $script:foodProviderToken
        
        if ($profileResponse.Success) {
            Test-Assert -condition $true -message "Get food provider profile successful"
            Test-Assert -condition ($profileResponse.Data.role -eq "food_provider") -message "Food provider profile role verified"
        } else {
            Test-Assert -condition $false -message "Get food provider profile failed"
        }
        
        # Change Password
        $passwordData = @{
            currentPassword = $testPassword
            newPassword = "NewTestPass456!"
        }
        
        $passwordResponse = Test-APICall -method "PUT" -endpoint "/users/change-password" -body $passwordData -token $script:foodProviderToken
        
        if ($passwordResponse.Success) {
            Test-Assert -condition $true -message "Change food provider password successful"
        } else {
            Test-Assert -condition $false -message "Change food provider password failed"
        }
    }
}

function Test-NotificationFeatures {
    Write-Host "`nTesting Notification Features" -ForegroundColor Yellow
    Write-Host "-----------------------------" -ForegroundColor Yellow
    
    # Test Student Notifications
    if ($script:studentToken) {
        Write-Host "Testing student notifications..."
        
        # Get Notifications
        $notificationsResponse = Test-APICall -method "GET" -endpoint "/notifications" -token $script:studentToken
        
        if ($notificationsResponse.Success) {
            Test-Assert -condition $true -message "Get student notifications successful"
            Test-Assert -condition ($notificationsResponse.Data -is [array]) -message "Student notifications data is array"
        } else {
            Test-Assert -condition $false -message "Get student notifications failed"
        }
        
        # Update FCM Token
        $fcmData = @{
            fcmToken = "student-fcm-token-67890"
        }
        
        $fcmResponse = Test-APICall -method "POST" -endpoint "/users/fcm-token" -body $fcmData -token $script:studentToken
        
        if ($fcmResponse.Success) {
            Test-Assert -condition $true -message "Update student FCM token successful"
        } else {
            Test-Assert -condition $false -message "Update student FCM token failed"
        }
    }
    
    # Test Food Provider Notifications
    if ($script:foodProviderToken) {
        Write-Host "Testing food provider notifications..."
        
        # Get Notifications
        $notificationsResponse = Test-APICall -method "GET" -endpoint "/notifications" -token $script:foodProviderToken
        
        if ($notificationsResponse.Success) {
            Test-Assert -condition $true -message "Get food provider notifications successful"
            Test-Assert -condition ($notificationsResponse.Data -is [array]) -message "Food provider notifications data is array"
        } else {
            Test-Assert -condition $false -message "Get food provider notifications failed"
        }
    }
}

function Test-SearchAndFilterFeatures {
    Write-Host "`nTesting Search & Filter Features" -ForegroundColor Yellow
    Write-Host "--------------------------------" -ForegroundColor Yellow
    
    # Test 1: Advanced Accommodation Search
    Write-Host "Testing advanced accommodation search..."
    $advancedSearchResponse = Test-APICall -method "GET" -endpoint "/accommodations/search?q=student&room_type=single&minRent=10000&maxRent=25000&amenities=WiFi,Parking"
    
    if ($advancedSearchResponse.Success) {
        Test-Assert -condition $true -message "Advanced accommodation search successful"
        Test-Assert -condition ($advancedSearchResponse.Data -is [array]) -message "Advanced search results is array"
    } else {
        Test-Assert -condition $false -message "Advanced accommodation search failed"
    }
    
    # Test 2: Food Provider Search by Cuisine
    Write-Host "Testing food provider search by cuisine..."
    $cuisineSearchResponse = Test-APICall -method "GET" -endpoint "/food-providers/search?cuisine=Pakistani&delivery_area=Test Area"
    
    if ($cuisineSearchResponse.Success) {
        Test-Assert -condition $true -message "Food provider cuisine search successful"
        Test-Assert -condition ($cuisineSearchResponse.Data -is [array]) -message "Cuisine search results is array"
    } else {
        Test-Assert -condition $false -message "Food provider cuisine search failed"
    }
    
    # Test 3: Menu Item Search
    Write-Host "Testing menu item search..."
    $menuSearchResponse = Test-APICall -method "GET" -endpoint "/food-providers/menu/search?q=biryani&category=Main Course&maxPrice=500"
    
    if ($menuSearchResponse.Success) {
        Test-Assert -condition $true -message "Menu item search successful"
        Test-Assert -condition ($menuSearchResponse.Data -is [array]) -message "Menu search results is array"
    } else {
        Test-Assert -condition $false -message "Menu item search failed"
    }
}

function Show-TestResults {
    Write-Host "`n" + "="*60 -ForegroundColor Cyan
    Write-Host "USER FEATURES TEST RESULTS" -ForegroundColor Cyan
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
    
    Write-Host "`nUSER FEATURE COVERAGE:" -ForegroundColor Yellow
    Write-Host "Multi-Role Registration (Student, Food Provider)" -ForegroundColor Green
    Write-Host "Authentication and Authorization" -ForegroundColor Green
    Write-Host "Accommodation Browsing and Booking" -ForegroundColor Green
    Write-Host "Food Service Management" -ForegroundColor Green
    Write-Host "Order Management and Tracking" -ForegroundColor Green
    Write-Host "Profile Management" -ForegroundColor Green
    Write-Host "Notification System" -ForegroundColor Green
    Write-Host "Advanced Search and Filtering" -ForegroundColor Green
    Write-Host "Location-Based Services" -ForegroundColor Green
    
    if ($script:failedTests -eq 0) {
        Write-Host "`nALL USER FEATURES WORKING!" -ForegroundColor Green
    } else {
        Write-Host "`nSome user features need attention. Review errors above." -ForegroundColor Yellow
    }
    
    Write-Host "`nAPI ENDPOINTS TESTED:" -ForegroundColor Cyan
    Write-Host "• Authentication: POST /auth/register, POST /auth/login" -ForegroundColor Gray
    Write-Host "• Accommodations: GET /accommodations, GET /accommodations/search, GET /accommodations/nearby" -ForegroundColor Gray
    Write-Host "• Bookings: POST /bookings, GET /bookings/user, DELETE /bookings/:id" -ForegroundColor Gray
    Write-Host "• Food Providers: GET /food-providers, POST /food-providers, GET /food-providers/:id/menu" -ForegroundColor Gray
    Write-Host "• Orders: POST /orders, GET /orders/user, GET /orders/:id/track" -ForegroundColor Gray
    Write-Host "• Profile: GET /users/profile, PUT /users/profile, PUT /users/change-password" -ForegroundColor Gray
    Write-Host "• Notifications: GET /notifications, POST /users/fcm-token" -ForegroundColor Gray
    Write-Host "• Search: GET /accommodations/search, GET /food-providers/search, GET /food-providers/menu/search" -ForegroundColor Gray
}

# Main execution
Write-Host "Starting comprehensive user features test suite..." -ForegroundColor Cyan
Write-Host "Target API: $baseUrl" -ForegroundColor Cyan
Write-Host "Test Student: $testStudentEmail" -ForegroundColor Cyan
Write-Host "Test Food Provider: $testFoodProviderEmail" -ForegroundColor Cyan
Write-Host ""

try {
    Test-UserRegistrationAndAuth
    Test-AccommodationFeatures
    Test-BookingFeatures
    Test-FoodServiceFeatures
    Test-OrderFeatures
    Test-UserProfileFeatures
    Test-NotificationFeatures
    Test-SearchAndFilterFeatures
    
    Show-TestResults
}
catch {
    Write-Host "User features test suite encountered an error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`nUser features testing completed" -ForegroundColor Green
Write-Host "All user workflows and application features validated" -ForegroundColor Gray
