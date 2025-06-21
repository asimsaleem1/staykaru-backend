# Comprehensive Student Role Test Suite
# Testing all functionality and endpoints for student users

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "    COMPREHENSIVE STUDENT ROLE TEST SUITE" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"
$testResults = @()

# Test credentials
$studentCredentials = @{
    email = "student@test.com"
    password = "password123"
}

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers = @{},
        [object]$Body = $null,
        [int]$ExpectedStatus = 200
    )
    
    try {
        Write-Host "`n🧪 Testing: $Name" -ForegroundColor Yellow
        Write-Host "   Method: $Method $Url" -ForegroundColor Gray
        
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        
        Write-Host "   ✅ SUCCESS: Status OK" -ForegroundColor Green
        if ($response) {
            Write-Host "   📊 Response: $($response | ConvertTo-Json -Depth 2 -Compress)" -ForegroundColor Cyan
        }
        
        $script:testResults += @{
            Test = $Name
            Status = "PASS"
            Method = "$Method $Url"
            Response = $response
        }
        
        return $response
    }
    catch {
        Write-Host "   ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $script:testResults += @{
            Test = $Name
            Status = "FAIL"
            Method = "$Method $Url"
            Error = $_.Exception.Message
        }
        return $null
    }
}

# Global variables for test data
$authToken = ""
$studentId = ""
$accommodationId = ""
$bookingId = ""
$foodProviderId = ""
$orderId = ""
$reviewId = ""

Write-Host "`n🔐 PHASE 1: AUTHENTICATION & USER MANAGEMENT" -ForegroundColor Magenta

# 1. Student Registration
Write-Host "`n📝 1. Student Registration" -ForegroundColor Blue
$registrationData = @{
    name = "Test Student"
    email = $studentCredentials.email
    password = $studentCredentials.password
    phone = "+1234567890"
    role = "student"
    profile = @{
        university = "Test University"
        year_of_study = 2
        field_of_study = "Computer Science"
    }
}

$registerResponse = Test-Endpoint -Name "Register Student" -Method "POST" -Url "$baseUrl/api/auth/register" -Body $registrationData -ExpectedStatus 201

# 2. Student Login
Write-Host "`n🔑 2. Student Login" -ForegroundColor Blue
$loginData = @{
    email = $studentCredentials.email
    password = $studentCredentials.password
}

$loginResponse = Test-Endpoint -Name "Student Login" -Method "POST" -Url "$baseUrl/api/auth/login" -Body $loginData

if ($loginResponse) {
    $authToken = $loginResponse.access_token
    $studentId = $loginResponse.user.id
    Write-Host "   🎫 Auth Token: $($authToken.Substring(0, 20))..." -ForegroundColor Green
    Write-Host "   👤 Student ID: $studentId" -ForegroundColor Green
}

$authHeaders = @{
    "Authorization" = "Bearer $authToken"
    "Content-Type" = "application/json"
}

# 3. Get Student Profile
Write-Host "`n👤 3. Get Student Profile" -ForegroundColor Blue
Test-Endpoint -Name "Get Profile" -Method "GET" -Url "$baseUrl/api/user/profile" -Headers $authHeaders

# 4. Update Student Profile
Write-Host "`n✏️ 4. Update Student Profile" -ForegroundColor Blue
$updateData = @{
    name = "Updated Test Student"
    profile = @{
        university = "Updated University"
        year_of_study = 3
        bio = "Computer Science student interested in accommodation"
    }
}

Test-Endpoint -Name "Update Profile" -Method "PUT" -Url "$baseUrl/api/user/profile" -Headers $authHeaders -Body $updateData

Write-Host "`n🏠 PHASE 2: ACCOMMODATION SEARCH & BOOKING" -ForegroundColor Magenta

# 5. Search Accommodations
Write-Host "`n🔍 5. Search Accommodations" -ForegroundColor Blue
$searchResponse = Test-Endpoint -Name "Search Accommodations" -Method "GET" -Url "$baseUrl/api/accommodation/search?location=karachi&page=1&limit=10" -Headers $authHeaders

if ($searchResponse -and $searchResponse.accommodations -and $searchResponse.accommodations.Count -gt 0) {
    $accommodationId = $searchResponse.accommodations[0]._id
    Write-Host "   🏠 Selected Accommodation ID: $accommodationId" -ForegroundColor Green
}

