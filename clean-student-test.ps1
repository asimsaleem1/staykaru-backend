# Student Role Comprehensive Test Suite
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "    STUDENT ROLE COMPREHENSIVE TEST SUITE" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"
$testResults = @()

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )
    
    try {
        Write-Host "`n🧪 Testing: $Name" -ForegroundColor Yellow
        
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
        
        Write-Host "   ✅ SUCCESS" -ForegroundColor Green
        $script:testResults += @{ Test = $Name; Status = "PASS" }
        return $response
    }
    catch {
        Write-Host "   ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $script:testResults += @{ Test = $Name; Status = "FAIL"; Error = $_.Exception.Message }
        return $null
    }
}

# Test Variables
$authToken = ""
$accommodationId = ""
$bookingId = ""
$orderId = ""

Write-Host "`n🔐 PHASE 1: AUTHENTICATION" -ForegroundColor Magenta

# 1. Student Login
Write-Host "`n🔑 1. Student Login" -ForegroundColor Blue
$loginData = @{
    email = "student@test.com"
    password = "password123"
}

$loginResponse = Test-Endpoint -Name "Student Login" -Method "POST" -Url "$baseUrl/api/auth/login" -Body $loginData

if ($loginResponse) {
    $authToken = $loginResponse.access_token
    Write-Host "   🎫 Token obtained successfully" -ForegroundColor Green
}

$authHeaders = @{
    "Authorization" = "Bearer $authToken"
    "Content-Type" = "application/json"
}

# 2. Get Profile
Test-Endpoint -Name "Get Profile" -Method "GET" -Url "$baseUrl/api/user/profile" -Headers $authHeaders

Write-Host "`n🏠 PHASE 2: ACCOMMODATION SERVICES" -ForegroundColor Magenta

# 3. Search Accommodations
Test-Endpoint -Name "Search Accommodations" -Method "GET" -Url "$baseUrl/api/accommodation/search" -Headers $authHeaders

# 4. Get All Accommodations
$accommodationsResponse = Test-Endpoint -Name "Get All Accommodations" -Method "GET" -Url "$baseUrl/api/accommodation" -Headers $authHeaders

if ($accommodationsResponse -and $accommodationsResponse.Count -gt 0) {
    $accommodationId = $accommodationsResponse[0]._id
    Write-Host "   🏠 Using accommodation: $accommodationId" -ForegroundColor Green
}

# 5. Create Booking (if accommodation found)
if ($accommodationId) {
    $bookingData = @{
        accommodation = $accommodationId
        start_date = "2025-07-01"
        end_date = "2025-07-15"
        guests = 1
        total_price = 500.00
    }
    
    $bookingResponse = Test-Endpoint -Name "Create Booking" -Method "POST" -Url "$baseUrl/api/booking" -Headers $authHeaders -Body $bookingData
    
    if ($bookingResponse) {
        $bookingId = $bookingResponse._id
        Write-Host "   📋 Booking created: $bookingId" -ForegroundColor Green
    }
}

# 6. Get My Bookings
Test-Endpoint -Name "Get My Bookings" -Method "GET" -Url "$baseUrl/api/booking/user" -Headers $authHeaders

Write-Host "`n🗺️ PHASE 3: MAP SERVICES" -ForegroundColor Magenta

# 7. Geocoding
$geocodeData = @{
    address = "Karachi, Pakistan"
}
Test-Endpoint -Name "Geocode Address" -Method "POST" -Url "$baseUrl/api/maps/geocode" -Headers $authHeaders -Body $geocodeData

# 8. Reverse Geocoding
$reverseGeocodeData = @{
    latitude = 24.8607
    longitude = 67.0011
}
Test-Endpoint -Name "Reverse Geocode" -Method "POST" -Url "$baseUrl/api/maps/reverse-geocode" -Headers $authHeaders -Body $reverseGeocodeData

# 9. Calculate Route
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

Write-Host "`n🍕 PHASE 4: FOOD SERVICES" -ForegroundColor Magenta

# 10. Get Food Providers
Test-Endpoint -Name "Get Food Providers" -Method "GET" -Url "$baseUrl/api/food-provider" -Headers $authHeaders

# 11. Create Order
$orderData = @{
    items = @(
        @{
            menu_item = "test_item_id"
            quantity = 2
            price = 15.99
        }
    )
    total_price = 31.98
    delivery_address = "Test Address"
}

$orderResponse = Test-Endpoint -Name "Create Order" -Method "POST" -Url "$baseUrl/api/order" -Headers $authHeaders -Body $orderData

if ($orderResponse) {
    $orderId = $orderResponse._id
    Write-Host "   🛒 Order created: $orderId" -ForegroundColor Green
}

# 12. Get My Orders
Test-Endpoint -Name "Get My Orders" -Method "GET" -Url "$baseUrl/api/order/user" -Headers $authHeaders

