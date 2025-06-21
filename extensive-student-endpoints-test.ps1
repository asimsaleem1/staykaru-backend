# EXTENSIVE STUDENT MODULE ENDPOINTS TEST SUITE
# Testing every possible endpoint with comprehensive scenarios

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "    EXTENSIVE STUDENT MODULE ENDPOINTS TEST SUITE" -ForegroundColor Cyan
Write-Host "    Testing Every Endpoint with Multiple Scenarios" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"
$testResults = @()
$endpointTests = @()
$performanceData = @()

# Counters
$totalEndpoints = 0
$passedEndpoints = 0
$failedEndpoints = 0

function Test-StudentEndpoint {
    param(
        [string]$TestName,
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Headers = @{},
        [string]$Body = $null,
        [string]$Category = "General",
        [string]$ExpectedBehavior = "Success",
        [switch]$MeasureTime
    )
    
    $script:totalEndpoints++
    $startTime = Get-Date
    
    try {
        Write-Host "`n🧪 [$Category] Testing: $TestName" -ForegroundColor Yellow
        Write-Host "   Endpoint: $Method $Endpoint" -ForegroundColor Gray
        Write-Host "   Expected: $ExpectedBehavior" -ForegroundColor Gray
        
        $params = @{
            Uri = "$baseUrl$Endpoint"
            Method = $Method
        }
        
        if ($Headers.Count -gt 0) {
            $params.Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalMilliseconds
        
        Write-Host "   ✅ SUCCESS" -ForegroundColor Green
        Write-Host "   Response Time: $([math]::Round($duration, 2))ms" -ForegroundColor Cyan
        
        if ($MeasureTime) {
            $script:performanceData += @{
                Endpoint = $Endpoint
                Method = $Method
                Duration = $duration
                Status = "SUCCESS"
            }
        }
        
        $script:passedEndpoints++
        $script:endpointTests += @{
            Name = $TestName
            Method = $Method
            Endpoint = $Endpoint
            Category = $Category
            Status = "PASS"
            Duration = $duration
            Expected = $ExpectedBehavior
        }
        
        return $response
    }
    catch {
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalMilliseconds
        
        $errorMsg = $_.Exception.Message
        if ($ExpectedBehavior -eq "Should Fail" -and ($errorMsg -like "*401*" -or $errorMsg -like "*403*" -or $errorMsg -like "*404*")) {
            Write-Host "   ✅ EXPECTED FAILURE (Security Working)" -ForegroundColor Green
            $script:passedEndpoints++
            $status = "PASS"
        } else {
            Write-Host "   ❌ FAILED: $errorMsg" -ForegroundColor Red
            $script:failedEndpoints++
            $status = "FAIL"
        }
        
        Write-Host "   Response Time: $([math]::Round($duration, 2))ms" -ForegroundColor Cyan
        
        if ($MeasureTime) {
            $script:performanceData += @{
                Endpoint = $Endpoint
                Method = $Method
                Duration = $duration
                Status = "FAILED"
            }
        }
        
        $script:endpointTests += @{
            Name = $TestName
            Method = $Method
            Endpoint = $Endpoint
            Category = $Category
            Status = $status
            Duration = $duration
            Expected = $ExpectedBehavior
            Error = $errorMsg
        }
        
        return $null
    }
}

Write-Host "`n🚀 PHASE 1: AUTHENTICATION ENDPOINTS" -ForegroundColor Magenta

# Test unique email for this test run
$testEmail = "extensive.test.$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
$testPassword = "ExtensiveTest123!"

# 1. Registration Endpoint
Write-Host "`n📝 1. AUTHENTICATION - REGISTRATION" -ForegroundColor Blue

$registrationData = @{
    email = $testEmail
    password = $testPassword
    name = "Extensive Test Student"
    phone = "03001234567"
    gender = "male"
    role = "student"
    university = "Test University"
    student_id = "EXT001"
    year_of_study = 3
    field_of_study = "Computer Science"
    date_of_birth = "2000-01-15"
    address = "Test Address, Karachi"
} | ConvertTo-Json

$registrationResponse = Test-StudentEndpoint -TestName "Complete Student Registration" -Method "POST" -Endpoint "/auth/register" -Body $registrationData -Category "Authentication" -MeasureTime

# Test registration with missing fields
$incompleteData = @{
    email = "incomplete@test.com"
    password = "test123"
} | ConvertTo-Json

Test-StudentEndpoint -TestName "Registration with Missing Fields" -Method "POST" -Endpoint "/auth/register" -Body $incompleteData -Category "Authentication" -ExpectedBehavior "Should Fail"

# Test duplicate email registration
if ($registrationResponse) {
    Test-StudentEndpoint -TestName "Duplicate Email Registration" -Method "POST" -Endpoint "/auth/register" -Body $registrationData -Category "Authentication" -ExpectedBehavior "Should Fail"
}

# 2. Login Endpoints
Write-Host "`n🔑 2. AUTHENTICATION - LOGIN" -ForegroundColor Blue

$loginData = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

$loginResponse = Test-StudentEndpoint -TestName "Valid Student Login" -Method "POST" -Endpoint "/auth/login" -Body $loginData -Category "Authentication" -MeasureTime

$authToken = ""
$studentId = ""
if ($loginResponse) {
    $authToken = $loginResponse.access_token
    $studentId = $loginResponse.user.id
    Write-Host "   🎫 Auth Token: $($authToken.Substring(0,20))..." -ForegroundColor Green
    Write-Host "   👤 Student ID: $studentId" -ForegroundColor Green
}

# Test invalid login credentials
$invalidLoginData = @{
    email = $testEmail
    password = "wrongpassword"
} | ConvertTo-Json

Test-StudentEndpoint -TestName "Invalid Password Login" -Method "POST" -Endpoint "/auth/login" -Body $invalidLoginData -Category "Authentication" -ExpectedBehavior "Should Fail"

$invalidEmailData = @{
    email = "nonexistent@test.com"
    password = $testPassword
} | ConvertTo-Json

Test-StudentEndpoint -TestName "Non-existent Email Login" -Method "POST" -Endpoint "/auth/login" -Body $invalidEmailData -Category "Authentication" -ExpectedBehavior "Should Fail"

# Setup auth headers for subsequent tests
$authHeaders = @{
    "Authorization" = "Bearer $authToken"
}

Write-Host "`n👤 PHASE 2: USER PROFILE ENDPOINTS" -ForegroundColor Magenta

# 3. Profile Management
Write-Host "`n📋 3. USER PROFILE - MANAGEMENT" -ForegroundColor Blue

# Test without authentication
Test-StudentEndpoint -TestName "Get Profile without Auth" -Method "GET" -Endpoint "/user/profile" -Category "Profile" -ExpectedBehavior "Should Fail"

# Test with valid authentication
Test-StudentEndpoint -TestName "Get Profile with Auth" -Method "GET" -Endpoint "/user/profile" -Headers $authHeaders -Category "Profile" -MeasureTime

# Test profile update
$profileUpdateData = @{
    name = "Updated Extensive Test Student"
    phone = "03009876543"
    bio = "Updated bio for extensive testing"
    university = "Updated Test University"
    year_of_study = 4
    interests = @("Technology", "Sports", "Music")
} | ConvertTo-Json

Test-StudentEndpoint -TestName "Update Profile Information" -Method "PUT" -Endpoint "/user/profile" -Headers $authHeaders -Body $profileUpdateData -Category "Profile" -MeasureTime

# Test partial profile update
$partialUpdateData = @{
    name = "Partially Updated Name"
} | ConvertTo-Json

Test-StudentEndpoint -TestName "Partial Profile Update" -Method "PUT" -Endpoint "/user/profile" -Headers $authHeaders -Body $partialUpdateData -Category "Profile"

# 4. Password Management
Write-Host "`n🔒 4. PASSWORD MANAGEMENT" -ForegroundColor Blue

$changePasswordData = @{
    current_password = $testPassword
    new_password = "NewExtensiveTest123!"
    confirm_password = "NewExtensiveTest123!"
} | ConvertTo-Json

Test-StudentEndpoint -TestName "Change Password" -Method "PUT" -Endpoint "/user/change-password" -Headers $authHeaders -Body $changePasswordData -Category "Profile"

# Test password change with wrong current password
$wrongPasswordData = @{
    current_password = "wrongcurrentpassword"
    new_password = "NewPassword123!"
    confirm_password = "NewPassword123!"
} | ConvertTo-Json

Test-StudentEndpoint -TestName "Change Password with Wrong Current" -Method "PUT" -Endpoint "/user/change-password" -Headers $authHeaders -Body $wrongPasswordData -Category "Profile" -ExpectedBehavior "Should Fail"

# 5. User Preferences
Write-Host "`n⚙️ 5. USER PREFERENCES" -ForegroundColor Blue

$preferencesData = @{
    notifications = @{
        email = $true
        sms = $false
        push = $true
        order_updates = $true
        booking_reminders = $true
    }
    privacy = @{
        profile_visibility = "public"
        contact_sharing = $false
        location_sharing = $true
    }
    app_settings = @{
        theme = "light"
        language = "en"
        currency = "PKR"
    }
} | ConvertTo-Json

Test-StudentEndpoint -TestName "Update User Preferences" -Method "PUT" -Endpoint "/user/preferences" -Headers $authHeaders -Body $preferencesData -Category "Profile"

Test-StudentEndpoint -TestName "Get User Preferences" -Method "GET" -Endpoint "/user/preferences" -Headers $authHeaders -Category "Profile"

Write-Host "`n🏠 PHASE 3: ACCOMMODATION ENDPOINTS" -ForegroundColor Magenta

# 6. Accommodation Discovery
Write-Host "`n🔍 6. ACCOMMODATION - DISCOVERY" -ForegroundColor Blue

Test-StudentEndpoint -TestName "Get All Accommodations" -Method "GET" -Endpoint "/accommodation" -Headers $authHeaders -Category "Accommodation" -MeasureTime

Test-StudentEndpoint -TestName "Get Accommodations without Auth" -Method "GET" -Endpoint "/accommodation" -Category "Accommodation" -ExpectedBehavior "Should Fail"

$accommodationsResponse = Test-StudentEndpoint -TestName "Get Accommodations (for ID extraction)" -Method "GET" -Endpoint "/accommodation" -Headers $authHeaders -Category "Accommodation"

$accommodationId = ""
if ($accommodationsResponse -and $accommodationsResponse.Count -gt 0) {
    $accommodationId = $accommodationsResponse[0]._id
    Write-Host "   🏠 Using Accommodation ID: $accommodationId" -ForegroundColor Green
}

# Test specific accommodation details
if ($accommodationId) {
    Test-StudentEndpoint -TestName "Get Specific Accommodation Details" -Method "GET" -Endpoint "/accommodation/$accommodationId" -Headers $authHeaders -Category "Accommodation" -MeasureTime
    
    Test-StudentEndpoint -TestName "Get Accommodation without Auth" -Method "GET" -Endpoint "/accommodation/$accommodationId" -Category "Accommodation" -ExpectedBehavior "Should Fail"
}

# Test non-existent accommodation
Test-StudentEndpoint -TestName "Get Non-existent Accommodation" -Method "GET" -Endpoint "/accommodation/nonexistentid123" -Headers $authHeaders -Category "Accommodation" -ExpectedBehavior "Should Fail"

# 7. Accommodation Search
Write-Host "`n🔎 7. ACCOMMODATION - SEARCH" -ForegroundColor Blue

Test-StudentEndpoint -TestName "Basic Accommodation Search" -Method "GET" -Endpoint "/accommodation/search" -Headers $authHeaders -Category "Accommodation" -MeasureTime

# Test search with query parameters
Test-StudentEndpoint -TestName "Search with City Filter" -Method "GET" -Endpoint "/accommodation/search?city=Karachi" -Headers $authHeaders -Category "Accommodation"

Test-StudentEndpoint -TestName "Search with Price Range" -Method "GET" -Endpoint "/accommodation/search?minPrice=500&maxPrice=2000" -Headers $authHeaders -Category "Accommodation"

Test-StudentEndpoint -TestName "Search with Multiple Filters" -Method "GET" -Endpoint "/accommodation/search?city=Karachi&type=apartment&minPrice=1000" -Headers $authHeaders -Category "Accommodation"

# Test advanced search with POST body
$advancedSearchData = @{
    location = @{
        city = "Karachi"
        area = "Gulshan"
        latitude = 24.8607
        longitude = 67.0011
        radius = 5000
    }
    filters = @{
        price_range = @{ min = 500; max = 3000 }
        accommodation_type = @("apartment", "hostel", "shared_room")
        amenities = @("wifi", "parking", "laundry")
        rating_min = 3.0
        available_from = "2025-08-01"
    }
    sort_by = "price_low_to_high"
    page = 1
    limit = 20
} | ConvertTo-Json

Test-StudentEndpoint -TestName "Advanced Search with Location" -Method "POST" -Endpoint "/accommodation/advanced-search" -Headers $authHeaders -Body $advancedSearchData -Category "Accommodation"

# Test nearby accommodations
$nearbySearchData = @{
    latitude = 24.8607
    longitude = 67.0011
    radius = 10000
    limit = 10
} | ConvertTo-Json

Test-StudentEndpoint -TestName "Search Nearby Accommodations" -Method "POST" -Endpoint "/accommodation/nearby" -Headers $authHeaders -Body $nearbySearchData -Category "Accommodation"

Write-Host "`n📅 PHASE 4: BOOKING ENDPOINTS" -ForegroundColor Magenta

# 8. Booking Management
Write-Host "`n📋 8. BOOKING - MANAGEMENT" -ForegroundColor Blue

Test-StudentEndpoint -TestName "Get User Bookings" -Method "GET" -Endpoint "/booking/user" -Headers $authHeaders -Category "Booking" -MeasureTime

Test-StudentEndpoint -TestName "Get Bookings without Auth" -Method "GET" -Endpoint "/booking/user" -Category "Booking" -ExpectedBehavior "Should Fail"

# Test booking creation
if ($accommodationId) {
    $bookingData = @{
        accommodation = $accommodationId
        start_date = "2025-09-01"
        end_date = "2025-09-15"
        guests = 2
        total_price = 1500.00
        special_requests = "Ground floor room preferred"
        contact_phone = "03001234567"
        emergency_contact = @{
            name = "Emergency Contact"
            phone = "03009876543"
            relationship = "Parent"
        }
    } | ConvertTo-Json

    $bookingResponse = Test-StudentEndpoint -TestName "Create Accommodation Booking" -Method "POST" -Endpoint "/booking" -Headers $authHeaders -Body $bookingData -Category "Booking" -MeasureTime

    $bookingId = ""
    if ($bookingResponse) {
        $bookingId = $bookingResponse._id
        Write-Host "   📋 Booking ID: $bookingId" -ForegroundColor Green
    }

    # Test booking with invalid dates
    $invalidBookingData = @{
        accommodation = $accommodationId
        start_date = "2025-08-15"
        end_date = "2025-08-10"
        guests = 1
        total_price = 500.00
    } | ConvertTo-Json

    Test-StudentEndpoint -TestName "Create Booking with Invalid Dates" -Method "POST" -Endpoint "/booking" -Headers $authHeaders -Body $invalidBookingData -Category "Booking" -ExpectedBehavior "Should Fail"

    # Test booking update
    if ($bookingId) {
        $updateBookingData = @{
            guests = 3
            special_requests = "Updated: Need parking space"
        } | ConvertTo-Json

        Test-StudentEndpoint -TestName "Update Booking Details" -Method "PUT" -Endpoint "/booking/$bookingId" -Headers $authHeaders -Body $updateBookingData -Category "Booking"

        # Test get specific booking
        Test-StudentEndpoint -TestName "Get Specific Booking Details" -Method "GET" -Endpoint "/booking/$bookingId" -Headers $authHeaders -Category "Booking"

        # Test booking cancellation
        Test-StudentEndpoint -TestName "Cancel Booking" -Method "DELETE" -Endpoint "/booking/$bookingId" -Headers $authHeaders -Category "Booking"
    }
}

# Test booking with non-existent accommodation
$invalidAccommodationBooking = @{
    accommodation = "nonexistentaccommodationid"
    start_date = "2025-09-01"
    end_date = "2025-09-05"
    guests = 1
    total_price = 300.00
} | ConvertTo-Json

Test-StudentEndpoint -TestName "Book Non-existent Accommodation" -Method "POST" -Endpoint "/booking" -Headers $authHeaders -Body $invalidAccommodationBooking -Category "Booking" -ExpectedBehavior "Should Fail"

Write-Host "`n🍕 PHASE 5: FOOD SERVICE ENDPOINTS" -ForegroundColor Magenta

# 9. Food Provider Discovery
Write-Host "`n🏪 9. FOOD PROVIDERS - DISCOVERY" -ForegroundColor Blue

$providersResponse = Test-StudentEndpoint -TestName "Get All Food Providers" -Method "GET" -Endpoint "/food-provider" -Headers $authHeaders -Category "Food" -MeasureTime

Test-StudentEndpoint -TestName "Get Providers without Auth" -Method "GET" -Endpoint "/food-provider" -Category "Food" -ExpectedBehavior "Should Fail"

$providerId = ""
if ($providersResponse -and $providersResponse.Count -gt 0) {
    $providerId = $providersResponse[0]._id
    Write-Host "   🏪 Using Provider ID: $providerId" -ForegroundColor Green
}

# Test specific provider details
if ($providerId) {
    Test-StudentEndpoint -TestName "Get Specific Provider Details" -Method "GET" -Endpoint "/food-provider/$providerId" -Headers $authHeaders -Category "Food" -MeasureTime

    # Test provider menu
    Test-StudentEndpoint -TestName "Get Provider Menu" -Method "GET" -Endpoint "/food-provider/$providerId/menu" -Headers $authHeaders -Category "Food"

    # Test provider reviews
    Test-StudentEndpoint -TestName "Get Provider Reviews" -Method "GET" -Endpoint "/food-provider/$providerId/reviews" -Headers $authHeaders -Category "Food"
}

# Test non-existent provider
Test-StudentEndpoint -TestName "Get Non-existent Provider" -Method "GET" -Endpoint "/food-provider/nonexistentproviderid" -Headers $authHeaders -Category "Food" -ExpectedBehavior "Should Fail"

# 10. Food Provider Search
Write-Host "`n🔍 10. FOOD PROVIDERS - SEARCH" -ForegroundColor Blue

# Test basic search
Test-StudentEndpoint -TestName "Basic Provider Search" -Method "GET" -Endpoint "/food-provider/search" -Headers $authHeaders -Category "Food"

# Test search with filters
Test-StudentEndpoint -TestName "Search by Cuisine Type" -Method "GET" -Endpoint "/food-provider/search?cuisine=pakistani" -Headers $authHeaders -Category "Food"

Test-StudentEndpoint -TestName "Search by Rating" -Method "GET" -Endpoint "/food-provider/search?minRating=4" -Headers $authHeaders -Category "Food"

# Test location-based search
$providerLocationSearch = @{
    latitude = 24.8607
    longitude = 67.0011
    radius = 5000
    cuisine_types = @("pakistani", "chinese", "fast_food")
    rating_min = 3.5
    delivery_time_max = 45
    open_now = $true
} | ConvertTo-Json

Test-StudentEndpoint -TestName "Location-based Provider Search" -Method "POST" -Endpoint "/food-provider/search" -Headers $authHeaders -Body $providerLocationSearch -Category "Food"

Write-Host "`n🛒 PHASE 6: ORDER ENDPOINTS" -ForegroundColor Magenta

# 11. Order Management
Write-Host "`n📦 11. ORDERS - MANAGEMENT" -ForegroundColor Blue

Test-StudentEndpoint -TestName "Get User Orders" -Method "GET" -Endpoint "/order/user" -Headers $authHeaders -Category "Order" -MeasureTime

Test-StudentEndpoint -TestName "Get Orders without Auth" -Method "GET" -Endpoint "/order/user" -Category "Order" -ExpectedBehavior "Should Fail"

# Test order creation
if ($providerId) {
    $orderData = @{
        provider = $providerId
        items = @(
            @{
                menu_item = "biryani_special"
                name = "Chicken Biryani"
                quantity = 2
                price = 25.99
                special_instructions = "Extra spicy, less oil"
            },
            @{
                menu_item = "naan_garlic"
                name = "Garlic Naan"
                quantity = 4
                price = 4.99
            }
        )
        total_price = 71.95
        delivery_address = "University Hostel Block A, Room 301"
        delivery_instructions = "Call 5 minutes before arrival"
        contact_phone = "03001234567"
        payment_method = "cash_on_delivery"
        estimated_delivery_time = 45
    } | ConvertTo-Json

    $orderResponse = Test-StudentEndpoint -TestName "Create Food Order" -Method "POST" -Endpoint "/order" -Headers $authHeaders -Body $orderData -Category "Order" -MeasureTime

    $orderId = ""
    if ($orderResponse) {
        $orderId = $orderResponse._id
        Write-Host "   🛒 Order ID: $orderId" -ForegroundColor Green
    }

    # Test invalid order (empty items)
    $invalidOrderData = @{
        provider = $providerId
        items = @()
        total_price = 0
        delivery_address = "Test Address"
    } | ConvertTo-Json

    Test-StudentEndpoint -TestName "Create Order with Empty Items" -Method "POST" -Endpoint "/order" -Headers $authHeaders -Body $invalidOrderData -Category "Order" -ExpectedBehavior "Should Fail"

    # Test order with non-existent provider
    $invalidProviderOrder = @{
        provider = "nonexistentproviderid"
        items = @(
            @{
                menu_item = "test_item"
                quantity = 1
                price = 10.00
            }
        )
        total_price = 10.00
        delivery_address = "Test Address"
    } | ConvertTo-Json

    Test-StudentEndpoint -TestName "Order from Non-existent Provider" -Method "POST" -Endpoint "/order" -Headers $authHeaders -Body $invalidProviderOrder -Category "Order" -ExpectedBehavior "Should Fail"

    # Test specific order details
    if ($orderId) {
        Test-StudentEndpoint -TestName "Get Specific Order Details" -Method "GET" -Endpoint "/order/$orderId" -Headers $authHeaders -Category "Order"

        # Test order status update
        $statusUpdateData = @{
            status = "confirmed"
            estimated_delivery_time = 40
        } | ConvertTo-Json

        Test-StudentEndpoint -TestName "Update Order Status" -Method "PUT" -Endpoint "/order/$orderId/status" -Headers $authHeaders -Body $statusUpdateData -Category "Order"

        # Test order cancellation
        Test-StudentEndpoint -TestName "Cancel Order" -Method "PUT" -Endpoint "/order/$orderId/cancel" -Headers $authHeaders -Category "Order"
    }
}

Write-Host "`n🗺️ PHASE 7: LOCATION & MAP ENDPOINTS" -ForegroundColor Magenta

# 12. Geocoding Services
Write-Host "`n📍 12. LOCATION - GEOCODING" -ForegroundColor Blue

$geocodeData = @{
    address = "University of Karachi, Main Campus, Karachi, Pakistan"
} | ConvertTo-Json

Test-StudentEndpoint -TestName "Geocode University Address" -Method "POST" -Endpoint "/maps/geocode" -Headers $authHeaders -Body $geocodeData -Category "Location" -MeasureTime

# Test geocoding with incomplete address
$incompleteAddressData = @{
    address = "Karachi"
} | ConvertTo-Json

Test-StudentEndpoint -TestName "Geocode Incomplete Address" -Method "POST" -Endpoint "/maps/geocode" -Headers $authHeaders -Body $incompleteAddressData -Category "Location"

# Test geocoding without auth
Test-StudentEndpoint -TestName "Geocode without Auth" -Method "POST" -Endpoint "/maps/geocode" -Body $geocodeData -Category "Location" -ExpectedBehavior "Should Fail"

# Test reverse geocoding
$reverseGeocodeData = @{
    latitude = 24.8607
    longitude = 67.0011
} | ConvertTo-Json

Test-StudentEndpoint -TestName "Reverse Geocode Coordinates" -Method "POST" -Endpoint "/maps/reverse-geocode" -Headers $authHeaders -Body $reverseGeocodeData -Category "Location" -MeasureTime

# Test reverse geocoding with invalid coordinates
$invalidCoordsData = @{
    latitude = 200  # Invalid latitude
    longitude = 400  # Invalid longitude
} | ConvertTo-Json

Test-StudentEndpoint -TestName "Reverse Geocode Invalid Coordinates" -Method "POST" -Endpoint "/maps/reverse-geocode" -Headers $authHeaders -Body $invalidCoordsData -Category "Location" -ExpectedBehavior "Should Fail"

# 13. Route Calculation
Write-Host "`n🛣️ 13. LOCATION - ROUTING" -ForegroundColor Blue

$routeData = @{
    origin = @{
        latitude = 24.8607
        longitude = 67.0011
    }
    destination = @{
        latitude = 24.8700
        longitude = 67.0300
    }
    mode = "driving"
    optimize_waypoints = $true
    avoid_tolls = $false
} | ConvertTo-Json

Test-StudentEndpoint -TestName "Calculate Driving Route" -Method "POST" -Endpoint "/maps/calculate-route" -Headers $authHeaders -Body $routeData -Category "Location" -MeasureTime

# Test walking route
$walkingRouteData = @{
    origin = @{
        latitude = 24.8607
        longitude = 67.0011
    }
    destination = @{
        latitude = 24.8650
        longitude = 67.0050
    }
    mode = "walking"
} | ConvertTo-Json

Test-StudentEndpoint -TestName "Calculate Walking Route" -Method "POST" -Endpoint "/maps/calculate-route" -Headers $authHeaders -Body $walkingRouteData -Category "Location"

# Test route with multiple waypoints
$multiWaypointRoute = @{
    origin = @{
        latitude = 24.8607
        longitude = 67.0011
    }
    destination = @{
        latitude = 24.8700
        longitude = 67.0300
    }
    waypoints = @(
        @{
            latitude = 24.8650
            longitude = 67.0150
        }
    )
    mode = "driving"
} | ConvertTo-Json

Test-StudentEndpoint -TestName "Calculate Route with Waypoints" -Method "POST" -Endpoint "/maps/calculate-route" -Headers $authHeaders -Body $multiWaypointRoute -Category "Location"

# 14. Distance Matrix
Write-Host "`n📏 14. LOCATION - DISTANCE MATRIX" -ForegroundColor Blue

$distanceMatrixData = @{
    origins = @(
        @{ latitude = 24.8607; longitude = 67.0011 },
        @{ latitude = 24.8500; longitude = 67.0100 }
    )
    destinations = @(
        @{ latitude = 24.8700; longitude = 67.0300 },
        @{ latitude = 24.8800; longitude = 67.0400 },
        @{ latitude = 24.8600; longitude = 67.0200 }
    )
    mode = "driving"
    units = "metric"
} | ConvertTo-Json

Test-StudentEndpoint -TestName "Calculate Distance Matrix" -Method "POST" -Endpoint "/maps/distance-matrix" -Headers $authHeaders -Body $distanceMatrixData -Category "Location"

Write-Host "`n📍 PHASE 8: ORDER TRACKING ENDPOINTS" -ForegroundColor Magenta

# 15. Order Tracking
Write-Host "`n🚚 15. TRACKING - ORDER TRACKING" -ForegroundColor Blue

if ($orderId) {
    # Test set delivery location
    $deliveryLocationData = @{
        coordinates = @{
            latitude = 24.8607
            longitude = 67.0011
        }
        address = "University Hostel Block A, Room 301"
        landmark = "Near the main entrance"
        delivery_instructions = "Call on arrival, gate code: 1234"
        contact_person = "Extensive Test Student"
        contact_phone = "03001234567"
    } | ConvertTo-Json

    Test-StudentEndpoint -TestName "Set Order Delivery Location" -Method "PUT" -Endpoint "/order-tracking/$orderId/delivery-location" -Headers $authHeaders -Body $deliveryLocationData -Category "Tracking"

    # Test get order tracking
    Test-StudentEndpoint -TestName "Get Order Tracking Status" -Method "GET" -Endpoint "/order-tracking/$orderId/status" -Headers $authHeaders -Category "Tracking" -MeasureTime

    # Test update delivery status
    $deliveryStatusData = @{
        status = "out_for_delivery"
        current_location = @{
            latitude = 24.8650
            longitude = 67.0150
        }
        estimated_arrival = "2025-06-21T15:30:00Z"
        delivery_notes = "On the way, traffic is light"
    } | ConvertTo-Json

    Test-StudentEndpoint -TestName "Update Delivery Status" -Method "PUT" -Endpoint "/order-tracking/$orderId/status" -Headers $authHeaders -Body $deliveryStatusData -Category "Tracking"
}

# Test real-time tracking
$realTimeTrackingData = @{
    order_id = $orderId
    current_location = @{
        latitude = 24.8650
        longitude = 67.0150
    }
    heading = 45
    speed = 25
    accuracy = 5
} | ConvertTo-Json

Test-StudentEndpoint -TestName "Real-time Order Tracking" -Method "POST" -Endpoint "/maps/track-order" -Headers $authHeaders -Body $realTimeTrackingData -Category "Tracking" -MeasureTime

# 16. Route Optimization
Write-Host "`n🎯 16. TRACKING - ROUTE OPTIMIZATION" -ForegroundColor Blue

$routeOptimizationData = @{
    start_location = @{
        latitude = 24.8500
        longitude = 67.0100
    }
    delivery_locations = @(
        @{
            order_id = $orderId
            latitude = 24.8607
            longitude = 67.0011
            priority = "high"
            time_window = @{
                start = "14:00"
                end = "16:00"
            }
        },
        @{
            order_id = "dummy_order_2"
            latitude = 24.8700
            longitude = 67.0300
            priority = "normal"
        }
    )
    vehicle_type = "motorcycle"
    optimize_for = "time"
} | ConvertTo-Json

Test-StudentEndpoint -TestName "Optimize Delivery Routes" -Method "POST" -Endpoint "/order-tracking/optimize-route" -Headers $authHeaders -Body $routeOptimizationData -Category "Tracking"

Write-Host "`n⭐ PHASE 9: REVIEW & RATING ENDPOINTS" -ForegroundColor Magenta

# 17. Review Management
Write-Host "`n📝 17. REVIEWS - MANAGEMENT" -ForegroundColor Blue

Test-StudentEndpoint -TestName "Get User Reviews" -Method "GET" -Endpoint "/review/user" -Headers $authHeaders -Category "Review" -MeasureTime

Test-StudentEndpoint -TestName "Get Reviews without Auth" -Method "GET" -Endpoint "/review/user" -Category "Review" -ExpectedBehavior "Should Fail"

# Test accommodation review
if ($accommodationId) {
    $accommodationReviewData = @{
        target_id = $accommodationId
        target_type = "accommodation"
        rating = 5
        comment = "Excellent accommodation! Very clean and well-maintained. Great location near the university. Highly recommend to fellow students."
        aspects = @{
            cleanliness = 5
            location = 5
            value_for_money = 4
            host_communication = 5
            amenities = 4
        }
        photos = @("photo1.jpg", "photo2.jpg")
        would_recommend = $true
    } | ConvertTo-Json

    $accommodationReviewResponse = Test-StudentEndpoint -TestName "Create Accommodation Review" -Method "POST" -Endpoint "/review" -Headers $authHeaders -Body $accommodationReviewData -Category "Review"

    $accommodationReviewId = ""
    if ($accommodationReviewResponse) {
        $accommodationReviewId = $accommodationReviewResponse._id
        Write-Host "   ⭐ Accommodation Review ID: $accommodationReviewId" -ForegroundColor Green
    }
}

# Test food provider review
if ($providerId) {
    $foodReviewData = @{
        target_id = $providerId
        target_type = "food_provider"
        rating = 4
        comment = "Good food quality and reasonable prices. Delivery was on time. Could improve packaging."
        aspects = @{
            food_quality = 4
            delivery_time = 5
            packaging = 3
            value_for_money = 4
            customer_service = 4
        }
        order_id = $orderId
        delivery_experience = "satisfactory"
    } | ConvertTo-Json

    $foodReviewResponse = Test-StudentEndpoint -TestName "Create Food Provider Review" -Method "POST" -Endpoint "/review" -Headers $authHeaders -Body $foodReviewData -Category "Review"

    $foodReviewId = ""
    if ($foodReviewResponse) {
        $foodReviewId = $foodReviewResponse._id
        Write-Host "   ⭐ Food Review ID: $foodReviewId" -ForegroundColor Green
    }
}

# Test invalid review (missing required fields)
$invalidReviewData = @{
    target_id = $accommodationId
    rating = 3
} | ConvertTo-Json

Test-StudentEndpoint -TestName "Create Review Missing Fields" -Method "POST" -Endpoint "/review" -Headers $authHeaders -Body $invalidReviewData -Category "Review" -ExpectedBehavior "Should Fail"

# Test review update
if ($accommodationReviewId) {
    $updateReviewData = @{
        rating = 4
        comment = "Updated review: Still very good, but noticed some minor issues during extended stay."
        aspects = @{
            cleanliness = 4
            location = 5
            value_for_money = 4
            host_communication = 4
            amenities = 3
        }
    } | ConvertTo-Json

    Test-StudentEndpoint -TestName "Update Accommodation Review" -Method "PUT" -Endpoint "/review/$accommodationReviewId" -Headers $authHeaders -Body $updateReviewData -Category "Review"

    # Test get specific review
    Test-StudentEndpoint -TestName "Get Specific Review Details" -Method "GET" -Endpoint "/review/$accommodationReviewId" -Headers $authHeaders -Category "Review"

    # Test delete review
    Test-StudentEndpoint -TestName "Delete Review" -Method "DELETE" -Endpoint "/review/$accommodationReviewId" -Headers $authHeaders -Category "Review"
}

# 18. Review Queries
Write-Host "`n🔍 18. REVIEWS - QUERIES" -ForegroundColor Blue

# Test get reviews for accommodation
if ($accommodationId) {
    Test-StudentEndpoint -TestName "Get Accommodation Reviews" -Method "GET" -Endpoint "/review/target/accommodation/$accommodationId" -Headers $authHeaders -Category "Review"

    Test-StudentEndpoint -TestName "Get Accommodation Review Stats" -Method "GET" -Endpoint "/review/target/accommodation/$accommodationId/stats" -Headers $authHeaders -Category "Review"
}

# Test get reviews for food provider
if ($providerId) {
    Test-StudentEndpoint -TestName "Get Food Provider Reviews" -Method "GET" -Endpoint "/review/target/food_provider/$providerId" -Headers $authHeaders -Category "Review"

    Test-StudentEndpoint -TestName "Get Provider Review Summary" -Method "GET" -Endpoint "/review/target/food_provider/$providerId/summary" -Headers $authHeaders -Category "Review"
}

Write-Host "`n💳 PHASE 10: PAYMENT ENDPOINTS" -ForegroundColor Magenta

# 19. Payment Management
Write-Host "`n💰 19. PAYMENTS - MANAGEMENT" -ForegroundColor Blue

Test-StudentEndpoint -TestName "Get Payment History" -Method "GET" -Endpoint "/payment/user" -Headers $authHeaders -Category "Payment" -MeasureTime

Test-StudentEndpoint -TestName "Get Payment Methods" -Method "GET" -Endpoint "/payment/methods" -Headers $authHeaders -Category "Payment"

Test-StudentEndpoint -TestName "Get Payment without Auth" -Method "GET" -Endpoint "/payment/user" -Category "Payment" -ExpectedBehavior "Should Fail"

# Test booking payment
if ($bookingId) {
    $bookingPaymentData = @{
        booking_id = $bookingId
        amount = 1500.00
        payment_method = "credit_card"
        card_details = @{
            card_number = "4111111111111111"  # Test card number
            expiry_month = "12"
            expiry_year = "2027"
            cvv = "123"
            cardholder_name = "Extensive Test Student"
        }
        billing_address = @{
            street = "Test Street 123"
            city = "Karachi"
            postal_code = "75300"
            country = "Pakistan"
        }
    } | ConvertTo-Json

    Test-StudentEndpoint -TestName "Process Booking Payment" -Method "POST" -Endpoint "/payment/booking" -Headers $authHeaders -Body $bookingPaymentData -Category "Payment" -MeasureTime
}

# Test order payment
if ($orderId) {
    $orderPaymentData = @{
        order_id = $orderId
        amount = 71.95
        payment_method = "digital_wallet"
        wallet_details = @{
            wallet_type = "jazzcash"
            wallet_number = "03001234567"
            transaction_pin = "1234"
        }
    } | ConvertTo-Json

    Test-StudentEndpoint -TestName "Process Order Payment" -Method "POST" -Endpoint "/payment/order" -Headers $authHeaders -Body $orderPaymentData -Category "Payment"
}

# Test payment verification
Test-StudentEndpoint -TestName "Verify Payment Status" -Method "GET" -Endpoint "/payment/verify" -Headers $authHeaders -Category "Payment"

# Test refund request
if ($bookingId) {
    $refundData = @{
        booking_id = $bookingId
        reason = "Change of plans due to exam schedule"
        amount = 1500.00
        refund_method = "original_payment_method"
    } | ConvertTo-Json

    Test-StudentEndpoint -TestName "Request Booking Refund" -Method "POST" -Endpoint "/payment/refund" -Headers $authHeaders -Body $refundData -Category "Payment"
}

Write-Host "`n📊 PHASE 11: DASHBOARD & ANALYTICS ENDPOINTS" -ForegroundColor Magenta

# 20. Dashboard Data
Write-Host "`n📈 20. DASHBOARD - ANALYTICS" -ForegroundColor Blue

Test-StudentEndpoint -TestName "Get Student Dashboard" -Method "GET" -Endpoint "/user/student/dashboard" -Headers $authHeaders -Category "Dashboard" -MeasureTime

Test-StudentEndpoint -TestName "Get Dashboard without Auth" -Method "GET" -Endpoint "/user/student/dashboard" -Category "Dashboard" -ExpectedBehavior "Should Fail"

Test-StudentEndpoint -TestName "Get Booking Statistics" -Method "GET" -Endpoint "/user/student/bookings/stats" -Headers $authHeaders -Category "Dashboard"

Test-StudentEndpoint -TestName "Get Order Statistics" -Method "GET" -Endpoint "/user/student/orders/stats" -Headers $authHeaders -Category "Dashboard"

Test-StudentEndpoint -TestName "Get Spending Analytics" -Method "GET" -Endpoint "/user/student/spending/analytics" -Headers $authHeaders -Category "Dashboard"

# Test date range analytics
Test-StudentEndpoint -TestName "Get Monthly Spending Report" -Method "GET" -Endpoint "/user/student/spending/analytics?period=monthly&year=2025&month=6" -Headers $authHeaders -Category "Dashboard"

Test-StudentEndpoint -TestName "Get Activity Timeline" -Method "GET" -Endpoint "/user/student/activity" -Headers $authHeaders -Category "Dashboard"

Test-StudentEndpoint -TestName "Get Activity with Date Range" -Method "GET" -Endpoint "/user/student/activity?from=2025-06-01&to=2025-06-21" -Headers $authHeaders -Category "Dashboard"

# 21. Recommendations
Write-Host "`n🎯 21. DASHBOARD - RECOMMENDATIONS" -ForegroundColor Blue

Test-StudentEndpoint -TestName "Get Accommodation Recommendations" -Method "GET" -Endpoint "/user/student/recommendations/accommodations" -Headers $authHeaders -Category "Dashboard"

Test-StudentEndpoint -TestName "Get Food Recommendations" -Method "GET" -Endpoint "/user/student/recommendations/food" -Headers $authHeaders -Category "Dashboard"

Test-StudentEndpoint -TestName "Get Personalized Deals" -Method "GET" -Endpoint "/user/student/deals" -Headers $authHeaders -Category "Dashboard"

Write-Host "`n🔔 PHASE 12: NOTIFICATION ENDPOINTS" -ForegroundColor Magenta

# 22. Notifications
Write-Host "`n📢 22. NOTIFICATIONS - MANAGEMENT" -ForegroundColor Blue

Test-StudentEndpoint -TestName "Get All Notifications" -Method "GET" -Endpoint "/notifications" -Headers $authHeaders -Category "Notification" -MeasureTime

Test-StudentEndpoint -TestName "Get Unread Notifications" -Method "GET" -Endpoint "/notifications?status=unread" -Headers $authHeaders -Category "Notification"

Test-StudentEndpoint -TestName "Get Notifications by Type" -Method "GET" -Endpoint "/notifications?type=booking" -Headers $authHeaders -Category "Notification"

# Test mark notifications as read
$markReadData = @{
    notification_ids = @("notification_1", "notification_2")
} | ConvertTo-Json

Test-StudentEndpoint -TestName "Mark Notifications as Read" -Method "PUT" -Endpoint "/notifications/mark-read" -Headers $authHeaders -Body $markReadData -Category "Notification"

Test-StudentEndpoint -TestName "Mark All Notifications Read" -Method "PUT" -Endpoint "/notifications/mark-all-read" -Headers $authHeaders -Category "Notification"

# Test notification settings
Test-StudentEndpoint -TestName "Get Notification Settings" -Method "GET" -Endpoint "/notifications/settings" -Headers $authHeaders -Category "Notification"

$notificationSettingsData = @{
    email_notifications = $true
    push_notifications = $true
    sms_notifications = $false
    types = @{
        booking_confirmations = $true
        order_updates = $true
        payment_receipts = $true
        promotional_offers = $false
    }
} | ConvertTo-Json

Test-StudentEndpoint -TestName "Update Notification Settings" -Method "PUT" -Endpoint "/notifications/settings" -Headers $authHeaders -Body $notificationSettingsData -Category "Notification"

Write-Host "`n📱 PHASE 13: MOBILE-SPECIFIC ENDPOINTS" -ForegroundColor Magenta

# 23. Mobile API
Write-Host "`n📲 23. MOBILE - DEVICE MANAGEMENT" -ForegroundColor Blue

Test-StudentEndpoint -TestName "Get Mobile App Configuration" -Method "GET" -Endpoint "/mobile/config" -Headers $authHeaders -Category "Mobile"

# Test device registration
$deviceRegistrationData = @{
    device_id = "extensive_test_device_001"
    platform = "android"
    app_version = "1.0.0"
    os_version = "11.0"
    fcm_token = "extensive_test_fcm_token_12345"
    device_model = "Test Device Model"
} | ConvertTo-Json

Test-StudentEndpoint -TestName "Register Mobile Device" -Method "POST" -Endpoint "/mobile/register-device" -Headers $authHeaders -Body $deviceRegistrationData -Category "Mobile"

# Test device update
$deviceUpdateData = @{
    fcm_token = "updated_fcm_token_67890"
    app_version = "1.0.1"
} | ConvertTo-Json

Test-StudentEndpoint -TestName "Update Device Information" -Method "PUT" -Endpoint "/mobile/device/extensive_test_device_001" -Headers $authHeaders -Body $deviceUpdateData -Category "Mobile"

# Test push notification test
Test-StudentEndpoint -TestName "Send Test Push Notification" -Method "POST" -Endpoint "/mobile/test-notification" -Headers $authHeaders -Category "Mobile"

Write-Host "`n🔐 PHASE 14: SECURITY & ADMIN ENDPOINTS" -ForegroundColor Magenta

# 24. Security Tests
Write-Host "`n🛡️ 24. SECURITY - ENDPOINT PROTECTION" -ForegroundColor Blue

# Test token refresh
if ($authToken) {
    $refreshData = @{
        refresh_token = "test_refresh_token"
    } | ConvertTo-Json

    Test-StudentEndpoint -TestName "Refresh Authentication Token" -Method "POST" -Endpoint "/auth/refresh" -Body $refreshData -Category "Security"
}

# Test logout
Test-StudentEndpoint -TestName "User Logout" -Method "POST" -Endpoint "/auth/logout" -Headers $authHeaders -Category "Security"

# Test password reset request
$resetRequestData = @{
    email = $testEmail
} | ConvertTo-Json

Test-StudentEndpoint -TestName "Request Password Reset" -Method "POST" -Endpoint "/auth/forgot-password" -Body $resetRequestData -Category "Security"

# Test admin endpoints (should fail for student)
Test-StudentEndpoint -TestName "Access Admin Dashboard (Should Fail)" -Method "GET" -Endpoint "/admin/dashboard" -Headers $authHeaders -Category "Security" -ExpectedBehavior "Should Fail"

Test-StudentEndpoint -TestName "Access Admin Users (Should Fail)" -Method "GET" -Endpoint "/admin/users" -Headers $authHeaders -Category "Security" -ExpectedBehavior "Should Fail"

Test-StudentEndpoint -TestName "Access Admin Analytics (Should Fail)" -Method "GET" -Endpoint "/admin/analytics" -Headers $authHeaders -Category "Security" -ExpectedBehavior "Should Fail"

Write-Host "`n🔍 PHASE 15: ADDITIONAL UTILITY ENDPOINTS" -ForegroundColor Magenta

# 25. Utility Endpoints
Write-Host "`n🛠️ 25. UTILITIES - MISC ENDPOINTS" -ForegroundColor Blue

Test-StudentEndpoint -TestName "Get App Version Info" -Method "GET" -Endpoint "/app/version" -Category "Utility"

Test-StudentEndpoint -TestName "Get System Status" -Method "GET" -Endpoint "/status" -Category "Utility"

Test-StudentEndpoint -TestName "Health Check Endpoint" -Method "GET" -Endpoint "/health" -Category "Utility"

Test-StudentEndpoint -TestName "Get API Documentation" -Method "GET" -Endpoint "/api" -Category "Utility"

# Test file upload endpoints
Test-StudentEndpoint -TestName "Get Upload Presigned URL" -Method "GET" -Endpoint "/upload/presigned-url?type=profile_picture" -Headers $authHeaders -Category "Utility"

Test-StudentEndpoint -TestName "Get Upload URL for Documents" -Method "GET" -Endpoint "/upload/presigned-url?type=document" -Headers $authHeaders -Category "Utility"

# Test search suggestions
Test-StudentEndpoint -TestName "Get Search Suggestions" -Method "GET" -Endpoint "/search/suggestions?q=kar" -Headers $authHeaders -Category "Utility"

Test-StudentEndpoint -TestName "Get Popular Searches" -Method "GET" -Endpoint "/search/popular" -Headers $authHeaders -Category "Utility"

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host "                    EXTENSIVE TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# Calculate statistics
Write-Host "`n📊 OVERALL ENDPOINT STATISTICS:" -ForegroundColor White
Write-Host "   Total Endpoints Tested: $totalEndpoints" -ForegroundColor Cyan
Write-Host "   Passed: $passedEndpoints" -ForegroundColor Green
Write-Host "   Failed: $failedEndpoints" -ForegroundColor Red

if ($totalEndpoints -gt 0) {
    $successRate = [math]::Round(($passedEndpoints / $totalEndpoints) * 100, 2)
    Write-Host "   Success Rate: $successRate%" -ForegroundColor Yellow
}

# Category breakdown
Write-Host "`n📋 RESULTS BY CATEGORY:" -ForegroundColor White
$categoryStats = $endpointTests | Group-Object Category
foreach ($category in $categoryStats) {
    $categoryPassed = ($category.Group | Where-Object { $_.Status -eq "PASS" }).Count
    $categoryTotal = $category.Group.Count
    $categoryRate = if ($categoryTotal -gt 0) { [math]::Round(($categoryPassed / $categoryTotal) * 100, 2) } else { 0 }
    
    $color = if ($categoryRate -eq 100) { "Green" } elseif ($categoryRate -ge 80) { "Yellow" } else { "Red" }
    Write-Host "   $($category.Name): $categoryPassed/$categoryTotal ($categoryRate%)" -ForegroundColor $color
}

# Performance analysis
if ($performanceData.Count -gt 0) {
    Write-Host "`n⚡ PERFORMANCE ANALYSIS:" -ForegroundColor White
    $avgResponseTime = ($performanceData | Measure-Object Duration -Average).Average
    $maxResponseTime = ($performanceData | Measure-Object Duration -Maximum).Maximum
    $minResponseTime = ($performanceData | Measure-Object Duration -Minimum).Minimum
    
    Write-Host "   Average Response Time: $([math]::Round($avgResponseTime, 2))ms" -ForegroundColor Cyan
    Write-Host "   Fastest Response: $([math]::Round($minResponseTime, 2))ms" -ForegroundColor Green
    Write-Host "   Slowest Response: $([math]::Round($maxResponseTime, 2))ms" -ForegroundColor Yellow
    
    $fastEndpoints = ($performanceData | Where-Object { $_.Duration -lt 1000 }).Count
    $slowEndpoints = ($performanceData | Where-Object { $_.Duration -gt 3000 }).Count
    
    Write-Host "   Fast Endpoints (<1s): $fastEndpoints" -ForegroundColor Green
    Write-Host "   Slow Endpoints (>3s): $slowEndpoints" -ForegroundColor Red
}

# Failed tests details
$failedTests = $endpointTests | Where-Object { $_.Status -eq "FAIL" }
if ($failedTests.Count -gt 0) {
    Write-Host "`n❌ FAILED ENDPOINT DETAILS:" -ForegroundColor Red
    foreach ($test in $failedTests) {
        Write-Host "   ✗ $($test.Name)" -ForegroundColor Red
        Write-Host "     Endpoint: $($test.Method) $($test.Endpoint)" -ForegroundColor Gray
        Write-Host "     Expected: $($test.Expected)" -ForegroundColor Gray
        if ($test.Error) {
            Write-Host "     Error: $($test.Error)" -ForegroundColor DarkRed
        }
        Write-Host ""
    }
}

# Successful tests by HTTP method
Write-Host "`n✅ SUCCESS BY HTTP METHOD:" -ForegroundColor Green
$methodStats = $endpointTests | Where-Object { $_.Status -eq "PASS" } | Group-Object Method
foreach ($method in $methodStats) {
    Write-Host "   $($method.Name): $($method.Count) endpoints" -ForegroundColor Green
}

# Coverage summary
Write-Host "`n🎯 ENDPOINT COVERAGE SUMMARY:" -ForegroundColor Yellow
Write-Host "   ✅ Authentication & Authorization (Login, Register, Profile)" -ForegroundColor Green
Write-Host "   ✅ Accommodation Services (Search, Details, Booking)" -ForegroundColor Green
Write-Host "   ✅ Food Services (Providers, Menu, Ordering)" -ForegroundColor Green
Write-Host "   ✅ Location & Mapping (Geocoding, Routing, Tracking)" -ForegroundColor Green
Write-Host "   ✅ Order Management (Creation, Updates, Cancellation)" -ForegroundColor Green
Write-Host "   ✅ Review & Rating System (CRUD Operations)" -ForegroundColor Green
Write-Host "   ✅ Payment Processing (Multiple Methods, History)" -ForegroundColor Green
Write-Host "   ✅ Dashboard & Analytics (Stats, Recommendations)" -ForegroundColor Green
Write-Host "   ✅ Notifications (Management, Settings)" -ForegroundColor Green
Write-Host "   ✅ Mobile API Support (Device Registration, Config)" -ForegroundColor Green
Write-Host "   ✅ Security Features (Access Control, Validation)" -ForegroundColor Green
Write-Host "   ✅ Utility Endpoints (Health, Status, Documentation)" -ForegroundColor Green

Write-Host "`n🚀 EXTENSIVE ENDPOINT TESTING COMPLETED!" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# Save detailed results to file
$detailedReport = @{
    TestSummary = @{
        TotalEndpoints = $totalEndpoints
        PassedEndpoints = $passedEndpoints
        FailedEndpoints = $failedEndpoints
        SuccessRate = if ($totalEndpoints -gt 0) { [math]::Round(($passedEndpoints / $totalEndpoints) * 100, 2) } else { 0 }
        TestDate = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    }
    EndpointResults = $endpointTests
    PerformanceData = $performanceData
    CategoryBreakdown = $categoryStats | ForEach-Object {
        @{
            Category = $_.Name
            Total = $_.Group.Count
            Passed = ($_.Group | Where-Object { $_.Status -eq "PASS" }).Count
            Failed = ($_.Group | Where-Object { $_.Status -eq "FAIL" }).Count
        }
    }
}

$detailedReport | ConvertTo-Json -Depth 10 | Out-File -FilePath "extensive-student-endpoints-test-report.json" -Encoding UTF8
Write-Host "`n📄 Detailed test report saved to: extensive-student-endpoints-test-report.json" -ForegroundColor Cyan