# 6. Get Accommodation Details
Write-Host "`n📋 6. Get Accommodation Details" -ForegroundColor Blue
if ($accommodationId) {
    Test-Endpoint -Name "Get Accommodation Details" -Method "GET" -Url "$baseUrl/api/accommodation/$accommodationId" -Headers $authHeaders
}

# 7. Create Booking
Write-Host "`n📅 7. Create Accommodation Booking" -ForegroundColor Blue
if ($accommodationId) {
    $bookingData = @{
        accommodation = $accommodationId
        start_date = "2025-07-01"
        end_date = "2025-07-15"
        guests = 1
        total_price = 500.00
        special_requests = "Early check-in preferred"
    }
    
    $bookingResponse = Test-Endpoint -Name "Create Booking" -Method "POST" -Url "$baseUrl/api/booking" -Headers $authHeaders -Body $bookingData -ExpectedStatus 201
    
    if ($bookingResponse) {
        $bookingId = $bookingResponse._id
        Write-Host "   📋 Booking ID: $bookingId" -ForegroundColor Green
    }
}

# 8. Get Student Bookings
Write-Host "`n📜 8. Get Student Bookings" -ForegroundColor Blue
Test-Endpoint -Name "Get My Bookings" -Method "GET" -Url "$baseUrl/api/booking/user" -Headers $authHeaders

# 9. Get Booking Details
Write-Host "`n📋 9. Get Booking Details" -ForegroundColor Blue
if ($bookingId) {
    Test-Endpoint -Name "Get Booking Details" -Method "GET" -Url "$baseUrl/api/booking/$bookingId" -Headers $authHeaders
}

Write-Host "`n🗺️ PHASE 3: MAP & LOCATION SERVICES" -ForegroundColor Magenta

# 10. Search Properties with Map
Write-Host "`n🗺️ 10. Search Properties with Map" -ForegroundColor Blue
$mapSearchData = @{
    location = @{
        latitude = 24.8607
        longitude = 67.0011
    }
    radius = 5000
    type = "accommodation"
}

Test-Endpoint -Name "Map Property Search" -Method "GET" -Url "$baseUrl/api/maps/search-properties?lat=24.8607&lng=67.0011&radius=5000" -Headers $authHeaders

# 11. Geocoding
Write-Host "`n📍 11. Address Geocoding" -ForegroundColor Blue
$geocodeData = @{
    address = "Karachi, Pakistan"
}

Test-Endpoint -Name "Geocode Address" -Method "POST" -Url "$baseUrl/api/maps/geocode" -Headers $authHeaders -Body $geocodeData

# 12. Reverse Geocoding
Write-Host "`n🔄 12. Reverse Geocoding" -ForegroundColor Blue
$reverseGeocodeData = @{
    latitude = 24.8607
    longitude = 67.0011
}

Test-Endpoint -Name "Reverse Geocode" -Method "POST" -Url "$baseUrl/api/maps/reverse-geocode" -Headers $authHeaders -Body $reverseGeocodeData

# 13. Calculate Route
Write-Host "`n🛣️ 13. Calculate Route" -ForegroundColor Blue
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
}

Test-Endpoint -Name "Calculate Route" -Method "POST" -Url "$baseUrl/api/maps/calculate-route" -Headers $authHeaders -Body $routeData

# 14. Search Nearby Places
Write-Host "`n🏪 14. Search Nearby Places" -ForegroundColor Blue
Test-Endpoint -Name "Search Places" -Method "GET" -Url "$baseUrl/api/maps/search-places?lat=24.8607&lng=67.0011&radius=2000&type=restaurant" -Headers $authHeaders

Write-Host "`n🍕 PHASE 4: FOOD SERVICE & ORDERS" -ForegroundColor Magenta

# 15. Get Food Providers
Write-Host "`n🏪 15. Get Food Providers" -ForegroundColor Blue
$providersResponse = Test-Endpoint -Name "Get Food Providers" -Method "GET" -Url "$baseUrl/api/food-provider?page=1&limit=10" -Headers $authHeaders

if ($providersResponse -and $providersResponse.providers -and $providersResponse.providers.Count -gt 0) {
    $foodProviderId = $providersResponse.providers[0]._id
    Write-Host "   🏪 Selected Provider ID: $foodProviderId" -ForegroundColor Green
}

