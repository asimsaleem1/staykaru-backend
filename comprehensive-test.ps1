#!/bin/pwsh
# Comprehensive Role-Based Dashboard Test Script
Write-Host "StayKaru Role-Based Dashboard Comprehensive Testing" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

# Function to test API endpoints
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null,
        [string]$Description
    )
    
    Write-Host "Testing: $Description" -ForegroundColor Yellow
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = $Body
        }
          $response = Invoke-RestMethod @params
        Write-Host "SUCCESS: $Description" -ForegroundColor Green
        return $response
    }
    catch {        if ($_.Exception.Response.StatusCode.value__ -eq 403) {
            Write-Host "PROTECTED: $Description (403 Forbidden - Expected for role protection)" -ForegroundColor Blue
        } elseif ($_.Exception.Response.StatusCode.value__ -eq 401) {
            Write-Host "UNAUTHORIZED: $Description (401 Unauthorized)" -ForegroundColor Magenta
        } else {
            Write-Host "FAILED: $Description - $($_.Exception.Message)" -ForegroundColor Red
        }
        return $null
    }
}

# Start the server in the background
Write-Host "Starting the server..." -ForegroundColor Green
$serverProcess = Start-Process npm -ArgumentList "run", "start:dev" -PassThru -NoNewWindow

# Wait for server to start
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Test basic server health
Write-Host "`n1. Testing Server Health" -ForegroundColor Cyan
Test-Endpoint -Url "http://localhost:3000" -Description "Server Health Check"

# Test authentication with admin user
Write-Host "`n2. Testing Authentication" -ForegroundColor Cyan
$loginResponse = Test-Endpoint -Url "http://localhost:3000/auth/login" -Method "POST" -Body (@{
    email = "assaleemofficial@gmail.com"
    password = "Sarim786"
} | ConvertTo-Json) -Description "Admin Login"