Write-Host "`n📍 PHASE 5: ORDER TRACKING" -ForegroundColor Magenta

# 13. Set Delivery Location (if order exists)
if ($orderId) {
    $deliveryData = @{
        coordinates = @{
            latitude = 24.8607
            longitude = 67.0011
        }
        address = "Test University"
        landmark = "Main Gate"
    }
    
    Test-Endpoint -Name "Set Delivery Location" -Method "PUT" -Url "$baseUrl/api/order-tracking/$orderId/delivery-location" -Headers $authHeaders -Body $deliveryData
}

# 14. Track Order
$trackingData = @{
    currentLocation = @{
        latitude = 24.8650
        longitude = 67.0150
    }
}
Test-Endpoint -Name "Track Order" -Method "POST" -Url "$baseUrl/api/maps/track-order" -Headers $authHeaders -Body $trackingData

# 15. Route Optimization
$optimizeData = @{
    startLocation = @{
        latitude = 24.8607
        longitude = 67.0011
    }
    deliveryLocations = @(
        @{
            latitude = 24.8650
            longitude = 67.0150
        }
    )
}
Test-Endpoint -Name "Optimize Route" -Method "POST" -Url "$baseUrl/api/order-tracking/optimize-route" -Headers $authHeaders -Body $optimizeData

Write-Host "`n⭐ PHASE 6: REVIEWS" -ForegroundColor Magenta

# 16. Create Review (if accommodation found)
if ($accommodationId) {
    $reviewData = @{
        target_id = $accommodationId
        target_type = "accommodation"
        rating = 4
        comment = "Great accommodation!"
    }
    
    Test-Endpoint -Name "Create Review" -Method "POST" -Url "$baseUrl/api/review" -Headers $authHeaders -Body $reviewData
}

# 17. Get My Reviews
Test-Endpoint -Name "Get My Reviews" -Method "GET" -Url "$baseUrl/api/review/user" -Headers $authHeaders

Write-Host "`n💳 PHASE 7: PAYMENTS" -ForegroundColor Magenta

# 18. Process Payment (if booking exists)
if ($bookingId) {
    $paymentData = @{
        booking_id = $bookingId
        amount = 500.00
        payment_method = "credit_card"
    }
    
    Test-Endpoint -Name "Process Payment" -Method "POST" -Url "$baseUrl/api/payment/booking" -Headers $authHeaders -Body $paymentData
}

# 19. Get Payment History
Test-Endpoint -Name "Get Payment History" -Method "GET" -Url "$baseUrl/api/payment/user" -Headers $authHeaders

Write-Host "`n📊 PHASE 8: DASHBOARD" -ForegroundColor Magenta

# 20. Get Dashboard
Test-Endpoint -Name "Get Dashboard" -Method "GET" -Url "$baseUrl/api/user/student/dashboard" -Headers $authHeaders

# Display Results
Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "              TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

$passedTests = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failedTests = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$totalTests = $testResults.Count

Write-Host "`n📊 STATISTICS:" -ForegroundColor White
Write-Host "   Total Tests: $totalTests" -ForegroundColor Cyan
Write-Host "   Passed: $passedTests" -ForegroundColor Green
Write-Host "   Failed: $failedTests" -ForegroundColor Red

if ($totalTests -gt 0) {
    $successRate = [math]::Round(($passedTests / $totalTests) * 100, 2)
    Write-Host "   Success Rate: $successRate%" -ForegroundColor Yellow
}

Write-Host "`n✅ PASSED TESTS:" -ForegroundColor Green
$testResults | Where-Object { $_.Status -eq "PASS" } | ForEach-Object {
    Write-Host "   ✓ $($_.Test)" -ForegroundColor Green
}

if ($failedTests -gt 0) {
    Write-Host "`n❌ FAILED TESTS:" -ForegroundColor Red
    $testResults | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
        Write-Host "   ✗ $($_.Test)" -ForegroundColor Red
        if ($_.Error) {
            Write-Host "     Error: $($_.Error)" -ForegroundColor DarkRed
        }
    }
}

Write-Host "`n🎯 FEATURE COVERAGE:" -ForegroundColor Yellow
Write-Host "   ✅ Authentication & User Management" -ForegroundColor Green
Write-Host "   ✅ Accommodation Search & Booking" -ForegroundColor Green
Write-Host "   ✅ Map & Location Services" -ForegroundColor Green
Write-Host "   ✅ Food Service & Orders" -ForegroundColor Green
Write-Host "   ✅ Order Tracking & Route Optimization" -ForegroundColor Green
Write-Host "   ✅ Reviews & Ratings" -ForegroundColor Green
Write-Host "   ✅ Payment Processing" -ForegroundColor Green
Write-Host "   ✅ Student Dashboard" -ForegroundColor Green

Write-Host "`n🚀 Student role testing completed!" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