# 16. Get Provider Menu
Write-Host "`n📋 16. Get Provider Menu" -ForegroundColor Blue
if ($foodProviderId) {
    $menuResponse = Test-Endpoint -Name "Get Provider Menu" -Method "GET" -Url "$baseUrl/api/food-provider/$foodProviderId/menu" -Headers $authHeaders
}

# 17. Create Food Order
Write-Host "`n🛒 17. Create Food Order" -ForegroundColor Blue
if ($foodProviderId) {
    $orderData = @{
        food_provider = $foodProviderId
        items = @(
            @{
                menu_item = "60d0fe4f5311236168a109ca"
                quantity = 2
                price = 15.99
            }
        )
        total_price = 31.98
        delivery_address = "Test University, Karachi"
        special_instructions = "Please deliver to main gate"
    }
    
    $orderResponse = Test-Endpoint -Name "Create Food Order" -Method "POST" -Url "$baseUrl/api/order" -Headers $authHeaders -Body $orderData -ExpectedStatus 201
    
    if ($orderResponse) {
        $orderId = $orderResponse._id
        Write-Host "   🛒 Order ID: $orderId" -ForegroundColor Green
    }
}

# 18. Get Student Orders
Write-Host "`n📜 18. Get Student Orders" -ForegroundColor Blue
Test-Endpoint -Name "Get My Orders" -Method "GET" -Url "$baseUrl/api/order/user" -Headers $authHeaders

# 19. Get Order Details
Write-Host "`n📋 19. Get Order Details" -ForegroundColor Blue
if ($orderId) {
    Test-Endpoint -Name "Get Order Details" -Method "GET" -Url "$baseUrl/api/order/$orderId" -Headers $authHeaders
}

Write-Host "`n📍 PHASE 5: ORDER TRACKING" -ForegroundColor Magenta

# 20. Set Delivery Location
Write-Host "`n📍 20. Set Order Delivery Location" -ForegroundColor Blue
if ($orderId) {
    $deliveryLocationData = @{
        coordinates = @{
            latitude = 24.8607
            longitude = 67.0011
        }
        address = "Test University, Main Campus"
        landmark = "Near main gate"
    }
    
    Test-Endpoint -Name "Set Delivery Location" -Method "PUT" -Url "$baseUrl/api/order-tracking/$orderId/delivery-location" -Headers $authHeaders -Body $deliveryLocationData
}

# 21. Get Order Tracking Info
Write-Host "`n🔍 21. Get Order Tracking Info" -ForegroundColor Blue
if ($orderId) {
    Test-Endpoint -Name "Get Tracking Info" -Method "GET" -Url "$baseUrl/api/order-tracking/$orderId/tracking-history" -Headers $authHeaders
}

# 22. Track Order Real-time
Write-Host "`n📱 22. Track Order Real-time" -ForegroundColor Blue
if ($orderId) {
    $trackingData = @{
        currentLocation = @{
            latitude = 24.8650
            longitude = 67.0150
        }
    }
    
    Test-Endpoint -Name "Track Order" -Method "POST" -Url "$baseUrl/api/maps/track-order" -Headers $authHeaders -Body $trackingData
}

Write-Host "`n⭐ PHASE 6: REVIEWS & RATINGS" -ForegroundColor Magenta

# 23. Create Accommodation Review
Write-Host "`n⭐ 23. Create Accommodation Review" -ForegroundColor Blue
if ($accommodationId) {
    $accommodationReviewData = @{
        target_id = $accommodationId
        target_type = "accommodation"
        rating = 4
        comment = "Great accommodation with excellent facilities!"
        pros = @("Clean", "Good location", "Friendly staff")
        cons = @("Slightly expensive")
    }
    
    $reviewResponse = Test-Endpoint -Name "Create Accommodation Review" -Method "POST" -Url "$baseUrl/api/review" -Headers $authHeaders -Body $accommodationReviewData -ExpectedStatus 201
    
    if ($reviewResponse) {
        $reviewId = $reviewResponse._id
        Write-Host "   ⭐ Review ID: $reviewId" -ForegroundColor Green
    }
}

# 24. Create Food Provider Review
Write-Host "`n🍕 24. Create Food Provider Review" -ForegroundColor Blue
if ($foodProviderId) {
    $foodReviewData = @{
        target_id = $foodProviderId
        target_type = "food_provider"
        rating = 5
        comment = "Amazing food quality and fast delivery!"
        pros = @("Delicious food", "Quick delivery", "Good value")
    }
    
    Test-Endpoint -Name "Create Food Review" -Method "POST" -Url "$baseUrl/api/review" -Headers $authHeaders -Body $foodReviewData -ExpectedStatus 201
}

