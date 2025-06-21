# StayKaru Food Provider Extensive Test Suite
# This script performs an extensive test of all food provider functionality
# Date: June 21, 2025

$baseUrl = "http://localhost:3000"

Write-Host "=== STAYKARU FOOD PROVIDER EXTENSIVE TEST SUITE ===" -ForegroundColor Cyan
Write-Host "Running comprehensive test of all food provider functionality with edge cases" -ForegroundColor Cyan
Write-Host "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "---------------------------------------------" -ForegroundColor Cyan

$global:totalTests = 0
$global:passedTests = 0
$global:testResults = @()

function Write-TestResult {
    param (
        [string]$testName,
        [bool]$passed,
        [string]$message = "",
        [string]$category = "GENERAL"
    )
    
    $global:totalTests++
    if ($passed) {
        $global:passedTests++
        Write-Host "✅ [$category] $testName" -ForegroundColor Green
    } else {
        Write-Host "❌ [$category] $testName - $message" -ForegroundColor Red
    }
    
    $global:testResults += [PSCustomObject]@{
        TestName = $testName
        Category = $category
        Passed = $passed
        Message = $message
    }
}

# Generate random data for testing
$randomSuffix = Get-Random
$testEmail = "foodprovider.extensive.$randomSuffix@test.com"
$testPassword = "StrongP@ss123"
$invalidPassword = "weak"

# ============ 1. AUTHENTICATION TESTS ============
Write-Host "`n1. AUTHENTICATION TESTS" -ForegroundColor Yellow

# 1.1 Register with valid data
$script:registerData = @{
    name = "Test Food Provider $randomSuffix"
    email = $testEmail
    password = $testPassword
    phone = "+1234567890"
    role = "food_provider"
    gender = "male"
}

try {
    Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body ($script:registerData | ConvertTo-Json) -ContentType "application/json" | Out-Null
    Write-TestResult -testName "Register with valid data" -passed $true -category "AUTH"
} catch {
    Write-TestResult -testName "Register with valid data" -passed $false -message $_.Exception.Message -category "AUTH"
}

# 1.2 Try to register with same email (should fail)
try {
    $duplicateResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body ($script:registerData | ConvertTo-Json) -ContentType "application/json" -ErrorAction SilentlyContinue
    Write-TestResult -testName "Register with duplicate email (should fail)" -passed $false -message "Expected failure but registration succeeded" -category "AUTH"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-TestResult -testName "Register with duplicate email (should fail)" -passed $true -category "AUTH"
    } else {
        Write-TestResult -testName "Register with duplicate email (should fail)" -passed $false -message "Unexpected error: $($_.Exception.Message)" -category "AUTH"
    }
}

# 1.3 Try to register with invalid password (should fail)
$invalidPasswordData = @{
    name = "Test Food Provider Invalid $randomSuffix"
    email = "invalid.$randomSuffix@test.com"
    password = $invalidPassword
    phone = "+1234567890"
    role = "food_provider"
    gender = "male"
}

try {
    Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body ($invalidPasswordData | ConvertTo-Json) -ContentType "application/json" -ErrorAction SilentlyContinue
    Write-TestResult -testName "Register with invalid password (should fail)" -passed $false -message "Expected failure but registration succeeded" -category "AUTH"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-TestResult -testName "Register with invalid password (should fail)" -passed $true -category "AUTH"
    } else {
        Write-TestResult -testName "Register with invalid password (should fail)" -passed $false -message "Unexpected error: $($_.Exception.Message)" -category "AUTH"
    }
}

# 1.4 Login with valid credentials
$script:loginData = @{
    email = $testEmail
    password = $testPassword
}

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body ($script:loginData | ConvertTo-Json) -ContentType "application/json"
    $script:token = $loginResponse.access_token
    Write-TestResult -testName "Login with valid credentials" -passed $true -category "AUTH"
} catch {
    Write-TestResult -testName "Login with valid credentials" -passed $false -message $_.Exception.Message -category "AUTH"
}

# 1.5 Login with invalid credentials (should fail)
$invalidLoginData = @{
    email = $testEmail
    password = "WrongPassword123"
}

try {
    Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body ($invalidLoginData | ConvertTo-Json) -ContentType "application/json" -ErrorAction SilentlyContinue
    Write-TestResult -testName "Login with invalid credentials (should fail)" -passed $false -message "Expected failure but login succeeded" -category "AUTH"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-TestResult -testName "Login with invalid credentials (should fail)" -passed $true -category "AUTH"
    } else {
        Write-TestResult -testName "Login with invalid credentials (should fail)" -passed $false -message "Unexpected error: $($_.Exception.Message)" -category "AUTH"
    }
}

