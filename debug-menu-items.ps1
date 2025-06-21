#!/usr/bin/env pwsh
# Debug menu items endpoint

$baseUri = "http://localhost:3000"
$headers = @{"Content-Type" = "application/json"}

# Create a test user
$randomSuffix = Get-Random
$testEmail = "debug.menu.$randomSuffix@test.com"
$testPassword = "StrongP@ss123"

$registerData = @{
    name = "Debug Menu Provider $randomSuffix"
    email = $testEmail
    password = $testPassword
    phone = "+1234567890"
    role = "food_provider"
    gender = "male"
}

try {
    Write-Host "1. Setting up test user and provider..."
    Invoke-RestMethod -Uri "$baseUri/auth/register" -Method POST -Body ($registerData | ConvertTo-Json) -Headers $headers | Out-Null
    
    $loginBody = @{
        email = $testEmail
        password = $testPassword
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "$baseUri/auth/login" -Method Post -Body $loginBody -Headers $headers
    $authHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $($loginResponse.access_token)"
    }
    
    $cities = Invoke-RestMethod -Uri "$baseUri/location/cities" -Method GET -Headers $headers
    $existingCityId = $cities[0]._id
    
    $foodProviderData = @{
        name = "Debug Menu Restaurant $randomSuffix"
        description = "A debug restaurant for testing menu items"
        location = $existingCityId
        cuisine_type = "International"
        operating_hours = @{
            open = "09:00"
            close = "22:00"
        }
        contact_info = @{
            phone = "+1234567890"
            email = "debug.menu.restaurant.$randomSuffix@test.com"
        }
    }
    
    $foodProviderResponse = Invoke-RestMethod -Uri "$baseUri/food-providers" -Method POST -Body ($foodProviderData | ConvertTo-Json -Depth 5) -Headers $authHeaders
    $providerId = $foodProviderResponse._id
    Write-Host "✅ Food provider created: $providerId"
    
    Write-Host "`n2. Creating menu item..."
    $menuItemData = @{
        name = "Debug Menu Item $randomSuffix"
        description = "A debug menu item"
        price = 12.99
        category = "Main Course"
        isVegetarian = $true
        isVegan = $false
        isGlutenFree = $true
        ingredients = @("Ingredient 1", "Ingredient 2")
    }
    
    $menuItemResponse = Invoke-RestMethod -Uri "$baseUri/food-providers/owner/menu-items/$providerId" -Method POST -Body ($menuItemData | ConvertTo-Json -Depth 5) -Headers $authHeaders
    $menuItemId = $menuItemResponse._id
    Write-Host "✅ Menu item created: $menuItemId"
    
    Write-Host "`n3. Testing get menu items endpoint..."
    $menuItems = Invoke-RestMethod -Uri "$baseUri/food-providers/owner/menu-items/$providerId" -Method GET -Headers $authHeaders
    
    Write-Host "Response:"
    Write-Host ($menuItems | ConvertTo-Json -Depth 3)
    
    if ($menuItems.Count -eq 0) {
        Write-Host "❌ No menu items found"
    } else {
        Write-Host "✅ Found $($menuItems.Count) menu item(s)"
        $foundMenuItem = $menuItems | Where-Object { $_._id -eq $menuItemId }
        if ($foundMenuItem) {
            Write-Host "✅ Created menu item found in response"
        } else {
            Write-Host "❌ Created menu item NOT found in response"
            Write-Host "Looking for ID: $menuItemId"
            Write-Host "Available IDs: $($menuItems | ForEach-Object { $_._id })"
        }
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)"
    }
}
