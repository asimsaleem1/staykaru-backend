# StayKaru Food Provider Comprehensive Test
# This script tests all food provider functionality in the StayKaru platform
# Date: June 21, 2025

$baseUrl = "http://localhost:3000"

Write-Host "=== STAYKARU FOOD PROVIDER COMPREHENSIVE TEST ===" -ForegroundColor Cyan
Write-Host "Running comprehensive test of all food provider functionality" -ForegroundColor Cyan
Write-Host "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "---------------------------------------------" -ForegroundColor Cyan

$global:totalTests = 0
$global:passedTests = 0
$global:testResults = @()

function Write-TestResult {
    param (
        [string]$testName,
        [bool]$passed,
        [string]$message = ""
    )
    
    $global:totalTests++
    if ($passed) {
        $global:passedTests++
        Write-Host "✅ $testName" -ForegroundColor Green
    } else {
        Write-Host "❌ $testName - $message" -ForegroundColor Red
    }
    
    $global:testResults += [PSCustomObject]@{
        TestName = $testName
        Passed = $passed
        Message = $message
    }
}

# 1. Register a new food provider
Write-Host "`n1. REGISTRATION AND AUTHENTICATION" -ForegroundColor Yellow
$randomSuffix = Get-Random
$script:registerData = @{
    name = "Test Food Provider $randomSuffix"
    email = "foodprovider.test.$randomSuffix@test.com"
    password = "Test123!@#"
    phone = "+1234567890"
    role = "food_provider"
    gender = "male"
}

try {
    Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body ($script:registerData | ConvertTo-Json) -ContentType "application/json" | Out-Null
    Write-TestResult -testName "User Registration (Food Provider)" -passed $true
} catch {
    Write-TestResult -testName "User Registration (Food Provider)" -passed $false -message $_.Exception.Message
    exit
}

# 2. Login with food provider credentials
$script:loginData = @{
    email = $script:registerData.email
    password = $script:registerData.password
}

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body ($script:loginData | ConvertTo-Json) -ContentType "application/json"
    $script:token = $loginResponse.access_token
    Write-TestResult -testName "Food Provider Login" -passed $true
} catch {
    Write-TestResult -testName "Food Provider Login" -passed $false -message $_.Exception.Message
    exit
}

$script:headers = @{
    "Authorization" = "Bearer $script:token"
    "Content-Type" = "application/json"
}

# 3. Get cities for food provider location
Write-Host "`n2. FOOD PROVIDER MANAGEMENT" -ForegroundColor Yellow
try {
    $citiesResponse = Invoke-RestMethod -Uri "$baseUrl/location/cities" -Method GET
    $script:existingCityId = $citiesResponse[0]._id
    Write-TestResult -testName "Get Available Cities" -passed $true
} catch {
    Write-TestResult -testName "Get Available Cities" -passed $false -message $_.Exception.Message
    $script:existingCityId = "683700350f8a15197d2abf4f"  # Fallback ID
}

# 4. Create a food provider service
$script:foodProviderData = @{
    name = "Test Restaurant $randomSuffix"
    description = "A great test restaurant with amazing food"
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
    Write-TestResult -testName "Create Food Provider" -passed $true
} catch {
    Write-TestResult -testName "Create Food Provider" -passed $false -message $_.Exception.Message
    # If we can't create a food provider, try to get an existing one
    try {
        $ownedProviders = Invoke-RestMethod -Uri "$baseUrl/food-providers/owner/my-providers" -Method GET -Headers $script:headers
        if ($ownedProviders.Count -gt 0) {
            $script:foodProviderId = $ownedProviders[0]._id
            Write-Host "Using existing food provider with ID: $script:foodProviderId" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "Could not retrieve existing food providers" -ForegroundColor Red
    }
}

# 5. Get food provider dashboard
Write-Host "`n3. FOOD PROVIDER DASHBOARD" -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$baseUrl/food-providers/owner/dashboard" -Method GET -Headers $script:headers | Out-Null
    Write-TestResult -testName "Get Dashboard Overview" -passed $true
} catch {
    Write-TestResult -testName "Get Dashboard Overview" -passed $false -message $_.Exception.Message
}