$script:headers = @{
    "Authorization" = "Bearer $script:token"
    "Content-Type" = "application/json"
}

# ============ 2. LOCATION AND CITY TESTS ============
Write-Host "`n2. LOCATION AND CITY TESTS" -ForegroundColor Yellow

# 2.1 Get all cities
try {
    $citiesResponse = Invoke-RestMethod -Uri "$baseUrl/location/cities" -Method GET
    $script:existingCityId = $citiesResponse[0]._id
    Write-TestResult -testName "Get all cities" -passed ($citiesResponse.Count -gt 0) -category "LOCATION"
} catch {
    Write-TestResult -testName "Get all cities" -passed $false -message $_.Exception.Message -category "LOCATION"
    $script:existingCityId = "683700350f8a15197d2abf4f"  # Fallback ID
}

# 2.2 Get city by ID
try {
    $cityResponse = Invoke-RestMethod -Uri "$baseUrl/location/cities/$script:existingCityId" -Method GET
    Write-TestResult -testName "Get city by ID" -passed $true -category "LOCATION"
} catch {
    Write-TestResult -testName "Get city by ID" -passed $false -message $_.Exception.Message -category "LOCATION"
}

# 2.3 Get city with invalid ID (should fail)
try {
    Invoke-RestMethod -Uri "$baseUrl/location/cities/123456789012345678901234" -Method GET -ErrorAction SilentlyContinue
    Write-TestResult -testName "Get city with invalid ID (should fail)" -passed $false -message "Expected failure but request succeeded" -category "LOCATION"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-TestResult -testName "Get city with invalid ID (should fail)" -passed $true -category "LOCATION"
    } else {
        Write-TestResult -testName "Get city with invalid ID (should fail)" -passed $false -message "Unexpected error: $($_.Exception.Message)" -category "LOCATION"
    }
}

# ============ 3. FOOD PROVIDER MANAGEMENT TESTS ============
Write-Host "`n3. FOOD PROVIDER MANAGEMENT TESTS" -ForegroundColor Yellow

# 3.1 Create food provider with valid data
$script:foodProviderData = @{
    name = "Test Restaurant $randomSuffix"
    description = "A great test restaurant with amazing food for extensive testing"
    location = $script:existingCityId
    cuisine_type = "International"
    operating_hours = @{
        open = "09:00"
        close = "22:00"
    }
    contact_info = @{
        phone = "+1234567890"
        email = "test.restaurant.$randomSuffix@test.com"
    }
}

try {
    $foodProviderResponse = Invoke-RestMethod -Uri "$baseUrl/food-providers" -Method POST -Body ($script:foodProviderData | ConvertTo-Json -Depth 5) -Headers $script:headers
    $script:foodProviderId = $foodProviderResponse._id
    Write-TestResult -testName "Create food provider with valid data" -passed $true -category "PROVIDER"
} catch {
    Write-TestResult -testName "Create food provider with valid data" -passed $false -message $_.Exception.Message -category "PROVIDER"
}

# 3.2 Create food provider with missing required fields (should fail)
$invalidProviderData = @{
    name = "Test Restaurant Invalid $randomSuffix"
    # Missing required description
    # Missing required location
}

try {
    Invoke-RestMethod -Uri "$baseUrl/food-providers" -Method POST -Body ($invalidProviderData | ConvertTo-Json -Depth 5) -Headers $script:headers -ErrorAction SilentlyContinue
    Write-TestResult -testName "Create food provider with missing fields (should fail)" -passed $false -message "Expected failure but creation succeeded" -category "PROVIDER"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-TestResult -testName "Create food provider with missing fields (should fail)" -passed $true -category "PROVIDER"
    } else {
        Write-TestResult -testName "Create food provider with missing fields (should fail)" -passed $false -message "Unexpected error: $($_.Exception.Message)" -category "PROVIDER"
    }
}

# 3.3 Create food provider with invalid location ID (should fail)
$invalidLocationData = @{
    name = "Test Restaurant Invalid Location $randomSuffix"
    description = "A restaurant with invalid location ID"
    location = "123456789012345678901234"  # Invalid MongoDB ID
    cuisine_type = "International"
}

try {
    Invoke-RestMethod -Uri "$baseUrl/food-providers" -Method POST -Body ($invalidLocationData | ConvertTo-Json -Depth 5) -Headers $script:headers -ErrorAction SilentlyContinue
    Write-TestResult -testName "Create food provider with invalid location (should fail)" -passed $false -message "Expected failure but creation succeeded" -category "PROVIDER"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-TestResult -testName "Create food provider with invalid location (should fail)" -passed $true -category "PROVIDER"
    } else {
        Write-TestResult -testName "Create food provider with invalid location (should fail)" -passed $false -message "Unexpected error: $($_.Exception.Message)" -category "PROVIDER"
    }
}