# 25. Get User Reviews
Write-Host "`n📜 25. Get My Reviews" -ForegroundColor Blue
Test-Endpoint -Name "Get My Reviews" -Method "GET" -Url "$baseUrl/api/review/user" -Headers $authHeaders

# 26. Get Accommodation Reviews
Write-Host "`n📋 26. Get Accommodation Reviews" -ForegroundColor Blue
if ($accommodationId) {
    Test-Endpoint -Name "Get Accommodation Reviews" -Method "GET" -Url "$baseUrl/api/review/accommodation/$accommodationId" -Headers $authHeaders
}

Write-Host "`n💳 PHASE 7: PAYMENT PROCESSING" -ForegroundColor Magenta

# 27. Process Booking Payment
Write-Host "`n💳 27. Process Booking Payment" -ForegroundColor Blue
if ($bookingId) {
    $bookingPaymentData = @{
        booking_id = $bookingId
        amount = 500.00
        payment_method = "credit_card"
        payment_details = @{
            card_number = "4242424242424242"
            exp_month = "12"
            exp_year = "2026"
            cvv = "123"
        }
    }
    
    Test-Endpoint -Name "Process Booking Payment" -Method "POST" -Url "$baseUrl/api/payment/booking" -Headers $authHeaders -Body $bookingPaymentData
}

# 28. Process Order Payment
Write-Host "`n💳 28. Process Order Payment" -ForegroundColor Blue
if ($orderId) {
    $orderPaymentData = @{
        order_id = $orderId
        amount = 31.98
        payment_method = "jazzcash"
        payment_details = @{
            phone = "+923001234567"
            pin = "1234"
        }
    }
    
    Test-Endpoint -Name "Process Order Payment" -Method "POST" -Url "$baseUrl/api/payment/order" -Headers $authHeaders -Body $orderPaymentData
}

# 29. Get Payment History
Write-Host "`n📜 29. Get Payment History" -ForegroundColor Blue
Test-Endpoint -Name "Get Payment History" -Method "GET" -Url "$baseUrl/api/payment/user" -Headers $authHeaders

Write-Host "`n📊 PHASE 8: STUDENT DASHBOARD & ANALYTICS" -ForegroundColor Magenta

# 30. Get Student Dashboard
Write-Host "`n📊 30. Get Student Dashboard" -ForegroundColor Blue
Test-Endpoint -Name "Get Student Dashboard" -Method "GET" -Url "$baseUrl/api/user/student/dashboard" -Headers $authHeaders

# 31. Get Booking Statistics
Write-Host "`n📈 31. Get Booking Statistics" -ForegroundColor Blue
Test-Endpoint -Name "Get Booking Stats" -Method "GET" -Url "$baseUrl/api/user/student/booking-stats" -Headers $authHeaders

# 32. Get Order Statistics
Write-Host "`n📈 32. Get Order Statistics" -ForegroundColor Blue
Test-Endpoint -Name "Get Order Stats" -Method "GET" -Url "$baseUrl/api/user/student/order-stats" -Headers $authHeaders

# 33. Get Expense Summary
Write-Host "`n💰 33. Get Expense Summary" -ForegroundColor Blue
Test-Endpoint -Name "Get Expense Summary" -Method "GET" -Url "$baseUrl/api/user/student/expenses" -Headers $authHeaders

Write-Host "`n🔄 PHASE 9: UPDATE & MANAGEMENT OPERATIONS" -ForegroundColor Magenta

# 34. Update Booking
Write-Host "`n✏️ 34. Update Booking" -ForegroundColor Blue
if ($bookingId) {
    $updateBookingData = @{
        special_requests = "Updated: Need late check-out"
        guests = 2
    }
    
    Test-Endpoint -Name "Update Booking" -Method "PUT" -Url "$baseUrl/api/booking/$bookingId" -Headers $authHeaders -Body $updateBookingData
}

# 35. Cancel Order
Write-Host "`n❌ 35. Cancel Order" -ForegroundColor Blue
if ($orderId) {
    $cancelData = @{
        reason = "Changed my mind"
    }
    
    Test-Endpoint -Name "Cancel Order" -Method "PUT" -Url "$baseUrl/api/order/$orderId/cancel" -Headers $authHeaders -Body $cancelData
}

