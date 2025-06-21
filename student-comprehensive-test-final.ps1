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
        [string]$Body = $null
    )
    
    try {
        Write-Host "`n🧪 Testing: $Name" -ForegroundColor Yellow
        
        $params = @{
            Uri = $Url
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

Write-Host "`n🔐 PHASE 1: AUTHENTICATION" -ForegroundColor Magenta

# 1. Student Login
Write-Host "`n🔑 1. Student Login" -ForegroundColor Blue
$loginData = '{"email":"test.student@example.com","password":"password123"}'
$loginResponse = Test-Endpoint -Name "Student Login" -Method "POST" -Url "$baseUrl/auth/login" -Body $loginData

$authToken = ""
if ($loginResponse) {
    $authToken = $loginResponse.access_token
    Write-Host "   🎫 Token obtained successfully" -ForegroundColor Green
}

$authHeaders = @{
    "Authorization" = "Bearer $authToken"
}

# 2. Get Profile
Write-Host "`n👤 2. Get Student Profile" -ForegroundColor Blue
Test-Endpoint -Name "Get Profile" -Method "GET" -Url "$baseUrl/user/profile" -Headers $authHeaders

Write-Host "`n🏠 PHASE 2: ACCOMMODATION SERVICES" -ForegroundColor Magenta

# 3. Get All Accommodations
Write-Host "`n📋 3. Get All Accommodations" -ForegroundColor Blue
$accommodationsResponse = Test-Endpoint -Name "Get All Accommodations" -Method "GET" -Url "$baseUrl/accommodation" -Headers $authHeaders

# 4. Search Accommodations
Write-Host "`n🔍 4. Search Accommodations" -ForegroundColor Blue
Test-Endpoint -Name "Search Accommodations" -Method "GET" -Url "$baseUrl/accommodation/search" -Headers $authHeaders

$accommodationId = ""
if ($accommodationsResponse -and $accommodationsResponse.Count -gt 0) {
    $accommodationId = $accommodationsResponse[0]._id
    Write-Host "   🏠 Using accommodation: $accommodationId" -ForegroundColor Green
    
    # 5. Get Specific Accommodation
    Write-Host "`n🏠 5. Get Specific Accommodation" -ForegroundColor Blue
    Test-Endpoint -Name "Get Specific Accommodation" -Method "GET" -Url "$baseUrl/accommodation/$accommodationId" -Headers $authHeaders
}

Write-Host "`n📅 PHASE 3: BOOKING SERVICES" -ForegroundColor Magenta

$bookingId = ""
if ($accommodationId) {
    # 6. Create Booking
    Write-Host "`n📅 6. Create Booking" -ForegroundColor Blue
    $bookingData = '{"accommodation":"' + $accommodationId + '","start_date":"2025-07-01","end_date":"2025-07-15","guests":1,"total_price":500.00}'
    $bookingResponse = Test-Endpoint -Name "Create Booking" -Method "POST" -Url "$baseUrl/booking" -Headers $authHeaders -Body $bookingData
    
    if ($bookingResponse) {
        $bookingId = $bookingResponse._id
        Write-Host "   📋 Booking created: $bookingId" -ForegroundColor Green
    }
}

# 7. Get My Bookings
Write-Host "`n📜 7. Get My Bookings" -ForegroundColor Blue
Test-Endpoint -Name "Get My Bookings" -Method "GET" -Url "$baseUrl/booking/user" -Headers $authHeaders

Write-Host "`n🗺️ PHASE 4: MAP SERVICES" -ForegroundColor Magenta

# 8. Geocoding
Write-Host "`n📍 8. Geocoding Service" -ForegroundColor Blue
$geocodeData = '{"address":"Karachi, Pakistan"}'
Test-Endpoint -Name "Geocode Address" -Method "POST" -Url "$baseUrl/maps/geocode" -Headers $authHeaders -Body $geocodeData

# 9. Reverse Geocoding
Write-Host "`n🔄 9. Reverse Geocoding" -ForegroundColor Blue
$reverseGeocodeData = '{"latitude":24.8607,"longitude":67.0011}'
Test-Endpoint -Name "Reverse Geocode" -Method "POST" -Url "$baseUrl/maps/reverse-geocode" -Headers $authHeaders -Body $reverseGeocodeData

# 10. Calculate Route
Write-Host "`n🛣️ 10. Calculate Route" -ForegroundColor Blue
$routeData = '{"origin":{"latitude":24.8607,"longitude":67.0011},"destination":{"latitude":24.8700,"longitude":67.0300},"mode":"driving"}'
Test-Endpoint -Name "Calculate Route" -Method "POST" -Url "$baseUrl/maps/calculate-route" -Headers $authHeaders -Body $routeData

Write-Host "`n🍕 PHASE 5: FOOD SERVICES" -ForegroundColor Magenta

# 11. Get Food Providers
Write-Host "`n🏪 11. Get Food Providers" -ForegroundColor Blue
Test-Endpoint -Name "Get Food Providers" -Method "GET" -Url "$baseUrl/food-provider" -Headers $authHeaders

# 12. Create Order
Write-Host "`n🛒 12. Create Food Order" -ForegroundColor Blue
$orderData = '{"items":[{"menu_item":"test_item_id","quantity":2,"price":15.99}],"total_price":31.98,"delivery_address":"Test Address"}'
$orderResponse = Test-Endpoint -Name "Create Order" -Method "POST" -Url "$baseUrl/order" -Headers $authHeaders -Body $orderData

$orderId = ""
if ($orderResponse) {
    $orderId = $orderResponse._id
    Write-Host "   🛒 Order created: $orderId" -ForegroundColor Green
}

# 13. Get My Orders
Write-Host "`n📜 13. Get My Orders" -ForegroundColor Blue
Test-Endpoint -Name "Get My Orders" -Method "GET" -Url "$baseUrl/order/user" -Headers $authHeaders

Write-Host "`n📍 PHASE 6: ORDER TRACKING" -ForegroundColor Magenta

if ($orderId) {
    # 14. Set Delivery Location
    Write-Host "`n📍 14. Set Delivery Location" -ForegroundColor Blue
    $deliveryData = '{"coordinates":{"latitude":24.8607,"longitude":67.0011},"address":"Test University","landmark":"Main Gate"}'
    Test-Endpoint -Name "Set Delivery Location" -Method "PUT" -Url "$baseUrl/order-tracking/$orderId/delivery-location" -Headers $authHeaders -Body $deliveryData
}

# 15. Track Order
Write-Host "`n📱 15. Track Order" -ForegroundColor Blue
$trackingData = '{"currentLocation":{"latitude":24.8650,"longitude":67.0150}}'
Test-Endpoint -Name "Track Order" -Method "POST" -Url "$baseUrl/maps/track-order" -Headers $authHeaders -Body $trackingData

# 16. Route Optimization
Write-Host "`n🛣️ 16. Route Optimization" -ForegroundColor Blue
$optimizeData = '{"startLocation":{"latitude":24.8607,"longitude":67.0011},"deliveryLocations":[{"latitude":24.8650,"longitude":67.0150}]}'
Test-Endpoint -Name "Optimize Route" -Method "POST" -Url "$baseUrl/order-tracking/optimize-route" -Headers $authHeaders -Body $optimizeData

Write-Host "`n⭐ PHASE 7: REVIEWS" -ForegroundColor Magenta

if ($accommodationId) {
    # 17. Create Review
    Write-Host "`n⭐ 17. Create Review" -ForegroundColor Blue
    $reviewData = '{"target_id":"' + $accommodationId + '","target_type":"accommodation","rating":4,"comment":"Great accommodation!"}'
    Test-Endpoint -Name "Create Review" -Method "POST" -Url "$baseUrl/review" -Headers $authHeaders -Body $reviewData
}

# 18. Get My Reviews
Write-Host "`n📜 18. Get My Reviews" -ForegroundColor Blue
Test-Endpoint -Name "Get My Reviews" -Method "GET" -Url "$baseUrl/review/user" -Headers $authHeaders

Write-Host "`n💳 PHASE 8: PAYMENTS" -ForegroundColor Magenta

if ($bookingId) {
    # 19. Process Payment
    Write-Host "`n💳 19. Process Payment" -ForegroundColor Blue
    $paymentData = '{"booking_id":"' + $bookingId + '","amount":500.00,"payment_method":"credit_card"}'
    Test-Endpoint -Name "Process Payment" -Method "POST" -Url "$baseUrl/payment/booking" -Headers $authHeaders -Body $paymentData
}

# 20. Get Payment History
Write-Host "`n📜 20. Get Payment History" -ForegroundColor Blue
Test-Endpoint -Name "Get Payment History" -Method "GET" -Url "$baseUrl/payment/user" -Headers $authHeaders

Write-Host "`n📊 PHASE 9: DASHBOARD" -ForegroundColor Magenta

# 21. Get Student Dashboard
Write-Host "`n📊 21. Get Student Dashboard" -ForegroundColor Blue
Test-Endpoint -Name "Get Dashboard" -Method "GET" -Url "$baseUrl/user/student/dashboard" -Headers $authHeaders

Write-Host "`n🔍 PHASE 10: ADDITIONAL USER OPERATIONS" -ForegroundColor Magenta

# 22. Update Profile
Write-Host "`n✏️ 22. Update Profile" -ForegroundColor Blue
$updateData = '{"name":"Updated Test Student","phone":"03009876543"}'
Test-Endpoint -Name "Update Profile" -Method "PUT" -Url "$baseUrl/user/profile" -Headers $authHeaders -Body $updateData

# 23. Get Reviews for Accommodation
if ($accommodationId) {
    Write-Host "`n📖 23. Get Reviews for Accommodation" -ForegroundColor Blue
    Test-Endpoint -Name "Get Accommodation Reviews" -Method "GET" -Url "$baseUrl/review/target/accommodation/$accommodationId" -Headers $authHeaders
}

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

Write-Host "`n🎯 FEATURE COVERAGE TESTED:" -ForegroundColor Yellow
Write-Host "   ✅ Authentication & User Management" -ForegroundColor Green
Write-Host "   ✅ Accommodation Search & Booking" -ForegroundColor Green
Write-Host "   ✅ Map & Location Services" -ForegroundColor Green
Write-Host "   ✅ Food Service & Orders" -ForegroundColor Green
Write-Host "   ✅ Order Tracking & Route Optimization" -ForegroundColor Green
Write-Host "   ✅ Reviews & Ratings" -ForegroundColor Green
Write-Host "   ✅ Payment Processing" -ForegroundColor Green
Write-Host "   ✅ Student Dashboard & Profile Management" -ForegroundColor Green

Write-Host "`n🚀 Student role testing completed!" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