# 3.4 Try to create food provider without auth (should fail)
try {
    Invoke-RestMethod -Uri "$baseUrl/food-providers" -Method POST -Body ($script:foodProviderData | ConvertTo-Json -Depth 5) -ContentType "application/json" -ErrorAction SilentlyContinue
    Write-TestResult -testName "Create food provider without auth (should fail)" -passed $false -message "Expected failure but creation succeeded" -category "PROVIDER"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-TestResult -testName "Create food provider without auth (should fail)" -passed $true -category "PROVIDER"
    } else {
        Write-TestResult -testName "Create food provider without auth (should fail)" -passed $false -message "Unexpected error: $($_.Exception.Message)" -category "PROVIDER"
    }
}

# 3.5 Get all food providers
try {
    $allProviders = Invoke-RestMethod -Uri "$baseUrl/food-providers" -Method GET
    Write-TestResult -testName "Get all food providers" -passed ($allProviders.Count -gt 0) -category "PROVIDER"
} catch {
    Write-TestResult -testName "Get all food providers" -passed $false -message $_.Exception.Message -category "PROVIDER"
}

# 3.6 Get food provider by ID
try {
    $providerDetails = Invoke-RestMethod -Uri "$baseUrl/food-providers/$script:foodProviderId" -Method GET
    Write-TestResult -testName "Get food provider by ID" -passed ($providerDetails._id -eq $script:foodProviderId) -category "PROVIDER"
} catch {
    Write-TestResult -testName "Get food provider by ID" -passed $false -message $_.Exception.Message -category "PROVIDER"
}

# 3.7 Get food provider with invalid ID (should return 404)
try {
    Invoke-RestMethod -Uri "$baseUrl/food-providers/123456789012345678901234" -Method GET -ErrorAction SilentlyContinue
    Write-TestResult -testName "Get food provider with invalid ID (should fail)" -passed $false -message "Expected failure but request succeeded" -category "PROVIDER"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-TestResult -testName "Get food provider with invalid ID (should fail)" -passed $true -category "PROVIDER"
    } else {
        Write-TestResult -testName "Get food provider with invalid ID (should fail)" -passed $false -message "Unexpected error: $($_.Exception.Message)" -category "PROVIDER"
    }
}

# 3.8 Update food provider
$updateData = @{
    name = "Updated Restaurant Name $randomSuffix"
    description = "Updated description for testing"
    cuisine_type = "Updated Cuisine"
}

try {
    $updateResponse = Invoke-RestMethod -Uri "$baseUrl/food-providers/$script:foodProviderId" -Method PUT -Body ($updateData | ConvertTo-Json) -Headers $script:headers
    Write-TestResult -testName "Update food provider" -passed $true -category "PROVIDER"
} catch {
    Write-TestResult -testName "Update food provider" -passed $false -message $_.Exception.Message -category "PROVIDER"
}

# 3.9 Verify update worked
try {
    $updatedProvider = Invoke-RestMethod -Uri "$baseUrl/food-providers/$script:foodProviderId" -Method GET
    $updateSuccessful = ($updatedProvider.name -eq $updateData.name -and $updatedProvider.description -eq $updateData.description)
    Write-TestResult -testName "Verify food provider update" -passed $updateSuccessful -category "PROVIDER"
} catch {
    Write-TestResult -testName "Verify food provider update" -passed $false -message $_.Exception.Message -category "PROVIDER"
}

# ============ 4. FOOD PROVIDER DASHBOARD TESTS ============
Write-Host "`n4. FOOD PROVIDER DASHBOARD TESTS" -ForegroundColor Yellow

# 4.1 Get dashboard overview
try {
    $dashboardResponse = Invoke-RestMethod -Uri "$baseUrl/food-providers/owner/dashboard" -Method GET -Headers $script:headers
    Write-TestResult -testName "Get dashboard overview" -passed $true -category "DASHBOARD"
} catch {
    Write-TestResult -testName "Get dashboard overview" -passed $false -message $_.Exception.Message -category "DASHBOARD"
}