# 6. Get owned food providers
try {
    $ownedProviders = Invoke-RestMethod -Uri "$baseUrl/food-providers/owner/my-providers" -Method GET -Headers $script:headers
    Write-TestResult -testName "Get Owned Food Providers" -passed $true
    
    # If we don't have a food provider ID yet but got results, use the first one
    if (-not $script:foodProviderId -and $ownedProviders.Count -gt 0) {
        $script:foodProviderId = $ownedProviders[0]._id
        Write-Host "Using existing food provider with ID: $script:foodProviderId" -ForegroundColor Yellow
    }
} catch {
    Write-TestResult -testName "Get Owned Food Providers" -passed $false -message $_.Exception.Message
}

# Only continue with menu items if we have a food provider ID
if ($script:foodProviderId) {
    # 7. Add a menu item
    $script:menuItemData = @{
        name = "Test Item $randomSuffix"
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
        Write-TestResult -testName "Add Menu Item" -passed $true
    } catch {
        Write-TestResult -testName "Add Menu Item" -passed $false -message $_.Exception.Message
    }

    # 8. Get menu items
    try {
        $menuItems = Invoke-RestMethod -Uri "$baseUrl/food-providers/owner/menu-items/$script:foodProviderId" -Method GET -Headers $script:headers
        Write-TestResult -testName "Get Menu Items" -passed $true
        
        # If we don't have a menu item ID yet but got results, use the first one
        if (-not $script:menuItemId -and $menuItems.Count -gt 0) {
            $script:menuItemId = $menuItems[0]._id
            Write-Host "Using existing menu item with ID: $script:menuItemId" -ForegroundColor Yellow
        }
    } catch {
        Write-TestResult -testName "Get Menu Items" -passed $false -message $_.Exception.Message
    }

    # Only continue with menu item operations if we have a menu item ID
    if ($script:menuItemId) {
        # 9. Update a menu item
        $script:updateMenuItemData = @{
            name = "Updated Item $randomSuffix"
            price = 14.99
            isSpecial = $true
        }

        try {
            Invoke-RestMethod -Uri "$baseUrl/food-providers/owner/menu-items/$script:foodProviderId/$script:menuItemId" -Method PUT -Body ($script:updateMenuItemData | ConvertTo-Json) -Headers $script:headers | Out-Null
            Write-TestResult -testName "Update Menu Item" -passed $true
        } catch {
            Write-TestResult -testName "Update Menu Item" -passed $false -message $_.Exception.Message
        }

        # 10. Delete a menu item
        try {
            Invoke-RestMethod -Uri "$baseUrl/food-providers/owner/menu-items/$script:foodProviderId/$script:menuItemId" -Method DELETE -Headers $script:headers | Out-Null
            Write-TestResult -testName "Delete Menu Item" -passed $true
        } catch {
            Write-TestResult -testName "Delete Menu Item" -passed $false -message $_.Exception.Message
        }
    }

    # 11. Get orders for provider
    try {
        Invoke-RestMethod -Uri "$baseUrl/food-providers/owner/orders/$script:foodProviderId" -Method GET -Headers $script:headers | Out-Null
        Write-TestResult -testName "Get Orders" -passed $true
    } catch {
        Write-TestResult -testName "Get Orders" -passed $false -message $_.Exception.Message
    }
}

# 12. Get analytics
try {
    Invoke-RestMethod -Uri "$baseUrl/food-providers/owner/analytics" -Method GET -Headers $script:headers | Out-Null
    Write-TestResult -testName "Get Analytics" -passed $true
} catch {
    Write-TestResult -testName "Get Analytics" -passed $false -message $_.Exception.Message
}

# 13. Get food provider profile
Write-Host "`n4. FOOD PROVIDER PROFILE AND SETTINGS" -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$baseUrl/users/food-provider/profile" -Method GET -Headers $script:headers | Out-Null
    Write-TestResult -testName "Get Food Provider Profile" -passed $true
} catch {
    Write-TestResult -testName "Get Food Provider Profile" -passed $false -message $_.Exception.Message
}