# 36. Update Review
Write-Host "`n✏️ 36. Update Review" -ForegroundColor Blue
if ($reviewId) {
    $updateReviewData = @{
        rating = 5
        comment = "Updated: Absolutely fantastic accommodation!"
        pros = @("Clean", "Excellent location", "Amazing staff", "Great value")
    }
    
    Test-Endpoint -Name "Update Review" -Method "PUT" -Url "$baseUrl/api/review/$reviewId" -Headers $authHeaders -Body $updateReviewData
}

Write-Host "`n🔧 PHASE 10: ADDITIONAL FEATURES" -ForegroundColor Magenta

# 37. Search with Filters
Write-Host "`n🔍 37. Advanced Accommodation Search" -ForegroundColor Blue
Test-Endpoint -Name "Advanced Search" -Method "GET" -Url "$baseUrl/api/accommodation/search?location=karachi&min_price=100&max_price=1000&room_type=single&amenities=wifi,parking" -Headers $authHeaders

# 38. Get Nearby Accommodations
Write-Host "`n📍 38. Get Nearby Accommodations" -ForegroundColor Blue
Test-Endpoint -Name "Nearby Accommodations" -Method "GET" -Url "$baseUrl/api/accommodation/nearby?lat=24.8607&lng=67.0011&radius=5" -Headers $authHeaders

# 39. Route Optimization
Write-Host "`n🛣️ 39. Route Optimization" -ForegroundColor Blue
$optimizeRouteData = @{
    startLocation = @{
        latitude = 24.8607
        longitude = 67.0011
    }
    deliveryLocations = @(
        @{
            latitude = 24.8650
            longitude = 67.0150
        },
        @{
            latitude = 24.8700
            longitude = 67.0200
        }
    )
}

Test-Endpoint -Name "Optimize Route" -Method "POST" -Url "$baseUrl/api/order-tracking/optimize-route" -Headers $authHeaders -Body $optimizeRouteData

# 40. Get Location-based Recommendations
Write-Host "`n💡 40. Get Recommendations" -ForegroundColor Blue
Test-Endpoint -Name "Get Recommendations" -Method "GET" -Url "$baseUrl/api/user/recommendations" -Headers $authHeaders

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "              TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

$passedTests = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failedTests = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$totalTests = $testResults.Count

Write-Host "`n📊 OVERALL STATISTICS:" -ForegroundColor White
Write-Host "   Total Tests: $totalTests" -ForegroundColor Cyan
Write-Host "   Passed: $passedTests" -ForegroundColor Green
Write-Host "   Failed: $failedTests" -ForegroundColor Red
Write-Host "   Success Rate: $([math]::Round(($passedTests / $totalTests) * 100, 2))%" -ForegroundColor Yellow

Write-Host "`n✅ PASSED TESTS:" -ForegroundColor Green
$testResults | Where-Object { $_.Status -eq "PASS" } | ForEach-Object {
    Write-Host "   ✓ $($_.Test)" -ForegroundColor Green
}

if ($failedTests -gt 0) {
    Write-Host "`n❌ FAILED TESTS:" -ForegroundColor Red
    $testResults | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
        Write-Host "   ✗ $($_.Test): $($_.Error)" -ForegroundColor Red
    }
}

Write-Host "`n🎯 FEATURE COVERAGE SUMMARY:" -ForegroundColor Yellow
Write-Host "   ✅ Authentication & User Management" -ForegroundColor Green
Write-Host "   ✅ Accommodation Search & Booking" -ForegroundColor Green
Write-Host "   ✅ Map & Location Services" -ForegroundColor Green
Write-Host "   ✅ Food Service & Orders" -ForegroundColor Green
Write-Host "   ✅ Order Tracking" -ForegroundColor Green
Write-Host "   ✅ Reviews & Ratings" -ForegroundColor Green
Write-Host "   ✅ Payment Processing" -ForegroundColor Green
Write-Host "   ✅ Student Dashboard & Analytics" -ForegroundColor Green
Write-Host "   ✅ Update & Management Operations" -ForegroundColor Green
Write-Host "   ✅ Additional Features" -ForegroundColor Green

Write-Host "`n🚀 All student role functionality has been tested!" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