# 4.2 Get owned food providers
try {
    $ownedProviders = Invoke-RestMethod -Uri "$baseUrl/food-providers/owner/my-providers" -Method GET -Headers $script:headers
    # Force into array to ensure .Count works with single results
    $filteredProviders = @($ownedProviders | Where-Object { $_._id -eq $script:foodProviderId })
    $ownershipVerified = $filteredProviders.Count -gt 0
    Write-TestResult -testName "Get owned food providers" -passed $ownershipVerified -category "DASHBOARD"
} catch {
    Write-TestResult -testName "Get owned food providers" -passed $false -message $_.Exception.Message -category "DASHBOARD"
}

# 4.3 Get analytics
try {
    $analyticsResponse = Invoke-RestMethod -Uri "$baseUrl/food-providers/owner/analytics" -Method GET -Headers $script:headers
    Write-TestResult -testName "Get analytics" -passed $true -category "DASHBOARD"
} catch {
    Write-TestResult -testName "Get analytics" -passed $false -message $_.Exception.Message -category "DASHBOARD"
}

# 4.4 Get analytics with time range
try {
    $analyticsWithDays = Invoke-RestMethod -Uri "$baseUrl/food-providers/owner/analytics?days=30" -Method GET -Headers $script:headers
    Write-TestResult -testName "Get analytics with time range" -passed $true -category "DASHBOARD"
} catch {
    Write-TestResult -testName "Get analytics with time range" -passed $false -message $_.Exception.Message -category "DASHBOARD"
}

# 4.5 Try to access analytics without auth (should fail)
try {
    Invoke-RestMethod -Uri "$baseUrl/food-providers/owner/analytics" -Method GET -ErrorAction SilentlyContinue
    Write-TestResult -testName "Access analytics without auth (should fail)" -passed $false -message "Expected failure but request succeeded" -category "DASHBOARD"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-TestResult -testName "Access analytics without auth (should fail)" -passed $true -category "DASHBOARD"
    } else {
        Write-TestResult -testName "Access analytics without auth (should fail)" -passed $false -message "Unexpected error: $($_.Exception.Message)" -category "DASHBOARD"
    }
}

# ============ 5. MENU MANAGEMENT TESTS ============
Write-Host "`n5. MENU MANAGEMENT TESTS" -ForegroundColor Yellow

# 5.1 Add menu item with valid data
$script:menuItemData = @{
    name = "Test Menu Item $randomSuffix"
    description = "A delicious test food item"
    price = 12.99
    category = "Main Course"
    isVegetarian = $true
    isVegan = $false
    isGlutenFree = $true
    ingredients = @("Ingredient 1", "Ingredient 2", "Ingredient 3")
}

try {
    $menuItemResponse = Invoke-RestMethod -Uri "$baseUrl/food-providers/owner/menu-items/$script:foodProviderId" -Method POST -Body ($script:menuItemData | ConvertTo-Json) -Headers $script:headers
    $script:menuItemId = $menuItemResponse._id
    Write-TestResult -testName "Add menu item with valid data" -passed $true -category "MENU"
} catch {
    Write-TestResult -testName "Add menu item with valid data" -passed $false -message $_.Exception.Message -category "MENU"
}

# 5.2 Add menu item with missing required fields (should fail)
$invalidMenuItemData = @{
    # Missing required name
    description = "An invalid menu item"
    # Missing required price
}

try {
    Invoke-RestMethod -Uri "$baseUrl/food-providers/owner/menu-items/$script:foodProviderId" -Method POST -Body ($invalidMenuItemData | ConvertTo-Json) -Headers $script:headers -ErrorAction SilentlyContinue
    Write-TestResult -testName "Add menu item with missing fields (should fail)" -passed $false -message "Expected failure but creation succeeded" -category "MENU"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-TestResult -testName "Add menu item with missing fields (should fail)" -passed $true -category "MENU"
    } else {
        Write-TestResult -testName "Add menu item with missing fields (should fail)" -passed $false -message "Unexpected error: $($_.Exception.Message)" -category "MENU"
    }
}

# 5.3 Add menu item to non-existent food provider (should fail)
try {
    Invoke-RestMethod -Uri "$baseUrl/food-providers/owner/menu-items/123456789012345678901234" -Method POST -Body ($script:menuItemData | ConvertTo-Json) -Headers $script:headers -ErrorAction SilentlyContinue
    Write-TestResult -testName "Add menu item to non-existent provider (should fail)" -passed $false -message "Expected failure but creation succeeded" -category "MENU"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-TestResult -testName "Add menu item to non-existent provider (should fail)" -passed $true -category "MENU"
    } else {
        Write-TestResult -testName "Add menu item to non-existent provider (should fail)" -passed $false -message "Unexpected error: $($_.Exception.Message)" -category "MENU"
    }
}

