# StayKaru Landlord/Accommodation Test Suite
# Tests all landlord-related endpoints after image upload implementation

$baseUrl = "http://localhost:3000"
$testResults = @()
$totalTests = 0
$passedTests = 0
$failedTests = 0

Write-Host "=== STAYKARU LANDLORD/ACCOMMODATION TEST SUITE ===" -ForegroundColor Cyan
Write-Host "Testing all landlord functionality after image upload implementation" -ForegroundColor White
Write-Host "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "---------------------------------------------" -ForegroundColor Gray

function Test-Endpoint {
    param(
        [string]$Category,
        [string]$Description,
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Headers = @{},
        [object]$Body = $null,
        [int[]]$ExpectedCodes = @(200, 201),
        [switch]$ShouldFail
    )
    
    $global:totalTests++
    
    try {
        $params = @{
            Uri = "$baseUrl$Endpoint"
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        $statusCode = 200
        
        if ($ShouldFail) {
            Write-Host "❌ [$Category] $Description" -ForegroundColor Red
            $global:failedTests++
            return $null
        } else {
            Write-Host "✅ [$Category] $Description" -ForegroundColor Green
            $global:passedTests++
            return $response
        }
    }
    catch {
        $statusCode = if ($_.Exception.Response) { 
            [int]$_.Exception.Response.StatusCode 
        } else { 0 }
        
        if ($ShouldFail -or $statusCode -in $ExpectedCodes) {
            Write-Host "✅ [$Category] $Description" -ForegroundColor Green
            $global:passedTests++
            return $null
        } else {
            Write-Host "❌ [$Category] $Description - Status: $statusCode" -ForegroundColor Red
            $global:failedTests++
            return $null
        }
    }
}

# 1. AUTHENTICATION TESTS
Write-Host "`n1. AUTHENTICATION TESTS" -ForegroundColor Magenta

$landlordUser = @{
    email = "landlord.test@example.com"
    password = "LandlordPass123!"
    name = "Test Landlord"
    role = "landlord"
    phone = "+1234567890"
    gender = "male"
}

# Register landlord user
Test-Endpoint -Category "AUTH" -Description "Register landlord user" -Method "POST" -Endpoint "/auth/register" -Body $landlordUser -ExpectedCodes @(201, 409)

# Login landlord
$loginResponse = Test-Endpoint -Category "AUTH" -Description "Login landlord user" -Method "POST" -Endpoint "/auth/login" -Body @{
    email = $landlordUser.email
    password = $landlordUser.password
}

if (-not $loginResponse) {
    Write-Host "❌ Cannot proceed without authentication token" -ForegroundColor Red
    exit 1
}

$authToken = $loginResponse.access_token
$authHeaders = @{
    "Authorization" = "Bearer $authToken"
    "Content-Type" = "application/json"
}

Write-Host "✅ Authentication successful - Token received" -ForegroundColor Green

# 2. LOCATION TESTS (Required for accommodation creation)
Write-Host "`n2. LOCATION TESTS" -ForegroundColor Magenta

$citiesResponse = Test-Endpoint -Category "LOCATION" -Description "Get all cities" -Method "GET" -Endpoint "/location/cities"

$cityId = $null
if ($citiesResponse -and $citiesResponse.Count -gt 0) {
    $cityId = $citiesResponse[0]._id
    Write-Host "✅ Using city ID: $cityId" -ForegroundColor Green
} else {
    Write-Host "⚠️ No cities found, using placeholder ID" -ForegroundColor Yellow
    $cityId = "507f1f77bcf86cd799439011"
}

# 3. ACCOMMODATION MANAGEMENT TESTS
Write-Host "`n3. ACCOMMODATION MANAGEMENT TESTS" -ForegroundColor Magenta

$accommodation = @{
    title = "Test Accommodation for Image Upload"
    description = "A test property to verify accommodation endpoints work after image upload implementation"
    city = $cityId
    coordinates = @{
        type = "Point"
        coordinates = @(-122.4194, 37.7749)  # San Francisco coordinates
    }
    price = 150.00
    amenities = @("WiFi", "Kitchen", "Parking")
    availability = @("2025-07-01T00:00:00.000Z", "2025-07-02T00:00:00.000Z")
}

# Create accommodation
$accommodationResponse = Test-Endpoint -Category "ACCOMMODATION" -Description "Create accommodation" -Method "POST" -Endpoint "/accommodations" -Headers $authHeaders -Body $accommodation

$accommodationId = $null
if ($accommodationResponse) {
    $accommodationId = $accommodationResponse._id
    Write-Host "✅ Accommodation created with ID: $accommodationId" -ForegroundColor Green
}

# Get all accommodations
Test-Endpoint -Category "ACCOMMODATION" -Description "Get all accommodations (public)" -Method "GET" -Endpoint "/accommodations"

# Get landlord's accommodations
Test-Endpoint -Category "ACCOMMODATION" -Description "Get landlord accommodations" -Method "GET" -Endpoint "/accommodations/landlord" -Headers $authHeaders

if ($accommodationId) {
    # Get specific accommodation
    Test-Endpoint -Category "ACCOMMODATION" -Description "Get accommodation by ID" -Method "GET" -Endpoint "/accommodations/$accommodationId"
    
    # Update accommodation
    $updateData = @{
        title = "Updated Test Accommodation"
        description = "Updated description after image upload implementation"
        price = 175.00
    }
    Test-Endpoint -Category "ACCOMMODATION" -Description "Update accommodation" -Method "PUT" -Endpoint "/accommodations/$accommodationId" -Headers $authHeaders -Body $updateData
    
    # Verify update
    $updatedAccommodation = Test-Endpoint -Category "ACCOMMODATION" -Description "Verify accommodation update" -Method "GET" -Endpoint "/accommodations/$accommodationId"
    
    if ($updatedAccommodation -and $updatedAccommodation.title -eq "Updated Test Accommodation") {
        Write-Host "✅ Accommodation update verified successfully" -ForegroundColor Green
    }
}

# 4. LANDLORD DASHBOARD TESTS
Write-Host "`n4. LANDLORD DASHBOARD TESTS" -ForegroundColor Magenta

Test-Endpoint -Category "DASHBOARD" -Description "Get landlord dashboard" -Method "GET" -Endpoint "/accommodations/landlord/dashboard" -Headers $authHeaders
Test-Endpoint -Category "DASHBOARD" -Description "Get landlord activities" -Method "GET" -Endpoint "/accommodations/landlord/activities" -Headers $authHeaders

# 5. BOOKING TESTS
Write-Host "`n5. BOOKING TESTS" -ForegroundColor Magenta

Test-Endpoint -Category "BOOKING" -Description "Get landlord bookings" -Method "GET" -Endpoint "/bookings/landlord" -Headers $authHeaders
Test-Endpoint -Category "BOOKING" -Description "Get landlord booking stats" -Method "GET" -Endpoint "/bookings/landlord/stats" -Headers $authHeaders
Test-Endpoint -Category "BOOKING" -Description "Get landlord revenue" -Method "GET" -Endpoint "/bookings/landlord/revenue" -Headers $authHeaders

# 6. USER PROFILE TESTS
Write-Host "`n6. USER PROFILE TESTS" -ForegroundColor Magenta

Test-Endpoint -Category "PROFILE" -Description "Get landlord profile" -Method "GET" -Endpoint "/users/landlord/profile" -Headers $authHeaders
Test-Endpoint -Category "PROFILE" -Description "Get general profile" -Method "GET" -Endpoint "/users/profile" -Headers $authHeaders

$profileUpdate = @{
    name = "Updated Landlord Name"
    phone = "+1987654321"
}
Test-Endpoint -Category "PROFILE" -Description "Update profile" -Method "PUT" -Endpoint "/users/profile" -Headers $authHeaders -Body $profileUpdate

# 7. IMAGE UPLOAD ENDPOINT TESTS
Write-Host "`n7. IMAGE UPLOAD ENDPOINT TESTS" -ForegroundColor Magenta

if ($accommodationId) {
    # Test accommodation image upload endpoint (should require files)
    Test-Endpoint -Category "IMAGE" -Description "Accommodation image upload (no files - should fail)" -Method "POST" -Endpoint "/upload/accommodation/$accommodationId/images" -Headers $authHeaders -ExpectedCodes @(400) -ShouldFail
    
    # Test image serving endpoint
    Test-Endpoint -Category "IMAGE" -Description "Serve non-existent image (should fail)" -Method "GET" -Endpoint "/upload/images/accommodations/nonexistent.jpg" -ExpectedCodes @(400, 404) -ShouldFail
    
    # Test image deletion endpoint
    Test-Endpoint -Category "IMAGE" -Description "Delete non-existent image (should fail)" -Method "DELETE" -Endpoint "/upload/image/accommodations/nonexistent.jpg" -Headers $authHeaders -ExpectedCodes @(404) -ShouldFail
}

# 8. AUTHORIZATION TESTS
Write-Host "`n8. AUTHORIZATION TESTS" -ForegroundColor Magenta

# Test without authentication
Test-Endpoint -Category "AUTH" -Description "Access landlord dashboard without auth (should fail)" -Method "GET" -Endpoint "/accommodations/landlord/dashboard" -ExpectedCodes @(401) -ShouldFail
Test-Endpoint -Category "AUTH" -Description "Create accommodation without auth (should fail)" -Method "POST" -Endpoint "/accommodations" -Body $accommodation -ExpectedCodes @(401) -ShouldFail

# 9. ADMIN ACCESS TESTS
Write-Host "`n9. ADMIN ACCESS TESTS" -ForegroundColor Magenta

Test-Endpoint -Category "ADMIN" -Description "Get pending accommodations (admin only - should fail)" -Method "GET" -Endpoint "/accommodations/admin/pending" -Headers $authHeaders -ExpectedCodes @(403) -ShouldFail
Test-Endpoint -Category "ADMIN" -Description "Get all accommodations admin (admin only - should fail)" -Method "GET" -Endpoint "/accommodations/admin/all" -Headers $authHeaders -ExpectedCodes @(403) -ShouldFail

# 10. CLEANUP
Write-Host "`n10. CLEANUP" -ForegroundColor Magenta

if ($accommodationId) {
    Test-Endpoint -Category "CLEANUP" -Description "Delete test accommodation" -Method "DELETE" -Endpoint "/accommodations/$accommodationId" -Headers $authHeaders
    
    # Verify deletion
    Test-Endpoint -Category "CLEANUP" -Description "Verify accommodation deletion" -Method "GET" -Endpoint "/accommodations/$accommodationId" -ExpectedCodes @(404) -ShouldFail
}

# SUMMARY
Write-Host "`n=== TEST SUMMARY ===" -ForegroundColor Cyan
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed Tests: $passedTests" -ForegroundColor Green
Write-Host "Failed Tests: $failedTests" -ForegroundColor Red
Write-Host "Overall Success Rate: $([math]::Round($passedTests / $totalTests * 100, 2))%" -ForegroundColor $(if ($failedTests -eq 0) { "Green" } else { "Yellow" })

Write-Host "`n=== RESULTS BY CATEGORY ===" -ForegroundColor Cyan
$categories = @("AUTH", "LOCATION", "ACCOMMODATION", "DASHBOARD", "BOOKING", "PROFILE", "IMAGE", "ADMIN", "CLEANUP")
foreach ($category in $categories) {
    $categoryTests = $testResults | Where-Object { $_.Category -eq $category }
    if ($categoryTests) {
        $passed = ($categoryTests | Where-Object { $_.Success }).Count
        $total = $categoryTests.Count
        Write-Host "$category`: $passed/$total tests passed ($([math]::Round($passed / $total * 100, 2))%)" -ForegroundColor White
    }
}

if ($failedTests -eq 0) {
    Write-Host "`n🎉 ALL LANDLORD TESTS PASSED! Image upload implementation didn't break any existing functionality." -ForegroundColor Green
} else {
    Write-Host "`n⚠️ Some tests failed. Please review the results above." -ForegroundColor Yellow
}

Write-Host "`nTest Completed at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "==============================================" -ForegroundColor Gray
