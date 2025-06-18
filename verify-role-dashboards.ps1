#!/bin/pwsh
# Role-based Dashboard Deployment and Verification
Write-Host "StayKaru Role-based Dashboard Deployment & Testing" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# 1. Make sure we have the correct version of dependencies
Write-Host "Step 1: Installing dependencies..." -ForegroundColor Green
npm install

# 2. Build the project
Write-Host "Step 2: Building the project..." -ForegroundColor Green
npm run build

# 3. Start the server in test mode
Write-Host "Step 3: Starting the server for testing..." -ForegroundColor Green
$serverProcess = Start-Process npm -ArgumentList "run", "start:dev" -PassThru -NoNewWindow

# Wait for the server to start
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 4. Testing with dedicated test accounts
Write-Host "Step 4: Testing role-based dashboards with proper role accounts..." -ForegroundColor Green

# Test with landlord account
Write-Host "`nTesting with LANDLORD role account:" -ForegroundColor Cyan
$landlordResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method Post -Body (@{
    email = "landlord.test@property.com"
    password = "LandlordPass123!"
} | ConvertTo-Json) -ContentType "application/json" -ErrorAction SilentlyContinue

if ($landlordResponse.access_token) {
    $landlordToken = $landlordResponse.access_token
    Write-Host "Landlord authentication successful. Token received." -ForegroundColor Green
    
    # Test landlord endpoints
    try {
        $myAccommodations = Invoke-RestMethod -Uri "http://localhost:3000/accommodations/landlord/my-accommodations" -Method Get -Headers @{
            "Authorization" = "Bearer $landlordToken"
        }
        Write-Host "✅ Landlord my-accommodations endpoint: Success ($($myAccommodations.Count) accommodations)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Landlord my-accommodations endpoint: Failed - $_" -ForegroundColor Red
    }
    
    try {
        $dashboard = Invoke-RestMethod -Uri "http://localhost:3000/accommodations/landlord/dashboard" -Method Get -Headers @{
            "Authorization" = "Bearer $landlordToken"
        }
        Write-Host "✅ Landlord dashboard endpoint: Success (Total accommodations: $($dashboard.totalAccommodations))" -ForegroundColor Green
    } catch {
        Write-Host "❌ Landlord dashboard endpoint: Failed - $_" -ForegroundColor Red
    }
    
    try {
        $bookings = Invoke-RestMethod -Uri "http://localhost:3000/accommodations/landlord/bookings" -Method Get -Headers @{
            "Authorization" = "Bearer $landlordToken"
        }
        Write-Host "✅ Landlord bookings endpoint: Success (Total bookings: $($bookings.Count))" -ForegroundColor Green
    } catch {
        Write-Host "❌ Landlord bookings endpoint: Failed - $_" -ForegroundColor Red
    }
    
    try {
        $analytics = Invoke-RestMethod -Uri "http://localhost:3000/accommodations/landlord/analytics?days=30" -Method Get -Headers @{
            "Authorization" = "Bearer $landlordToken"
        }
        Write-Host "✅ Landlord analytics endpoint: Success (Data received for past 30 days)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Landlord analytics endpoint: Failed - $_" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Landlord authentication failed. Using admin account for testing..." -ForegroundColor Red
}

# Test with food provider account
Write-Host "`nTesting with FOOD_PROVIDER role account:" -ForegroundColor Cyan
$fpResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method Post -Body (@{
    email = "foodprovider.test@restaurant.com"
    password = "FoodPass123!"
} | ConvertTo-Json) -ContentType "application/json" -ErrorAction SilentlyContinue

if ($fpResponse.access_token) {
    $fpToken = $fpResponse.access_token
    Write-Host "Food Provider authentication successful. Token received." -ForegroundColor Green
    
    # Test food provider endpoints
    try {
        $myProviders = Invoke-RestMethod -Uri "http://localhost:3000/food-providers/owner/my-providers" -Method Get -Headers @{
            "Authorization" = "Bearer $fpToken"
        }
        Write-Host "✅ Food Provider my-providers endpoint: Success ($($myProviders.Count) providers)" -ForegroundColor Green
        
        # Get the first provider ID if available
        if ($myProviders.Count -gt 0) {
            $providerId = $myProviders[0]._id
        }
    } catch {
        Write-Host "❌ Food Provider my-providers endpoint: Failed - $_" -ForegroundColor Red
    }
    
    try {
        $fpDashboard = Invoke-RestMethod -Uri "http://localhost:3000/food-providers/owner/dashboard" -Method Get -Headers @{
            "Authorization" = "Bearer $fpToken"
        }
        Write-Host "✅ Food Provider dashboard endpoint: Success (Total providers: $($fpDashboard.totalProviders))" -ForegroundColor Green
    } catch {
        Write-Host "❌ Food Provider dashboard endpoint: Failed - $_" -ForegroundColor Red
    }
    
    if ($providerId) {
        # Test menu items endpoints with a real provider ID
        try {
            $menuItems = Invoke-RestMethod -Uri "http://localhost:3000/food-providers/owner/menu-items/$providerId" -Method Get -Headers @{
                "Authorization" = "Bearer $fpToken"
            }
            Write-Host "✅ Food Provider menu-items endpoint: Success ($($menuItems.Count) items)" -ForegroundColor Green
            
            # Create a test menu item
            try {
                $newMenuItem = Invoke-RestMethod -Uri "http://localhost:3000/food-providers/owner/menu-items/$providerId" -Method Post -Body (@{
                    name = "Deployment Test Item"
                    price = 12.99
                    description = "A test item created during deployment verification"
                } | ConvertTo-Json) -ContentType "application/json" -Headers @{
                    "Authorization" = "Bearer $fpToken"
                }
                Write-Host "✅ Food Provider create menu item: Success (ID: $($newMenuItem._id))" -ForegroundColor Green
                
                # Update the menu item if created successfully
                if ($newMenuItem._id) {
                    try {
                        $updatedItem = Invoke-RestMethod -Uri "http://localhost:3000/food-providers/owner/menu-items/$providerId/$($newMenuItem._id)" -Method Put -Body (@{
                            name = "Updated Deployment Test Item"
                            price = 14.99
                            description = "An updated test item"
                        } | ConvertTo-Json) -ContentType "application/json" -Headers @{
                            "Authorization" = "Bearer $fpToken"
                        }
                        Write-Host "✅ Food Provider update menu item: Success" -ForegroundColor Green
                        
                        # Delete the test item
                        try {
                            $deleteResponse = Invoke-RestMethod -Uri "http://localhost:3000/food-providers/owner/menu-items/$providerId/$($newMenuItem._id)" -Method Delete -Headers @{
                                "Authorization" = "Bearer $fpToken"
                            }
                            Write-Host "✅ Food Provider delete menu item: Success" -ForegroundColor Green
                        } catch {
                            Write-Host "❌ Food Provider delete menu item: Failed - $_" -ForegroundColor Red
                        }
                    } catch {
                        Write-Host "❌ Food Provider update menu item: Failed - $_" -ForegroundColor Red
                    }
                }
            } catch {
                Write-Host "❌ Food Provider create menu item: Failed - $_" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ Food Provider menu-items endpoint: Failed - $_" -ForegroundColor Red
        }
        
        # Test orders endpoint
        try {
            $orders = Invoke-RestMethod -Uri "http://localhost:3000/food-providers/owner/orders/$providerId" -Method Get -Headers @{
                "Authorization" = "Bearer $fpToken"
            }
            Write-Host "✅ Food Provider orders endpoint: Success ($($orders.Count) orders)" -ForegroundColor Green
        } catch {
            Write-Host "❌ Food Provider orders endpoint: Failed - $_" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️ No provider ID available for testing menu items and orders endpoints" -ForegroundColor Yellow
    }
    
    # Test analytics endpoint
    try {
        $fpAnalytics = Invoke-RestMethod -Uri "http://localhost:3000/food-providers/owner/analytics?days=30" -Method Get -Headers @{
            "Authorization" = "Bearer $fpToken"
        }
        Write-Host "✅ Food Provider analytics endpoint: Success (Data received for past 30 days)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Food Provider analytics endpoint: Failed - $_" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Food Provider authentication failed. Using admin account for testing..." -ForegroundColor Red
}

# 5. Test that unauthorized users cannot access role-specific endpoints
Write-Host "`nTesting role-based access control:" -ForegroundColor Cyan
$studentResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method Post -Body (@{
    email = "student.test@university.edu"
    password = "StudentPass123!"
} | ConvertTo-Json) -ContentType "application/json" -ErrorAction SilentlyContinue

if ($studentResponse.access_token) {
    $studentToken = $studentResponse.access_token
    Write-Host "Student authentication successful. Testing access to protected endpoints..." -ForegroundColor Green
    
    # Try accessing landlord endpoint as student (should fail)
    try {
        $result = Invoke-RestMethod -Uri "http://localhost:3000/accommodations/landlord/dashboard" -Method Get -Headers @{
            "Authorization" = "Bearer $studentToken"
        } -ErrorAction Stop
        Write-Host "❌ Role-based protection failed: Student can access landlord dashboard" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 403) {
            Write-Host "✅ Role-based protection working: Student cannot access landlord dashboard (403 Forbidden)" -ForegroundColor Green
        } else {
            Write-Host "❓ Unexpected error when student tries to access landlord dashboard: $_" -ForegroundColor Yellow
        }
    }
    
    # Try accessing food provider endpoint as student (should fail)
    try {
        $result = Invoke-RestMethod -Uri "http://localhost:3000/food-providers/owner/dashboard" -Method Get -Headers @{
            "Authorization" = "Bearer $studentToken"
        } -ErrorAction Stop
        Write-Host "❌ Role-based protection failed: Student can access food provider dashboard" -ForegroundColor Red
    } catch {        if ($_.Exception.Response.StatusCode.value__ -eq 403) {
            Write-Host "✅ Role-based protection working: Student cannot access food provider dashboard (403 Forbidden)" -ForegroundColor Green
        } else {
            Write-Host "❓ Unexpected error when student tries to access food provider dashboard: $_" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "⚠️ Student authentication failed. Skipping role-based access testing." -ForegroundColor Yellow
}

# 6. Stop the test server
Write-Host "`nStep 6: Stopping the test server..." -ForegroundColor Green
Stop-Process -Id $serverProcess.Id -Force

# 7. Prepare for deployment
Write-Host "`nStep 7: Preparing for deployment..." -ForegroundColor Green
# Clean up any test data or temporary files if needed

# 8. Show summary of testing results
Write-Host "`nRole-based Dashboard Implementation Testing Complete!" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review any failed tests and fix issues if needed" -ForegroundColor Yellow
Write-Host "2. Deploy to production using 'npm run deploy'" -ForegroundColor Yellow
Write-Host "3. Verify role-based dashboards on production environment" -ForegroundColor Yellow
Write-Host "4. Check the frontend integration guide at ROLE_BASED_DASHBOARD_IMPLEMENTATION_GUIDE.md" -ForegroundColor Yellow

Write-Host "`nDone!" -ForegroundColor Green