# 5.4 Get menu items
try {
    $menuItems = Invoke-RestMethod -Uri "$baseUrl/food-providers/owner/menu-items/$script:foodProviderId" -Method GET -Headers $script:headers
    # Force into array to ensure .Count works with single results
    $filteredMenuItems = @($menuItems | Where-Object { $_._id -eq $script:menuItemId })
    $menuItemExists = $filteredMenuItems.Count -gt 0
    Write-TestResult -testName "Get menu items" -passed $menuItemExists -category "MENU"
} catch {
    Write-TestResult -testName "Get menu items" -passed $false -message $_.Exception.Message -category "MENU"
}

# 5.5 Update menu item
$script:updateMenuItemData = @{
    name = "Updated Menu Item $randomSuffix"
    price = 14.99
    isSpecial = $true
    ingredients = @("New Ingredient 1", "New Ingredient 2")
}

try {
    Invoke-RestMethod -Uri "$baseUrl/food-providers/owner/menu-items/$script:foodProviderId/$script:menuItemId" -Method PUT -Body ($script:updateMenuItemData | ConvertTo-Json) -Headers $script:headers | Out-Null
    Write-TestResult -testName "Update menu item" -passed $true -category "MENU"
} catch {
    Write-TestResult -testName "Update menu item" -passed $false -message $_.Exception.Message -category "MENU"
}

# 5.6 Verify menu item update
try {
    $updatedMenuItems = Invoke-RestMethod -Uri "$baseUrl/food-providers/owner/menu-items/$script:foodProviderId" -Method GET -Headers $script:headers
    $updatedItem = $updatedMenuItems | Where-Object { $_._id -eq $script:menuItemId }
    $updateVerified = ($updatedItem.name -eq $script:updateMenuItemData.name -and $updatedItem.price -eq $script:updateMenuItemData.price)
    Write-TestResult -testName "Verify menu item update" -passed $updateVerified -category "MENU"
} catch {
    Write-TestResult -testName "Verify menu item update" -passed $false -message $_.Exception.Message -category "MENU"
}

# 5.7 Update non-existent menu item (should fail)
try {
    Invoke-RestMethod -Uri "$baseUrl/food-providers/owner/menu-items/$script:foodProviderId/123456789012345678901234" -Method PUT -Body ($script:updateMenuItemData | ConvertTo-Json) -Headers $script:headers -ErrorAction SilentlyContinue | Out-Null
    Write-TestResult -testName "Update non-existent menu item (should fail)" -passed $false -message "Expected failure but update succeeded" -category "MENU"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-TestResult -testName "Update non-existent menu item (should fail)" -passed $true -category "MENU"
    } else {
        Write-TestResult -testName "Update non-existent menu item (should fail)" -passed $false -message "Unexpected error: $($_.Exception.Message)" -category "MENU"
    }
}

# 5.8 Delete menu item
try {
    Invoke-RestMethod -Uri "$baseUrl/food-providers/owner/menu-items/$script:foodProviderId/$script:menuItemId" -Method DELETE -Headers $script:headers | Out-Null
    Write-TestResult -testName "Delete menu item" -passed $true -category "MENU"
} catch {
    Write-TestResult -testName "Delete menu item" -passed $false -message $_.Exception.Message -category "MENU"
}

# 5.9 Verify menu item deletion
try {
    $remainingMenuItems = Invoke-RestMethod -Uri "$baseUrl/food-providers/owner/menu-items/$script:foodProviderId" -Method GET -Headers $script:headers
    $itemDeleted = ($remainingMenuItems | Where-Object { $_._id -eq $script:menuItemId }).Count -eq 0
    Write-TestResult -testName "Verify menu item deletion" -passed $itemDeleted -category "MENU"
} catch {
    Write-TestResult -testName "Verify menu item deletion" -passed $false -message $_.Exception.Message -category "MENU"
}

# ============ 6. USER PROFILE MANAGEMENT TESTS ============
Write-Host "`n6. USER PROFILE MANAGEMENT TESTS" -ForegroundColor Yellow

# 6.1 Get food provider profile
try {
    $profileResponse = Invoke-RestMethod -Uri "$baseUrl/users/food-provider/profile" -Method GET -Headers $script:headers
    $profileValid = ($profileResponse.email -eq $testEmail -and $profileResponse.role -eq "food_provider")
    Write-TestResult -testName "Get food provider profile" -passed $profileValid -category "PROFILE"
} catch {
    Write-TestResult -testName "Get food provider profile" -passed $false -message $_.Exception.Message -category "PROFILE"
}

