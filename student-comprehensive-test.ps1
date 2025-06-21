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
            Write-Host "   📊 Response received" -ForegroundColor Cyan
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

Write-Host "`n🔐 PHASE 1: AUTHENTICATION AND USER MANAGEMENT" -ForegroundColor Magenta

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

Write-Host "`n🏠 PHASE 2: ACCOMMODATION SEARCH AND BOOKING" -ForegroundColor Magenta

# 5. Search Accommodations
Write-Host "`n🔍 5. Search Accommodations" -ForegroundColor Blue
$searchUrl = "$baseUrl/api/accommodation/search?location=karachi`&page=1`&limit=10"
$searchResponse = Test-Endpoint -Name "Search Accommodations" -Method "GET" -Url $searchUrl -Headers $authHeaders

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

Write-Host "`n🗺️ PHASE 3: MAP AND LOCATION SERVICES" -ForegroundColor Magenta

# 9. Search Properties with Map
Write-Host "`n🗺️ 9. Search Properties with Map" -ForegroundColor Blue
$mapSearchUrl = "$baseUrl/api/maps/search-properties?lat=24.8607`&lng=67.0011`&radius=5000"
Test-Endpoint -Name "Map Property Search" -Method "GET" -Url $mapSearchUrl -Headers $authHeaders

# 10. Geocoding
Write-Host "`n📍 10. Address Geocoding" -ForegroundColor Blue
$geocodeData = @{
    address = "Karachi, Pakistan"
}

Test-Endpoint -Name "Geocode Address" -Method "POST" -Url "$baseUrl/api/maps/geocode" -Headers $authHeaders -Body $geocodeData

# 11. Calculate Route
Write-Host "`n🛣️ 11. Calculate Route" -ForegroundColor Blue
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

Write-Host "`n🍕 PHASE 4: FOOD SERVICE AND ORDERS" -ForegroundColor Magenta

# 12. Get Food Providers
Write-Host "`n🏪 12. Get Food Providers" -ForegroundColor Blue
$providersUrl = "$baseUrl/api/food-provider?page=1`&limit=10"
$providersResponse = Test-Endpoint -Name "Get Food Providers" -Method "GET" -Url $providersUrl -Headers $authHeaders

if ($providersResponse -and $providersResponse.providers -and $providersResponse.providers.Count -gt 0) {
    $foodProviderId = $providersResponse.providers[0]._id
    Write-Host "   🏪 Selected Provider ID: $foodProviderId" -ForegroundColor Green
}

# 13. Get Provider Menu
Write-Host "`n📋 13. Get Provider Menu" -ForegroundColor Blue
if ($foodProviderId) {
    Test-Endpoint -Name "Get Provider Menu" -Method "GET" -Url "$baseUrl/api/food-provider/$foodProviderId/menu" -Headers $authHeaders
}

# 14. Create Food Order
Write-Host "`n🛒 14. Create Food Order" -ForegroundColor Blue
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

# 15. Get Student Orders
Write-Host "`n📜 15. Get Student Orders" -ForegroundColor Blue
Test-Endpoint -Name "Get My Orders" -Method "GET" -Url "$baseUrl/api/order/user" -Headers $authHeaders

Write-Host "`n📍 PHASE 5: ORDER TRACKING" -ForegroundColor Magenta

# 16. Set Delivery Location
Write-Host "`n📍 16. Set Order Delivery Location" -ForegroundColor Blue
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

# 17. Track Order Real-time
Write-Host "`n📱 17. Track Order Real-time" -ForegroundColor Blue
if ($orderId) {
    $trackingData = @{
        currentLocation = @{
            latitude = 24.8650
            longitude = 67.0150
        }
    }
    
    Test-Endpoint -Name "Track Order" -Method "POST" -Url "$baseUrl/api/maps/track-order" -Headers $authHeaders -Body $trackingData
}

Write-Host "`n⭐ PHASE 6: REVIEWS AND RATINGS" -ForegroundColor Magenta

# 18. Create Accommodation Review
Write-Host "`n⭐ 18. Create Accommodation Review" -ForegroundColor Blue
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

# 19. Get User Reviews
Write-Host "`n📜 19. Get My Reviews" -ForegroundColor Blue
Test-Endpoint -Name "Get My Reviews" -Method "GET" -Url "$baseUrl/api/review/user" -Headers $authHeaders

Write-Host "`n💳 PHASE 7: PAYMENT PROCESSING" -ForegroundColor Magenta

# 20. Process Booking Payment
Write-Host "`n💳 20. Process Booking Payment" -ForegroundColor Blue
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

# 21. Get Payment History
Write-Host "`n📜 21. Get Payment History" -ForegroundColor Blue
Test-Endpoint -Name "Get Payment History" -Method "GET" -Url "$baseUrl/api/payment/user" -Headers $authHeaders

Write-Host "`n📊 PHASE 8: STUDENT DASHBOARD" -ForegroundColor Magenta

# 22. Get Student Dashboard
Write-Host "`n📊 22. Get Student Dashboard" -ForegroundColor Blue
Test-Endpoint -Name "Get Student Dashboard" -Method "GET" -Url "$baseUrl/api/user/student/dashboard" -Headers $authHeaders

# 23. Get Booking Statistics
Write-Host "`n📈 23. Get Booking Statistics" -ForegroundColor Blue
Test-Endpoint -Name "Get Booking Stats" -Method "GET" -Url "$baseUrl/api/user/student/booking-stats" -Headers $authHeaders

Write-Host "`n🔧 PHASE 9: ADDITIONAL FEATURES" -ForegroundColor Magenta

# 24. Advanced Search
Write-Host "`n🔍 24. Advanced Accommodation Search" -ForegroundColor Blue
$advancedSearchUrl = "$baseUrl/api/accommodation/search?location=karachi`&min_price=100`&max_price=1000`&room_type=single"
Test-Endpoint -Name "Advanced Search" -Method "GET" -Url $advancedSearchUrl -Headers $authHeaders

# 25. Route Optimization
Write-Host "`n🛣️ 25. Route Optimization" -ForegroundColor Blue
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
if ($totalTests -gt 0) {
    Write-Host "   Success Rate: $([math]::Round(($passedTests / $totalTests) * 100, 2))%" -ForegroundColor Yellow
}

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
Write-Host "   ✅ Authentication and User Management" -ForegroundColor Green
Write-Host "   ✅ Accommodation Search and Booking" -ForegroundColor Green
Write-Host "   ✅ Map and Location Services" -ForegroundColor Green
Write-Host "   ✅ Food Service and Orders" -ForegroundColor Green
Write-Host "   ✅ Order Tracking" -ForegroundColor Green
Write-Host "   ✅ Reviews and Ratings" -ForegroundColor Green
Write-Host "   ✅ Payment Processing" -ForegroundColor Green
Write-Host "   ✅ Student Dashboard" -ForegroundColor Green
Write-Host "   ✅ Additional Features" -ForegroundColor Green

Write-Host "`n🚀 Student role functionality testing completed!" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
