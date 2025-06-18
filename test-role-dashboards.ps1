# Landlord dashboard testing
Write-Host "Testing Landlord Dashboard endpoints..." -ForegroundColor Green

# Login as a landlord user (replace with actual credentials)
Write-Host "1. Logging in as landlord..."
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method Post -Body (@{
    email = "landlord@example.com"
    password = "password123"
} | ConvertTo-Json) -ContentType "application/json"

$token = $loginResponse.access_token
Write-Host "Authentication successful. Token received." -ForegroundColor Green

# Test my-accommodations endpoint
Write-Host "2. Getting landlord's accommodations..."
try {
    $accommodations = Invoke-RestMethod -Uri "http://localhost:3000/accommodations/landlord/my-accommodations" -Method Get -Headers @{
        "Authorization" = "Bearer $token"
    }
    Write-Host "Accommodations count: $($accommodations.Count)" -ForegroundColor Green
}
catch {
    Write-Host "Error getting accommodations: $_" -ForegroundColor Red
}

# Test landlord dashboard endpoint
Write-Host "3. Getting landlord dashboard data..."
try {
    $dashboard = Invoke-RestMethod -Uri "http://localhost:3000/accommodations/landlord/dashboard" -Method Get -Headers @{
        "Authorization" = "Bearer $token"
    }
    Write-Host "Dashboard data received. Total accommodations: $($dashboard.totalAccommodations)" -ForegroundColor Green
}
catch {
    Write-Host "Error getting dashboard: $_" -ForegroundColor Red
}

# Test landlord bookings endpoint
Write-Host "4. Getting landlord bookings..."
try {
    $bookings = Invoke-RestMethod -Uri "http://localhost:3000/accommodations/landlord/bookings" -Method Get -Headers @{
        "Authorization" = "Bearer $token"
    }
    Write-Host "Bookings data received. Total bookings: $($bookings.Count)" -ForegroundColor Green
}
catch {
    Write-Host "Error getting bookings: $_" -ForegroundColor Red
}

# Test landlord analytics endpoint
Write-Host "5. Getting landlord analytics..."
try {
    $analytics = Invoke-RestMethod -Uri "http://localhost:3000/accommodations/landlord/analytics?days=30" -Method Get -Headers @{
        "Authorization" = "Bearer $token"
    }
    Write-Host "Analytics data received for the past 30 days. Total bookings: $($analytics.totalBookings)" -ForegroundColor Green
}
catch {
    Write-Host "Error getting analytics: $_" -ForegroundColor Red
}

# Food Provider dashboard testing
Write-Host "`nTesting Food Provider Dashboard endpoints..." -ForegroundColor Green

# Login as a food provider user (replace with actual credentials)
Write-Host "1. Logging in as food provider..."
$fpLoginResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method Post -Body (@{
    email = "foodprovider@example.com"
    password = "password123"
} | ConvertTo-Json) -ContentType "application/json"

$fpToken = $fpLoginResponse.access_token
Write-Host "Authentication successful. Token received." -ForegroundColor Green

# Test my-providers endpoint
Write-Host "2. Getting user's food providers..."
try {
    $providers = Invoke-RestMethod -Uri "http://localhost:3000/food-providers/owner/my-providers" -Method Get -Headers @{
        "Authorization" = "Bearer $fpToken"
    }
    Write-Host "Food providers count: $($providers.Count)" -ForegroundColor Green
    
    # Save first provider ID for next tests
    if ($providers.Count -gt 0) {
        $providerId = $providers[0]._id
        Write-Host "Using food provider ID: $providerId for further tests" -ForegroundColor Green
    }
    else {
        Write-Host "No food providers found for this user" -ForegroundColor Yellow
        exit
    }
}
catch {
    Write-Host "Error getting food providers: $_" -ForegroundColor Red
}

# Test provider dashboard endpoint
Write-Host "3. Getting food provider dashboard data..."
try {
    $fpDashboard = Invoke-RestMethod -Uri "http://localhost:3000/food-providers/owner/dashboard" -Method Get -Headers @{
        "Authorization" = "Bearer $fpToken"
    }
    Write-Host "Dashboard data received. Total providers: $($fpDashboard.totalProviders)" -ForegroundColor Green
}
catch {
    Write-Host "Error getting dashboard: $_" -ForegroundColor Red
}

# Test menu items endpoint
Write-Host "4. Getting menu items for provider..."
try {
    $menuItems = Invoke-RestMethod -Uri "http://localhost:3000/food-providers/owner/menu-items/$providerId" -Method Get -Headers @{
        "Authorization" = "Bearer $fpToken"
    }
    Write-Host "Menu items count: $($menuItems.Count)" -ForegroundColor Green
}
catch {
    Write-Host "Error getting menu items: $_" -ForegroundColor Red
}

# Test creating a menu item
Write-Host "5. Creating a new menu item..."
try {
    $newMenuItem = Invoke-RestMethod -Uri "http://localhost:3000/food-providers/owner/menu-items/$providerId" -Method Post -Body (@{
        name = "Test Menu Item"
        price = 9.99
        description = "A test menu item created via API"
    } | ConvertTo-Json) -ContentType "application/json" -Headers @{
        "Authorization" = "Bearer $fpToken"
    }
    Write-Host "New menu item created with ID: $($newMenuItem._id)" -ForegroundColor Green
    $menuItemId = $newMenuItem._id
}
catch {
    Write-Host "Error creating menu item: $_" -ForegroundColor Red
}

# Test updating a menu item
if ($menuItemId) {
    Write-Host "6. Updating the menu item..."
    try {
        $updatedMenuItem = Invoke-RestMethod -Uri "http://localhost:3000/food-providers/owner/menu-items/$providerId/$menuItemId" -Method Put -Body (@{
            name = "Updated Test Menu Item"
            price = 10.99
            description = "An updated test menu item"
        } | ConvertTo-Json) -ContentType "application/json" -Headers @{
            "Authorization" = "Bearer $fpToken"
        }
        Write-Host "Menu item updated successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "Error updating menu item: $_" -ForegroundColor Red
    }
}

# Test provider orders endpoint
Write-Host "7. Getting orders for provider..."
try {
    $orders = Invoke-RestMethod -Uri "http://localhost:3000/food-providers/owner/orders/$providerId" -Method Get -Headers @{
        "Authorization" = "Bearer $fpToken"
    }
    Write-Host "Orders count: $($orders.Count)" -ForegroundColor Green
}
catch {
    Write-Host "Error getting orders: $_" -ForegroundColor Red
}

# Test provider analytics endpoint
Write-Host "8. Getting provider analytics..."
try {
    $fpAnalytics = Invoke-RestMethod -Uri "http://localhost:3000/food-providers/owner/analytics?days=30" -Method Get -Headers @{
        "Authorization" = "Bearer $fpToken"
    }
    Write-Host "Analytics data received for the past 30 days. Total orders: $($fpAnalytics.totalOrders)" -ForegroundColor Green
}
catch {
    Write-Host "Error getting analytics: $_" -ForegroundColor Red
}

# Cleanup - delete the created menu item
if ($menuItemId) {
    Write-Host "9. Deleting the test menu item..."
    try {
        $deleteResponse = Invoke-RestMethod -Uri "http://localhost:3000/food-providers/owner/menu-items/$providerId/$menuItemId" -Method Delete -Headers @{
            "Authorization" = "Bearer $fpToken"
        }
        Write-Host "Menu item deleted successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "Error deleting menu item: $_" -ForegroundColor Red
    }
}

Write-Host "`nAll tests completed!" -ForegroundColor Green