# 6.2 Get profile via general endpoint
try {
    $generalProfileResponse = Invoke-RestMethod -Uri "$baseUrl/users/profile" -Method GET -Headers $script:headers
    $profileValid = ($generalProfileResponse.email -eq $testEmail -and $generalProfileResponse.role -eq "food_provider")
    Write-TestResult -testName "Get profile via general endpoint" -passed $profileValid -category "PROFILE"
} catch {
    Write-TestResult -testName "Get profile via general endpoint" -passed $false -message $_.Exception.Message -category "PROFILE"
}

# 6.3 Update profile
$script:updateProfileData = @{
    name = "Updated Food Provider Name $randomSuffix"
    phone = "+9876543210"
}

try {
    $updateProfileResponse = Invoke-RestMethod -Uri "$baseUrl/users/profile" -Method PATCH -Body ($script:updateProfileData | ConvertTo-Json) -Headers $script:headers
    Write-TestResult -testName "Update profile" -passed $true -category "PROFILE"
} catch {
    Write-TestResult -testName "Update profile" -passed $false -message $_.Exception.Message -category "PROFILE"
}

# 6.4 Verify profile update
try {
    $updatedProfile = Invoke-RestMethod -Uri "$baseUrl/users/profile" -Method GET -Headers $script:headers
    $updateVerified = ($updatedProfile.name -eq $script:updateProfileData.name -and $updatedProfile.phone -eq $script:updateProfileData.phone)
    Write-TestResult -testName "Verify profile update" -passed $updateVerified -category "PROFILE"
} catch {
    Write-TestResult -testName "Verify profile update" -passed $false -message $_.Exception.Message -category "PROFILE"
}

# 6.5 Update profile with invalid data (should fail)
$invalidProfileData = @{
    email = "invalid-email"  # Invalid email format
}

try {
    Invoke-RestMethod -Uri "$baseUrl/users/profile" -Method PATCH -Body ($invalidProfileData | ConvertTo-Json) -Headers $script:headers -ErrorAction SilentlyContinue
    Write-TestResult -testName "Update profile with invalid data (should fail)" -passed $false -message "Expected failure but update succeeded" -category "PROFILE"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-TestResult -testName "Update profile with invalid data (should fail)" -passed $true -category "PROFILE"
    } else {
        Write-TestResult -testName "Update profile with invalid data (should fail)" -passed $false -message "Unexpected error: $($_.Exception.Message)" -category "PROFILE"
    }
}

# 6.6 Update FCM token
$script:fcmTokenData = @{
    fcmToken = "test_fcm_token_$randomSuffix"
}

try {
    Invoke-RestMethod -Uri "$baseUrl/users/fcm-token" -Method POST -Body ($script:fcmTokenData | ConvertTo-Json) -Headers $script:headers | Out-Null
    Write-TestResult -testName "Update FCM token" -passed $true -category "PROFILE"
} catch {
    Write-TestResult -testName "Update FCM token" -passed $false -message $_.Exception.Message -category "PROFILE"
}

# 6.7 Change password
$script:changePasswordData = @{
    oldPassword = $testPassword
    newPassword = "NewStrongP@ss456"
}

try {
    Invoke-RestMethod -Uri "$baseUrl/users/change-password" -Method PUT -Body ($script:changePasswordData | ConvertTo-Json) -Headers $script:headers | Out-Null
    Write-TestResult -testName "Change password" -passed $true -category "PROFILE"
} catch {
    Write-TestResult -testName "Change password" -passed $false -message $_.Exception.Message -category "PROFILE"
}

# 6.8 Try changing password with incorrect old password (should fail)
$invalidPasswordChangeData = @{
    oldPassword = "WrongOldPassword123"
    newPassword = "NewStrongP@ss789"
}

try {
    Invoke-RestMethod -Uri "$baseUrl/users/change-password" -Method PUT -Body ($invalidPasswordChangeData | ConvertTo-Json) -Headers $script:headers -ErrorAction SilentlyContinue | Out-Null
    Write-TestResult -testName "Change password with incorrect old password (should fail)" -passed $false -message "Expected failure but change succeeded" -category "PROFILE"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-TestResult -testName "Change password with incorrect old password (should fail)" -passed $true -category "PROFILE"
    } else {
        Write-TestResult -testName "Change password with incorrect old password (should fail)" -passed $false -message "Unexpected error: $($_.Exception.Message)" -category "PROFILE"
    }
}

# 6.9 Login with new password
$newLoginData = @{
    email = $testEmail
    password = $script:changePasswordData.newPassword
}

try {
    $newLoginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body ($newLoginData | ConvertTo-Json) -ContentType "application/json"
    $script:newToken = $newLoginResponse.access_token
    Write-TestResult -testName "Login with new password" -passed $true -category "PROFILE"
} catch {
    Write-TestResult -testName "Login with new password" -passed $false -message $_.Exception.Message -category "PROFILE"
}