# 14. Update food provider profile
$script:updateProfileData = @{
    name = "Updated Food Provider Name"
    phone = "+9876543210"
}

try {
    Invoke-RestMethod -Uri "$baseUrl/users/profile" -Method PATCH -Body ($script:updateProfileData | ConvertTo-Json) -Headers $script:headers | Out-Null
    Write-TestResult -testName "Update Profile" -passed $true
} catch {
    Write-TestResult -testName "Update Profile" -passed $false -message $_.Exception.Message
}

# 15. Update FCM token (for notifications)
$script:fcmTokenData = @{
    fcmToken = "test_fcm_token_$randomSuffix"
}

try {
    Invoke-RestMethod -Uri "$baseUrl/users/fcm-token" -Method POST -Body ($script:fcmTokenData | ConvertTo-Json) -Headers $script:headers | Out-Null
    Write-TestResult -testName "Update FCM Token" -passed $true
} catch {
    Write-TestResult -testName "Update FCM Token" -passed $false -message $_.Exception.Message
}

# 16. Change password
$script:changePasswordData = @{
    oldPassword = $script:registerData.password
    newPassword = "NewTest123!@#"
}

try {
    Invoke-RestMethod -Uri "$baseUrl/users/change-password" -Method PUT -Body ($script:changePasswordData | ConvertTo-Json) -Headers $script:headers | Out-Null
    Write-TestResult -testName "Change Password" -passed $true
} catch {
    Write-TestResult -testName "Change Password" -passed $false -message $_.Exception.Message
}

# 17. Login with new password
$script:loginData = @{
    email = $script:registerData.email
    password = $script:changePasswordData.newPassword
}

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body ($script:loginData | ConvertTo-Json) -ContentType "application/json"
    $script:token = $loginResponse.access_token
    $script:headers = @{
        "Authorization" = "Bearer $script:token"
        "Content-Type" = "application/json"
    }
    Write-TestResult -testName "Login with New Password" -passed $true
} catch {
    Write-TestResult -testName "Login with New Password" -passed $false -message $_.Exception.Message
}

# Calculate success rate
$successRate = if ($global:totalTests -gt 0) { [math]::Round(($global:passedTests / $global:totalTests) * 100, 1) } else { 0 }

Write-Host "`n=== TEST SUMMARY ===" -ForegroundColor Green
Write-Host "Total Tests: $global:totalTests" -ForegroundColor Cyan
Write-Host "Passed Tests: $global:passedTests" -ForegroundColor Green
Write-Host "Failed Tests: $($global:totalTests - $global:passedTests)" -ForegroundColor Red
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -gt 90) { "Green" } elseif ($successRate -gt 70) { "Yellow" } else { "Red" })

if ($successRate -eq 100) {
    Write-Host "`n🎉 PERFECT: All food provider functionality is working perfectly!" -ForegroundColor Green
} elseif ($successRate -gt 90) {
    Write-Host "`n🎉 EXCELLENT: Food provider functionality is working very well!" -ForegroundColor Green
} elseif ($successRate -gt 70) {
    Write-Host "`n👍 GOOD: Most food provider features are working correctly!" -ForegroundColor Yellow
} else {
    Write-Host "`n⚠️ NEEDS WORK: Several food provider features still need fixing!" -ForegroundColor Red
}

Write-Host "`nDetailed Test Results:" -ForegroundColor Cyan
foreach ($result in $global:testResults) {
    $statusColor = if ($result.Passed) { "Green" } else { "Red" }
    $statusSymbol = if ($result.Passed) { "✅" } else { "❌" }
    Write-Host "$statusSymbol $($result.TestName)" -ForegroundColor $statusColor
    if (-not $result.Passed -and $result.Message) {
        Write-Host "   Error: $($result.Message)" -ForegroundColor Red
    }
}

Write-Host "`nTest Completed at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
