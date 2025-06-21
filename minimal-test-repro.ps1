#!/usr/bin/env pwsh
# Minimal reproduction of the failing test logic

$baseUrl = "http://localhost:3000"

# Generate random data like the test does
$randomSuffix = Get-Random
$testEmail = "foodprovider.minimal.$randomSuffix@test.com"
$testPassword = "StrongP@ss123"

Write-Host "=== MINIMAL TEST REPRODUCTION ===" -ForegroundColor Cyan
Write-Host "Testing the exact same logic as the extensive test" -ForegroundColor Cyan

try {
    # 1. Register user
    $registerData = @{
        name = "Test Food Provider $randomSuffix"
        email = $testEmail
        password = $testPassword
        phone = "+1234567890"
        role = "food_provider"
        gender = "male"
    }
    
    Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body ($registerData | ConvertTo-Json) -ContentType "application/json" | Out-Null
    Write-Host "✅ User registered"
    
    # 2. Login
    $loginData = @{
        email = $testEmail
        password = $testPassword
    }
    
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
    $token = $loginResponse.access_token
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    Write-Host "✅ User logged in"
    
    # 3. Get cities
    $cities = Invoke-RestMethod -Uri "$baseUrl/location/cities" -Method GET -ContentType "application/json"
    $existingCityId = $cities[0]._id
    Write-Host "✅ Got cities"
    
    # 4. Create food provider (same logic as test)
    $foodProviderData = @{
        name = "Test Restaurant $randomSuffix"
        description = "A great test restaurant with amazing food for extensive testing"
        location = $existingCityId
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
    
    $foodProviderResponse = Invoke-RestMethod -Uri "$baseUrl/food-providers" -Method POST -Body ($foodProviderData | ConvertTo-Json -Depth 5) -Headers $headers
    $foodProviderId = $foodProviderResponse._id
    Write-Host "✅ Food provider created: $foodProviderId"
    
    # 5. Create menu item (same logic as test)
    $menuItemData = @{
        name = "Test Menu Item $randomSuffix"
        description = "A delicious test food item"
        price = 12.99
        category = "Main Course"
        isVegetarian = $true
        isVegan = $false
        isGlutenFree = $true
        ingredients = @("Ingredient 1", "Ingredient 2", "Ingredient 3")
    }
    
    $menuItemResponse = Invoke-RestMethod -Uri "$baseUrl/food-providers/owner/menu-items/$foodProviderId" -Method POST -Body ($menuItemData | ConvertTo-Json -Depth 5) -Headers $headers
    $menuItemId = $menuItemResponse._id
    Write-Host "✅ Menu item created: $menuItemId"    # 6. TEST: Get owned food providers (exact same logic as failing test)
    Write-Host "`n🧪 Testing 'Get owned food providers'..."
    $ownedProviders = Invoke-RestMethod -Uri "$baseUrl/food-providers/owner/my-providers" -Method GET -Headers $headers
    Write-Host "Owned providers response: $($ownedProviders | ConvertTo-Json -Depth 2)"
    Write-Host "Type: $($ownedProviders.GetType())"
    Write-Host "Length: $($ownedProviders.Length)"
    # Force result into array to ensure .Count works
    $filteredProviders = @($ownedProviders | Where-Object { $_._id -eq $foodProviderId })
    Write-Host "Filtered providers: $($filteredProviders | ConvertTo-Json)"
    Write-Host "Filtered count: $($filteredProviders.Count)"
    $ownershipVerified = $filteredProviders.Count -gt 0
    Write-Host "Looking for provider ID: $foodProviderId"
    Write-Host "Actual provider ID: $($ownedProviders._id)"
    Write-Host "Are they equal? $($ownedProviders._id -eq $foodProviderId)"
    Write-Host "Ownership verified: $ownershipVerified"
    if ($ownershipVerified) {
        Write-Host "✅ [DASHBOARD] Get owned food providers - PASSED" -ForegroundColor Green
    } else {
        Write-Host "❌ [DASHBOARD] Get owned food providers - FAILED" -ForegroundColor Red
    }
    
    # 7. TEST: Get menu items (exact same logic as failing test)
    Write-Host "`n🧪 Testing 'Get menu items'..."
    $menuItems = Invoke-RestMethod -Uri "$baseUrl/food-providers/owner/menu-items/$foodProviderId" -Method GET -Headers $headers
    Write-Host "Menu items response: $($menuItems | ConvertTo-Json -Depth 2)"
    Write-Host "Type: $($menuItems.GetType())"
    Write-Host "Length: $($menuItems.Length)"
    # Force result into array to ensure .Count works
    $filteredMenuItems = @($menuItems | Where-Object { $_._id -eq $menuItemId })
    Write-Host "Filtered menu items: $($filteredMenuItems | ConvertTo-Json)"
    Write-Host "Filtered count: $($filteredMenuItems.Count)"
    $menuItemExists = $filteredMenuItems.Count -gt 0
    Write-Host "Looking for menu item ID: $menuItemId"
    Write-Host "Actual menu item ID: $($menuItems._id)"
    Write-Host "Are they equal? $($menuItems._id -eq $menuItemId)"
    Write-Host "Menu item exists: $menuItemExists"
    if ($menuItemExists) {
        Write-Host "✅ [MENU] Get menu items - PASSED" -ForegroundColor Green
    } else {
        Write-Host "❌ [MENU] Get menu items - FAILED" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}