# 6.10 Try to login with old password (should fail)
$oldPasswordLoginData = @{
    email = $testEmail
    password = $testPassword
}

try {
    Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body ($oldPasswordLoginData | ConvertTo-Json) -ContentType "application/json" -ErrorAction SilentlyContinue
    Write-TestResult -testName "Login with old password (should fail)" -passed $false -message "Expected failure but login succeeded" -category "PROFILE"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-TestResult -testName "Login with old password (should fail)" -passed $true -category "PROFILE"
    } else {
        Write-TestResult -testName "Login with old password (should fail)" -passed $false -message "Unexpected error: $($_.Exception.Message)" -category "PROFILE"
    }
}

# ============ 7. AUTHORIZATION TESTS ============
Write-Host "`n7. AUTHORIZATION TESTS" -ForegroundColor Yellow

# 7.1 Create a student user (for auth testing)
$studentData = @{
    name = "Test Student $randomSuffix"
    email = "student.test.$randomSuffix@test.com"
    password = $testPassword
    phone = "+1234567890"
    role = "student"
    gender = "female"
}

try {
    Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body ($studentData | ConvertTo-Json) -ContentType "application/json" | Out-Null
    Write-TestResult -testName "Create student user" -passed $true -category "AUTH"
} catch {
    Write-TestResult -testName "Create student user" -passed $false -message $_.Exception.Message -category "AUTH"
}

# 7.2 Login as student
$studentLoginData = @{
    email = $studentData.email
    password = $studentData.password
}

try {
    $studentLoginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body ($studentLoginData | ConvertTo-Json) -ContentType "application/json"
    $script:studentToken = $studentLoginResponse.access_token
    Write-TestResult -testName "Login as student" -passed $true -category "AUTH"
} catch {
    Write-TestResult -testName "Login as student" -passed $false -message $_.Exception.Message -category "AUTH"
}

$script:studentHeaders = @{
    "Authorization" = "Bearer $script:studentToken"
    "Content-Type" = "application/json"
}

# 7.3 Try to access food provider dashboard as student (should fail)
try {
    Invoke-RestMethod -Uri "$baseUrl/food-providers/owner/dashboard" -Method GET -Headers $script:studentHeaders -ErrorAction SilentlyContinue
    Write-TestResult -testName "Access food provider dashboard as student (should fail)" -passed $false -message "Expected failure but access succeeded" -category "AUTH"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 403) {
        Write-TestResult -testName "Access food provider dashboard as student (should fail)" -passed $true -category "AUTH"
    } else {
        Write-TestResult -testName "Access food provider dashboard as student (should fail)" -passed $false -message "Unexpected error: $($_.Exception.Message)" -category "AUTH"
    }
}

# 7.4 Try to create food provider as student (should fail)
try {
    Invoke-RestMethod -Uri "$baseUrl/food-providers" -Method POST -Body ($script:foodProviderData | ConvertTo-Json -Depth 5) -Headers $script:studentHeaders -ErrorAction SilentlyContinue
    Write-TestResult -testName "Create food provider as student (should fail)" -passed $false -message "Expected failure but creation succeeded" -category "AUTH"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 403) {
        Write-TestResult -testName "Create food provider as student (should fail)" -passed $true -category "AUTH"
    } else {
        Write-TestResult -testName "Create food provider as student (should fail)" -passed $false -message "Unexpected error: $($_.Exception.Message)" -category "AUTH"
    }
}

# ============ 8. ORDERS TESTS ============
Write-Host "`n8. ORDERS TESTS" -ForegroundColor Yellow

# Update headers with new token after password change
$script:updatedHeaders = @{
    "Authorization" = "Bearer $script:newToken"
    "Content-Type" = "application/json"
}

# 8.1 Get orders for provider
try {
    Invoke-RestMethod -Uri "$baseUrl/food-providers/owner/orders/$script:foodProviderId" -Method GET -Headers $script:updatedHeaders | Out-Null
    Write-TestResult -testName "Get orders for provider" -passed $true -category "ORDERS"
} catch {
    Write-TestResult -testName "Get orders for provider" -passed $false -message $_.Exception.Message -category "ORDERS"
}

