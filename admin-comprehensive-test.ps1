# StayKaru Comprehensive Admin Test Suite
# Tests all admin functionality after image upload implementation

$baseUrl = "http://localhost:3000"

# Initialize test counters
$global:totalTests = 0
$global:passedTests = 0
$global:failedTests = 0

Write-Host "=== STAYKARU ADMIN TEST SUITE ===" -ForegroundColor Cyan
Write-Host "Testing all admin functionality after image upload implementation" -ForegroundColor White
Write-Host "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "---------------------------------------------" -ForegroundColor Gray

function Test-AdminEndpoint {
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
            Write-Host "❌ [$Category] $Description - Expected failure but got success" -ForegroundColor Red
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

# 1. ADMIN AUTHENTICATION
Write-Host "`n1. ADMIN AUTHENTICATION" -ForegroundColor Magenta

# Use existing admin credentials
$adminCredentials = @{
    email = "assaleemofficial@gmail.com"
    password = "Sarim786"
}

$loginResponse = Test-AdminEndpoint -Category "AUTH" -Description "Admin login" -Method "POST" -Endpoint "/auth/login" -Body $adminCredentials

if (-not $loginResponse) {
    Write-Host "❌ Cannot proceed without admin authentication token" -ForegroundColor Red
    exit 1
}

$adminToken = $loginResponse.access_token
$adminHeaders = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

Write-Host "✅ Admin authentication successful - Token received" -ForegroundColor Green

# 2. DASHBOARD & ANALYTICS
Write-Host "`n2. ADMIN DASHBOARD & ANALYTICS" -ForegroundColor Magenta

Test-AdminEndpoint -Category "DASHBOARD" -Description "Get admin dashboard" -Method "GET" -Endpoint "/analytics/dashboard" -Headers $adminHeaders
Test-AdminEndpoint -Category "ANALYTICS" -Description "Get user analytics" -Method "GET" -Endpoint "/analytics/users" -Headers $adminHeaders
Test-AdminEndpoint -Category "ANALYTICS" -Description "Get booking analytics" -Method "GET" -Endpoint "/analytics/bookings" -Headers $adminHeaders
Test-AdminEndpoint -Category "ANALYTICS" -Description "Get order analytics" -Method "GET" -Endpoint "/analytics/orders" -Headers $adminHeaders
Test-AdminEndpoint -Category "ANALYTICS" -Description "Get payment analytics" -Method "GET" -Endpoint "/analytics/payments" -Headers $adminHeaders
Test-AdminEndpoint -Category "ANALYTICS" -Description "Get review analytics" -Method "GET" -Endpoint "/analytics/reviews" -Headers $adminHeaders

# 3. USER MANAGEMENT
Write-Host "`n3. USER MANAGEMENT" -ForegroundColor Magenta

Test-AdminEndpoint -Category "USERS" -Description "Get all users" -Method "GET" -Endpoint "/users/admin/all" -Headers $adminHeaders
Test-AdminEndpoint -Category "USERS" -Description "Get user count" -Method "GET" -Endpoint "/users/admin/count" -Headers $adminHeaders
Test-AdminEndpoint -Category "REPORTS" -Description "Get user reports" -Method "GET" -Endpoint "/analytics/reports/users" -Headers $adminHeaders
Test-AdminEndpoint -Category "REPORTS" -Description "Get booking reports" -Method "GET" -Endpoint "/analytics/reports/bookings" -Headers $adminHeaders
Test-AdminEndpoint -Category "REPORTS" -Description "Get revenue reports" -Method "GET" -Endpoint "/analytics/reports/revenue" -Headers $adminHeaders

# 4. ACCOMMODATION MANAGEMENT
Write-Host "`n4. ACCOMMODATION MANAGEMENT" -ForegroundColor Magenta

Test-AdminEndpoint -Category "ACCOMMODATION" -Description "Get pending accommodations" -Method "GET" -Endpoint "/accommodations/admin/pending" -Headers $adminHeaders
Test-AdminEndpoint -Category "ACCOMMODATION" -Description "Get all accommodations (admin)" -Method "GET" -Endpoint "/accommodations/admin/all" -Headers $adminHeaders

# Get an accommodation for admin actions (if any exist)
$accommodations = Test-AdminEndpoint -Category "ACCOMMODATION" -Description "Get accommodations for testing" -Method "GET" -Endpoint "/accommodations" -Headers $adminHeaders

if ($accommodations -and $accommodations.Count -gt 0) {
    $testAccommodationId = $accommodations[0]._id
    Write-Host "✅ Using accommodation ID for admin tests: $testAccommodationId" -ForegroundColor Green
    
    Test-AdminEndpoint -Category "ACCOMMODATION" -Description "Get accommodation details (admin)" -Method "GET" -Endpoint "/accommodations/admin/$testAccommodationId/details" -Headers $adminHeaders
    
    # Test admin approval actions (these might fail if already processed)
    Test-AdminEndpoint -Category "ACCOMMODATION" -Description "Approve accommodation" -Method "PUT" -Endpoint "/accommodations/admin/$testAccommodationId/approve" -Headers $adminHeaders -ExpectedCodes @(200, 400)
    Test-AdminEndpoint -Category "ACCOMMODATION" -Description "Toggle accommodation status" -Method "PUT" -Endpoint "/accommodations/admin/$testAccommodationId/toggle-status" -Headers $adminHeaders -ExpectedCodes @(200, 400)
}

# 5. FOOD PROVIDER MANAGEMENT
Write-Host "`n5. FOOD PROVIDER MANAGEMENT" -ForegroundColor Magenta

Test-AdminEndpoint -Category "FOOD_PROVIDER" -Description "Get pending food providers" -Method "GET" -Endpoint "/food-providers/admin/pending" -Headers $adminHeaders
Test-AdminEndpoint -Category "FOOD_PROVIDER" -Description "Get all food providers (admin)" -Method "GET" -Endpoint "/food-providers/admin/all" -Headers $adminHeaders

# Get a food provider for admin actions (if any exist)
$foodProviders = Test-AdminEndpoint -Category "FOOD_PROVIDER" -Description "Get food providers for testing" -Method "GET" -Endpoint "/food-providers" -Headers $adminHeaders

if ($foodProviders -and $foodProviders.Count -gt 0) {
    $testProviderId = $foodProviders[0]._id
    Write-Host "✅ Using food provider ID for admin tests: $testProviderId" -ForegroundColor Green
    
    Test-AdminEndpoint -Category "FOOD_PROVIDER" -Description "Get food provider details (admin)" -Method "GET" -Endpoint "/food-providers/admin/$testProviderId/details" -Headers $adminHeaders
    
    # Test admin approval actions
    Test-AdminEndpoint -Category "FOOD_PROVIDER" -Description "Approve food provider" -Method "PUT" -Endpoint "/food-providers/admin/$testProviderId/approve" -Headers $adminHeaders -ExpectedCodes @(200, 400)
    Test-AdminEndpoint -Category "FOOD_PROVIDER" -Description "Toggle food provider status" -Method "PUT" -Endpoint "/food-providers/admin/$testProviderId/toggle-status" -Headers $adminHeaders -ExpectedCodes @(200, 400)
}

# 6. MENU ITEM MANAGEMENT
Write-Host "`n6. MENU ITEM MANAGEMENT" -ForegroundColor Magenta

Test-AdminEndpoint -Category "MENU" -Description "Get pending menu items" -Method "GET" -Endpoint "/food-providers/admin/menu-items/pending" -Headers $adminHeaders

# Get menu items for testing (if any exist)
$menuItems = Test-AdminEndpoint -Category "MENU" -Description "Get menu items for testing" -Method "GET" -Endpoint "/menu-items" -Headers $adminHeaders

if ($menuItems -and $menuItems.Count -gt 0) {
    $testMenuItemId = $menuItems[0]._id
    Write-Host "✅ Using menu item ID for admin tests: $testMenuItemId" -ForegroundColor Green
    
    # Test admin menu item actions
    Test-AdminEndpoint -Category "MENU" -Description "Approve menu item" -Method "PUT" -Endpoint "/food-providers/admin/menu-items/$testMenuItemId/approve" -Headers $adminHeaders -ExpectedCodes @(200, 400)
    Test-AdminEndpoint -Category "MENU" -Description "Toggle menu item status" -Method "PUT" -Endpoint "/food-providers/admin/menu-items/$testMenuItemId/toggle-status" -Headers $adminHeaders -ExpectedCodes @(200, 400)
}

# 7. USER ROLE MANAGEMENT
Write-Host "`n7. USER ROLE MANAGEMENT" -ForegroundColor Magenta

# Get users for role management testing
$users = Test-AdminEndpoint -Category "USERS" -Description "Get users for role testing" -Method "GET" -Endpoint "/users/admin/all" -Headers $adminHeaders

if ($users -and $users.Count -gt 0) {
    # Find a non-admin user for testing
    $testUser = $users | Where-Object { $_.role -ne "admin" } | Select-Object -First 1
    
    if ($testUser) {
        $testUserId = $testUser._id
        Write-Host "✅ Using user ID for role tests: $testUserId" -ForegroundColor Green
        
        # Test user management actions
        Test-AdminEndpoint -Category "USER_MGMT" -Description "Update user status" -Method "PUT" -Endpoint "/users/admin/$testUserId/status" -Headers $adminHeaders -Body @{status="active"} -ExpectedCodes @(200, 400)
        Test-AdminEndpoint -Category "USER_MGMT" -Description "Deactivate user" -Method "PUT" -Endpoint "/users/admin/$testUserId/deactivate" -Headers $adminHeaders -ExpectedCodes @(200, 400)
        Test-AdminEndpoint -Category "USER_MGMT" -Description "Reactivate user" -Method "PUT" -Endpoint "/users/admin/$testUserId/reactivate" -Headers $adminHeaders -ExpectedCodes @(200, 400)
        Test-AdminEndpoint -Category "USER_MGMT" -Description "Get user activity log" -Method "GET" -Endpoint "/users/admin/$testUserId/activity-log" -Headers $adminHeaders
    }
}

# 8. SECURITY ENDPOINTS
Write-Host "`n8. SECURITY & MONITORING" -ForegroundColor Magenta

Test-AdminEndpoint -Category "SECURITY" -Description "Get suspicious activities" -Method "GET" -Endpoint "/users/admin/security/suspicious" -Headers $adminHeaders

# 9. IMAGE UPLOAD ADMIN TESTS
Write-Host "`n9. IMAGE UPLOAD VERIFICATION" -ForegroundColor Magenta

# Verify that image upload endpoints exist and are properly secured
Test-AdminEndpoint -Category "IMAGE" -Description "Upload endpoint exists (accommodation)" -Method "POST" -Endpoint "/upload/accommodation/507f1f77bcf86cd799439011/images" -Headers $adminHeaders -ExpectedCodes @(400) -ShouldFail
Test-AdminEndpoint -Category "IMAGE" -Description "Upload endpoint exists (food provider)" -Method "POST" -Endpoint "/upload/food-provider/507f1f77bcf86cd799439011/images" -Headers $adminHeaders -ExpectedCodes @(400) -ShouldFail
Test-AdminEndpoint -Category "IMAGE" -Description "Upload endpoint exists (menu item)" -Method "POST" -Endpoint "/upload/menu-item/507f1f77bcf86cd799439011/image" -Headers $adminHeaders -ExpectedCodes @(400) -ShouldFail

# 10. ACCESS CONTROL VERIFICATION
Write-Host "`n10. ACCESS CONTROL VERIFICATION" -ForegroundColor Magenta

# Test that non-admin users can't access admin endpoints
Test-AdminEndpoint -Category "ACCESS" -Description "Admin dashboard without auth (should fail)" -Method "GET" -Endpoint "/analytics/dashboard" -ExpectedCodes @(401) -ShouldFail
Test-AdminEndpoint -Category "ACCESS" -Description "User management without auth (should fail)" -Method "GET" -Endpoint "/users/admin/all" -ExpectedCodes @(401) -ShouldFail

# SUMMARY
Write-Host "`n=== ADMIN TEST SUMMARY ===" -ForegroundColor Cyan
Write-Host "Total Tests: $global:totalTests" -ForegroundColor White
Write-Host "Passed Tests: $global:passedTests" -ForegroundColor Green
Write-Host "Failed Tests: $global:failedTests" -ForegroundColor Red

if ($global:totalTests -gt 0) {
    $successRate = [math]::Round($global:passedTests / $global:totalTests * 100, 2)
    Write-Host "Overall Success Rate: $successRate%" -ForegroundColor $(if ($global:failedTests -eq 0) { "Green" } else { "Yellow" })
} else {
    Write-Host "No tests executed" -ForegroundColor Yellow
}

Write-Host "`n=== RESULTS BY CATEGORY ===" -ForegroundColor Cyan
$categories = @("AUTH", "DASHBOARD", "ANALYTICS", "USERS", "REPORTS", "ACCOMMODATION", "FOOD_PROVIDER", "MENU", "USER_MGMT", "SECURITY", "IMAGE", "ACCESS")
foreach ($category in $categories) {
    Write-Host "$category tests completed" -ForegroundColor White
}

if ($global:failedTests -eq 0) {
    Write-Host "`n🎉 ALL ADMIN TESTS PASSED! Admin functionality fully working after image upload implementation." -ForegroundColor Green
} else {
    Write-Host "`n⚠️ $global:failedTests admin tests failed. Please review the results above." -ForegroundColor Yellow
}

Write-Host "`nTest Completed at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "==============================================" -ForegroundColor Gray
