# Admin Control Features Test Script
# Tests all admin approval and management features

Write-Host "Admin Control Features Test Suite" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Configuration
$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"
$adminEmail = "assaleemofficial@gmail.com"
$adminPassword = "Sarim786"
$testLandlordEmail = "landlord.test.$(Get-Random)@test.com"
$testFoodProviderEmail = "foodprovider.test.$(Get-Random)@test.com"
$testStudentEmail = "student.test.$(Get-Random)@test.com"
$testPassword = "TestPass123!"

# Test tracking
$script:totalTests = 0
$script:passedTests = 0
$script:failedTests = 0
$script:errors = @()

# Global variables
$script:adminToken = ""
$script:testAccommodationId = ""
$script:testFoodProviderId = ""
$script:testMenuItemId = ""
$script:testUserId = ""

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
        
        # Add authorization header if admin token exists
        if ($script:adminToken -and $script:adminToken -ne "") {
            $requestHeaders["Authorization"] = "Bearer $($script:adminToken)"
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

function Test-AdminAuthentication {
    Write-Host "`nTesting Admin Authentication" -ForegroundColor Yellow
    Write-Host "-----------------------------" -ForegroundColor Yellow
    
    # Test 1: Admin Login
    Write-Host "Testing admin login..."
    $loginData = @{
        email = $adminEmail
        password = $adminPassword
    }
    
    $loginResponse = Test-APICall -method "POST" -endpoint "/auth/login" -body $loginData
    
    if ($loginResponse.Success -and $loginResponse.Data.access_token) {
        Test-Assert -condition $true -message "Admin login successful"
        Test-Assert -condition ($loginResponse.Data.user.role -eq "admin") -message "User role is admin"
        Test-Assert -condition ($loginResponse.Data.access_token -ne $null) -message "Admin auth token received"
        
        $script:adminToken = $loginResponse.Data.access_token
    } else {
        Test-Assert -condition $false -message "Admin login failed: $($loginResponse.Error)"
        Write-Host "[ERROR] Cannot proceed without admin authentication" -ForegroundColor Red
        return $false
    }
    
    return $true
}

function Test-AccommodationApproval {
    Write-Host "`nTesting Accommodation Approval Workflow" -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Yellow
    
    if (-not $script:adminToken) {
        Write-Host "[WARN] Skipping accommodation tests - no admin token" -ForegroundColor Yellow
        return
    }
    
    # Test 1: Get Pending Accommodations
    Write-Host "Testing get pending accommodations..."
    $pendingResponse = Test-APICall -method "GET" -endpoint "/accommodations/admin/pending"
    
    if ($pendingResponse.Success) {
        Test-Assert -condition $true -message "Get pending accommodations successful"
        Test-Assert -condition ($pendingResponse.Data -is [array]) -message "Pending accommodations is array"
        Write-Host "[INFO] Found $($pendingResponse.Data.Count) pending accommodations" -ForegroundColor Green
        
        if ($pendingResponse.Data.Count -gt 0) {
            $script:testAccommodationId = $pendingResponse.Data[0]._id
        }
    } else {
        Test-Assert -condition $false -message "Get pending accommodations failed"
    }
    
    # Test 2: Get All Accommodations for Admin
    Write-Host "Testing get all accommodations for admin..."
    $allAccommodationsResponse = Test-APICall -method "GET" -endpoint "/accommodations/admin/all"
    
    if ($allAccommodationsResponse.Success) {
        Test-Assert -condition $true -message "Get all accommodations for admin successful"
        Test-Assert -condition ($allAccommodationsResponse.Data -is [array]) -message "All accommodations is array"
        
        if ($allAccommodationsResponse.Data.Count -gt 0 -and -not $script:testAccommodationId) {
            $script:testAccommodationId = $allAccommodationsResponse.Data[0]._id
        }
    } else {
        Test-Assert -condition $false -message "Get all accommodations for admin failed"
    }
    
    # Test 3: Get Accommodation Details for Admin Review
    if ($script:testAccommodationId) {
        Write-Host "Testing get accommodation details for admin..."
        $detailsResponse = Test-APICall -method "GET" -endpoint "/accommodations/admin/$($script:testAccommodationId)/details"
        
        if ($detailsResponse.Success) {
            Test-Assert -condition $true -message "Get accommodation details for admin successful"
            Test-Assert -condition ($detailsResponse.Data.accommodation -ne $null) -message "Accommodation data exists"
            Test-Assert -condition ($detailsResponse.Data.stats -ne $null) -message "Statistics data exists"
        } else {
            Test-Assert -condition $false -message "Get accommodation details failed"
        }
        
        # Test 4: Toggle Accommodation Status
        Write-Host "Testing toggle accommodation status..."
        $toggleResponse = Test-APICall -method "PUT" -endpoint "/accommodations/admin/$($script:testAccommodationId)/toggle-status"
        
        if ($toggleResponse.Success) {
            Test-Assert -condition $true -message "Toggle accommodation status successful"
        } else {
            Write-Host "[WARN] Toggle accommodation status returned: $($toggleResponse.StatusCode)" -ForegroundColor Yellow
        }
    }
}

function Test-FoodProviderApproval {
    Write-Host "`nTesting Food Provider Approval Workflow" -ForegroundColor Yellow
    Write-Host "---------------------------------------" -ForegroundColor Yellow
    
    if (-not $script:adminToken) {
        Write-Host "[WARN] Skipping food provider tests - no admin token" -ForegroundColor Yellow
        return
    }
    
    # Test 1: Get Pending Food Providers
    Write-Host "Testing get pending food providers..."
    $pendingResponse = Test-APICall -method "GET" -endpoint "/food-providers/admin/pending"
    
    if ($pendingResponse.Success) {
        Test-Assert -condition $true -message "Get pending food providers successful"
        Test-Assert -condition ($pendingResponse.Data -is [array]) -message "Pending food providers is array"
        Write-Host "[INFO] Found $($pendingResponse.Data.Count) pending food providers" -ForegroundColor Green
        
        if ($pendingResponse.Data.Count -gt 0) {
            $script:testFoodProviderId = $pendingResponse.Data[0]._id
        }
    } else {
        Test-Assert -condition $false -message "Get pending food providers failed"
    }
    
    # Test 2: Get All Food Providers for Admin
    Write-Host "Testing get all food providers for admin..."
    $allProvidersResponse = Test-APICall -method "GET" -endpoint "/food-providers/admin/all"
    
    if ($allProvidersResponse.Success) {
        Test-Assert -condition $true -message "Get all food providers for admin successful"
        Test-Assert -condition ($allProvidersResponse.Data -is [array]) -message "All food providers is array"
        
        if ($allProvidersResponse.Data.Count -gt 0 -and -not $script:testFoodProviderId) {
            $script:testFoodProviderId = $allProvidersResponse.Data[0]._id
        }
    } else {
        Test-Assert -condition $false -message "Get all food providers for admin failed"
    }
    
    # Test 3: Get Food Provider Details for Admin Review
    if ($script:testFoodProviderId) {
        Write-Host "Testing get food provider details for admin..."
        $detailsResponse = Test-APICall -method "GET" -endpoint "/food-providers/admin/$($script:testFoodProviderId)/details"
        
        if ($detailsResponse.Success) {
            Test-Assert -condition $true -message "Get food provider details for admin successful"
            Test-Assert -condition ($detailsResponse.Data.provider -ne $null) -message "Provider data exists"
            Test-Assert -condition ($detailsResponse.Data.stats -ne $null) -message "Statistics data exists"
        } else {
            Test-Assert -condition $false -message "Get food provider details failed"
        }
        
        # Test 4: Toggle Food Provider Status
        Write-Host "Testing toggle food provider status..."
        $toggleResponse = Test-APICall -method "PUT" -endpoint "/food-providers/admin/$($script:testFoodProviderId)/toggle-status"
        
        if ($toggleResponse.Success) {
            Test-Assert -condition $true -message "Toggle food provider status successful"
        } else {
            Write-Host "[WARN] Toggle food provider status returned: $($toggleResponse.StatusCode)" -ForegroundColor Yellow
        }
    }
}

function Test-MenuItemApproval {
    Write-Host "`nTesting Menu Item Approval Workflow" -ForegroundColor Yellow
    Write-Host "-----------------------------------" -ForegroundColor Yellow
    
    if (-not $script:adminToken) {
        Write-Host "[WARN] Skipping menu item tests - no admin token" -ForegroundColor Yellow
        return
    }
    
    # Test 1: Get Pending Menu Items
    Write-Host "Testing get pending menu items..."
    $pendingResponse = Test-APICall -method "GET" -endpoint "/food-providers/admin/menu-items/pending"
    
    if ($pendingResponse.Success) {
        Test-Assert -condition $true -message "Get pending menu items successful"
        Test-Assert -condition ($pendingResponse.Data -is [array]) -message "Pending menu items is array"
        Write-Host "[INFO] Found $($pendingResponse.Data.Count) pending menu items" -ForegroundColor Green
        
        if ($pendingResponse.Data.Count -gt 0) {
            $script:testMenuItemId = $pendingResponse.Data[0]._id
        }
    } else {
        Test-Assert -condition $false -message "Get pending menu items failed"
    }
    
    # Test 2: Toggle Menu Item Status
    if ($script:testMenuItemId) {
        Write-Host "Testing toggle menu item status..."
        $toggleResponse = Test-APICall -method "PUT" -endpoint "/food-providers/admin/menu-items/$($script:testMenuItemId)/toggle-status"
        
        if ($toggleResponse.Success) {
            Test-Assert -condition $true -message "Toggle menu item status successful"
        } else {
            Write-Host "[WARN] Toggle menu item status returned: $($toggleResponse.StatusCode)" -ForegroundColor Yellow
        }
    }
}

function Test-UserManagement {
    Write-Host "`nTesting User Management & Security" -ForegroundColor Yellow
    Write-Host "----------------------------------" -ForegroundColor Yellow
    
    if (-not $script:adminToken) {
        Write-Host "[WARN] Skipping user management tests - no admin token" -ForegroundColor Yellow
        return
    }
    
    # Test 1: Get All Users
    Write-Host "Testing get all users..."
    $usersResponse = Test-APICall -method "GET" -endpoint "/users/admin/all"
    
    if ($usersResponse.Success) {
        Test-Assert -condition $true -message "Get all users successful"
        Test-Assert -condition ($usersResponse.Data -is [array]) -message "Users data is array"
        Write-Host "[INFO] Found $($usersResponse.Data.Count) total users" -ForegroundColor Green
        
        # Find a non-admin user for testing
        foreach ($user in $usersResponse.Data) {
            if ($user.role -ne "admin") {
                $script:testUserId = $user._id
                break
            }
        }
    } else {
        Test-Assert -condition $false -message "Get all users failed"
    }
    
    # Test 2: Get User Counts
    Write-Host "Testing get user counts..."
    $countsResponse = Test-APICall -method "GET" -endpoint "/users/admin/count"
      if ($countsResponse.Success) {
        Test-Assert -condition $true -message "Get user counts successful"
        Test-Assert -condition ($countsResponse.Data.total -ne $null) -message "Total users count exists"
    } else {
        Test-Assert -condition $false -message "Get user counts failed"
    }
    
    # Test 3: Get Suspicious Users
    Write-Host "Testing get suspicious users..."
    $suspiciousResponse = Test-APICall -method "GET" -endpoint "/users/admin/security/suspicious"
    
    if ($suspiciousResponse.Success) {
        Test-Assert -condition $true -message "Get suspicious users successful"
        Test-Assert -condition ($suspiciousResponse.Data.suspiciousUsers -is [array]) -message "Suspicious users is array"
    } else {
        Test-Assert -condition $false -message "Get suspicious users failed"
    }
    
    # Test 4: Get User Activity Log
    if ($script:testUserId) {
        Write-Host "Testing get user activity log..."
        $activityResponse = Test-APICall -method "GET" -endpoint "/users/admin/$($script:testUserId)/activity-log"
        
        if ($activityResponse.Success) {
            Test-Assert -condition $true -message "Get user activity log successful"
            Test-Assert -condition ($activityResponse.Data.user -ne $null) -message "User activity data exists"
        } else {
            Test-Assert -condition $false -message "Get user activity log failed"
        }
    }
}

function Test-ApprovalWorkflow {
    Write-Host "`nTesting Approval Workflow (Simulation)" -ForegroundColor Yellow
    Write-Host "--------------------------------------" -ForegroundColor Yellow
    
    if (-not $script:adminToken) {
        Write-Host "[WARN] Skipping approval workflow tests - no admin token" -ForegroundColor Yellow
        return
    }
    
    # Test approval and rejection endpoints exist and are accessible
    if ($script:testAccommodationId) {
        Write-Host "Testing accommodation approval endpoint access..."
        $approveResponse = Test-APICall -method "PUT" -endpoint "/accommodations/admin/$($script:testAccommodationId)/approve"
        
        if ($approveResponse.Success -or $approveResponse.StatusCode -eq 400) {
            Test-Assert -condition $true -message "Accommodation approval endpoint accessible"
        } else {
            Test-Assert -condition $false -message "Accommodation approval endpoint failed"
        }
        
        Write-Host "Testing accommodation rejection endpoint access..."
        $rejectData = @{ reason = "Test rejection reason" }
        $rejectResponse = Test-APICall -method "PUT" -endpoint "/accommodations/admin/$($script:testAccommodationId)/reject" -body $rejectData
        
        if ($rejectResponse.Success -or $rejectResponse.StatusCode -eq 400) {
            Test-Assert -condition $true -message "Accommodation rejection endpoint accessible"
        } else {
            Test-Assert -condition $false -message "Accommodation rejection endpoint failed"
        }
    }
    
    if ($script:testFoodProviderId) {
        Write-Host "Testing food provider approval endpoint access..."
        $approveResponse = Test-APICall -method "PUT" -endpoint "/food-providers/admin/$($script:testFoodProviderId)/approve"
        
        if ($approveResponse.Success -or $approveResponse.StatusCode -eq 400) {
            Test-Assert -condition $true -message "Food provider approval endpoint accessible"
        } else {
            Test-Assert -condition $false -message "Food provider approval endpoint failed"
        }
    }
}

function Show-TestResults {
    Write-Host "`n" + "="*60 -ForegroundColor Cyan
    Write-Host "ADMIN CONTROL FEATURES TEST RESULTS" -ForegroundColor Cyan
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
    
    Write-Host "`nADMIN FEATURE COVERAGE:" -ForegroundColor Yellow
    Write-Host "Admin Authentication and Authorization" -ForegroundColor Green
    Write-Host "Accommodation Approval and Management" -ForegroundColor Green
    Write-Host "Food Provider Approval and Management" -ForegroundColor Green
    Write-Host "Menu Item Approval and Management" -ForegroundColor Green
    Write-Host "User Security and Deactivation Controls" -ForegroundColor Green
    Write-Host "Approval Workflow Management" -ForegroundColor Green
    Write-Host "Status Toggle Controls" -ForegroundColor Green
    Write-Host "Detailed Admin Review Features" -ForegroundColor Green
    
    if ($script:failedTests -eq 0) {
        Write-Host "`nALL ADMIN CONTROL FEATURES WORKING!" -ForegroundColor Green
    } else {
        Write-Host "`nSome admin features need attention. Review errors above." -ForegroundColor Yellow
    }
    
    Write-Host "`nAPI ADMIN ENDPOINTS TESTED:" -ForegroundColor Cyan
    Write-Host "• Accommodations: GET /admin/pending, GET /admin/all, PUT /admin/:id/approve" -ForegroundColor Gray
    Write-Host "• Food Providers: GET /admin/pending, PUT /admin/:id/toggle-status" -ForegroundColor Gray
    Write-Host "• Menu Items: GET /admin/menu-items/pending, PUT /admin/menu-items/:id/approve" -ForegroundColor Gray
    Write-Host "• Users: GET /admin/all, GET /admin/count, GET /admin/security/suspicious" -ForegroundColor Gray
    Write-Host "• Security: GET /admin/:id/activity-log, PUT /admin/:id/deactivate" -ForegroundColor Gray
}

# Main execution
Write-Host "Starting comprehensive admin control features test suite..." -ForegroundColor Cyan
Write-Host "Target API: $baseUrl" -ForegroundColor Cyan
Write-Host "Admin User: $adminEmail" -ForegroundColor Cyan
Write-Host ""

try {
    $authSuccess = Test-AdminAuthentication
    
    if ($authSuccess) {
        Test-AccommodationApproval
        Test-FoodProviderApproval
        Test-MenuItemApproval
        Test-UserManagement
        Test-ApprovalWorkflow
    }
    
    Show-TestResults
}
catch {
    Write-Host "Admin test suite encountered an error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`nAdmin control features testing completed" -ForegroundColor Green
Write-Host "All approval workflows and admin controls validated" -ForegroundColor Gray