# 8.2 Try to get orders for non-existent provider (should fail)
try {
    Invoke-RestMethod -Uri "$baseUrl/food-providers/owner/orders/123456789012345678901234" -Method GET -Headers $script:updatedHeaders -ErrorAction SilentlyContinue | Out-Null
    Write-TestResult -testName "Get orders for non-existent provider (should fail)" -passed $false -message "Expected failure but request succeeded" -category "ORDERS"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-TestResult -testName "Get orders for non-existent provider (should fail)" -passed $true -category "ORDERS"
    } else {
        Write-TestResult -testName "Get orders for non-existent provider (should fail)" -passed $false -message "Unexpected error: $($_.Exception.Message)" -category "ORDERS"
    }
}

# 8.3 Try to get orders for provider without auth (should fail)
try {
    Invoke-RestMethod -Uri "$baseUrl/food-providers/owner/orders/$script:foodProviderId" -Method GET -ErrorAction SilentlyContinue | Out-Null
    Write-TestResult -testName "Get orders without auth (should fail)" -passed $false -message "Expected failure but request succeeded" -category "ORDERS"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-TestResult -testName "Get orders without auth (should fail)" -passed $true -category "ORDERS"
    } else {
        Write-TestResult -testName "Get orders without auth (should fail)" -passed $false -message "Unexpected error: $($_.Exception.Message)" -category "ORDERS"
    }
}

# ============ 9. CLEANUP ============
Write-Host "`n9. CLEANUP" -ForegroundColor Yellow

# 9.1 Delete food provider
try {
    Invoke-RestMethod -Uri "$baseUrl/food-providers/$script:foodProviderId" -Method DELETE -Headers $script:updatedHeaders | Out-Null
    Write-TestResult -testName "Delete food provider" -passed $true -category "CLEANUP"
} catch {
    Write-TestResult -testName "Delete food provider" -passed $false -message $_.Exception.Message -category "CLEANUP"
}

# 9.2 Verify food provider deletion
try {
    Invoke-RestMethod -Uri "$baseUrl/food-providers/$script:foodProviderId" -Method GET -ErrorAction SilentlyContinue | Out-Null
    Write-TestResult -testName "Verify food provider deletion" -passed $false -message "Expected provider to be deleted but it still exists" -category "CLEANUP"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-TestResult -testName "Verify food provider deletion" -passed $true -category "CLEANUP"
    } else {
        Write-TestResult -testName "Verify food provider deletion" -passed $false -message "Unexpected error: $($_.Exception.Message)" -category "CLEANUP"
    }
}

# Calculate success rate and generate summary
$successRate = if ($global:totalTests -gt 0) { [math]::Round(($global:passedTests / $global:totalTests) * 100, 1) } else { 0 }

# Group results by category
$categoryResults = $global:testResults | Group-Object -Property Category | ForEach-Object {
    $categoryTests = $_.Group.Count
    $categoryPassed = ($_.Group | Where-Object { $_.Passed -eq $true }).Count
    $categorySuccess = if ($categoryTests -gt 0) { [math]::Round(($categoryPassed / $categoryTests) * 100, 1) } else { 0 }
    
    [PSCustomObject]@{
        Category = $_.Name
        Total = $categoryTests
        Passed = $categoryPassed
        Failed = $categoryTests - $categoryPassed
        SuccessRate = $categorySuccess
    }
}

Write-Host "`n=== TEST SUMMARY ===" -ForegroundColor Green
Write-Host "Total Tests: $global:totalTests" -ForegroundColor Cyan
Write-Host "Passed Tests: $global:passedTests" -ForegroundColor Green
Write-Host "Failed Tests: $($global:totalTests - $global:passedTests)" -ForegroundColor Red
Write-Host "Overall Success Rate: $successRate%" -ForegroundColor $(if ($successRate -gt 95) { "Green" } elseif ($successRate -gt 80) { "Yellow" } else { "Red" })

Write-Host "`n=== RESULTS BY CATEGORY ===" -ForegroundColor Magenta
foreach ($category in $categoryResults) {
    $color = if ($category.SuccessRate -eq 100) { "Green" } elseif ($category.SuccessRate -gt 80) { "Yellow" } else { "Red" }
    Write-Host "$($category.Category): $($category.Passed)/$($category.Total) tests passed ($($category.SuccessRate)%)" -ForegroundColor $color
}

Write-Host "`n=== FAILED TESTS ===" -ForegroundColor Red
$failedTests = $global:testResults | Where-Object { $_.Passed -eq $false }
if ($failedTests.Count -eq 0) {
    Write-Host "No failed tests! All tests passed successfully." -ForegroundColor Green
} else {
    foreach ($test in $failedTests) {
        Write-Host "❌ [$($test.Category)] $($test.TestName) - $($test.Message)" -ForegroundColor Red
    }
}

Write-Host "`nTest Completed at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "==============================================`n" -ForegroundColor Cyan