if ($loginResponse -and $loginResponse.access_token) {
    $adminToken = $loginResponse.access_token
    $authHeaders = @{ "Authorization" = "Bearer $adminToken" }
    Write-Host "Admin token received successfully" -ForegroundColor Green
    
    # Test landlord endpoints with admin token (should work since admin can access all)
    Write-Host "`n3. Testing Landlord Dashboard Endpoints (Admin Access)" -ForegroundColor Cyan
    
    Test-Endpoint -Url "http://localhost:3000/accommodations/landlord/my-accommodations" -Headers $authHeaders -Description "Get Landlord Accommodations"
    
    $dashboardData = Test-Endpoint -Url "http://localhost:3000/accommodations/landlord/dashboard" -Headers $authHeaders -Description "Get Landlord Dashboard"
    
    Test-Endpoint -Url "http://localhost:3000/accommodations/landlord/bookings" -Headers $authHeaders -Description "Get Landlord Bookings"
    
    Test-Endpoint -Url "http://localhost:3000/accommodations/landlord/analytics?days=30" -Headers $authHeaders -Description "Get Landlord Analytics"
    
    # Test food provider endpoints with admin token
    Write-Host "`n4. Testing Food Provider Dashboard Endpoints (Admin Access)" -ForegroundColor Cyan
    
    Test-Endpoint -Url "http://localhost:3000/food-providers/owner/my-providers" -Headers $authHeaders -Description "Get Food Provider Services"
    
    $fpDashboardData = Test-Endpoint -Url "http://localhost:3000/food-providers/owner/dashboard" -Headers $authHeaders -Description "Get Food Provider Dashboard"
    
    Test-Endpoint -Url "http://localhost:3000/food-providers/owner/analytics?days=30" -Headers $authHeaders -Description "Get Food Provider Analytics"
    
    # Test CRUD operations for food providers if we have any
    Write-Host "`n5. Testing Menu Item CRUD Operations" -ForegroundColor Cyan
    
    # First, let's try to create a food provider for testing
    $testProvider = Test-Endpoint -Url "http://localhost:3000/food-providers" -Method "POST" -Headers $authHeaders -Body (@{
        name = "Test Restaurant for Dashboard"
        description = "A test restaurant for dashboard testing"
        cuisine_type = "International"
        operating_hours = @{
            open = "09:00"
            close = "22:00"
        }
    } | ConvertTo-Json) -Description "Create Test Food Provider"
    
    if ($testProvider -and $testProvider._id) {
        $providerId = $testProvider._id
        Write-Host "Created test provider with ID: $providerId" -ForegroundColor Green
        
        # Test menu items endpoints
        Test-Endpoint -Url "http://localhost:3000/food-providers/owner/menu-items/$providerId" -Headers $authHeaders -Description "Get Menu Items"
        
        # Create a test menu item
        $testMenuItem = Test-Endpoint -Url "http://localhost:3000/food-providers/owner/menu-items/$providerId" -Method "POST" -Headers $authHeaders -Body (@{
            name = "Test Burger"
            price = 15.99
            description = "A delicious test burger"
            category = "Main Course"
        } | ConvertTo-Json) -Description "Create Test Menu Item"
        
        if ($testMenuItem -and $testMenuItem._id) {
            $menuItemId = $testMenuItem._id
            Write-Host "Created test menu item with ID: $menuItemId" -ForegroundColor Green
            
            # Update the menu item
            Test-Endpoint -Url "http://localhost:3000/food-providers/owner/menu-items/$providerId/$menuItemId" -Method "PUT" -Headers $authHeaders -Body (@{
                name = "Updated Test Burger"
                price = 17.99
                description = "An updated delicious test burger"
                category = "Main Course"
            } | ConvertTo-Json) -Description "Update Test Menu Item"
            
            # Test orders endpoint
            Test-Endpoint -Url "http://localhost:3000/food-providers/owner/orders/$providerId" -Headers $authHeaders -Description "Get Provider Orders"
            
            # Clean up - delete the test menu item
            Test-Endpoint -Url "http://localhost:3000/food-providers/owner/menu-items/$providerId/$menuItemId" -Method "DELETE" -Headers $authHeaders -Description "Delete Test Menu Item"
        }
    }
    
    # Test accommodation CRUD operations
    Write-Host "`n6. Testing Accommodation CRUD Operations" -ForegroundColor Cyan
    
    # Create a test accommodation
    $testAccommodation = Test-Endpoint -Url "http://localhost:3000/accommodations" -Method "POST" -Headers $authHeaders -Body (@{
        title = "Test Apartment for Dashboard"
        description = "A test apartment for dashboard testing"
        price = 1200
        amenities = @("WiFi", "Kitchen", "Parking")
        city = "675050f6acb8e23f397f8aed"  # Using a placeholder city ID
    } | ConvertTo-Json) -Description "Create Test Accommodation"
    
    if ($testAccommodation -and $testAccommodation._id) {
        $accommodationId = $testAccommodation._id
        Write-Host "Created test accommodation with ID: $accommodationId" -ForegroundColor Green
        
        # Update the accommodation
        Test-Endpoint -Url "http://localhost:3000/accommodations/$accommodationId" -Method "PUT" -Headers $authHeaders -Body (@{
            title = "Updated Test Apartment"
            description = "An updated test apartment for dashboard testing"
            price = 1300
        } | ConvertTo-Json) -Description "Update Test Accommodation"
    }
    
    # Test role-based access control
    Write-Host "`n7. Testing Role-Based Access Control" -ForegroundColor Cyan
    
    # Test without authentication (should fail)
    Test-Endpoint -Url "http://localhost:3000/accommodations/landlord/dashboard" -Description "Landlord Dashboard (No Auth - Should Fail)"
    Test-Endpoint -Url "http://localhost:3000/food-providers/owner/dashboard" -Description "Food Provider Dashboard (No Auth - Should Fail)"
    
} else {
    Write-Host "❌ Could not authenticate admin user. Cannot proceed with protected endpoint tests." -ForegroundColor Red
}

# Test other public endpoints
Write-Host "`n8. Testing Public Endpoints" -ForegroundColor Cyan
Test-Endpoint -Url "http://localhost:3000/accommodations" -Description "Get All Accommodations (Public)"
Test-Endpoint -Url "http://localhost:3000/food-providers" -Description "Get All Food Providers (Public)"

# Stop the server
Write-Host "`n9. Cleaning Up" -ForegroundColor Cyan
Write-Host "Stopping the test server..." -ForegroundColor Yellow
Stop-Process -Id $serverProcess.Id -Force

Write-Host "`nComprehensive Testing Complete!" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "Green: Successful operations" -ForegroundColor Green
Write-Host "Blue: Protected endpoints (403 Forbidden - Expected)" -ForegroundColor Blue
Write-Host "Magenta: Unauthorized (401 - Authentication required)" -ForegroundColor Magenta
Write-Host "Red: Failed operations" -ForegroundColor Red

Write-Host "`nNext step: Deploy to Heroku if all tests look good!" -ForegroundColor Cyan
