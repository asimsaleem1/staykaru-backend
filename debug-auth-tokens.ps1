# Debug Authentication Tokens and User IDs
param(
    [string]$BaseUrl = "http://localhost:3000"
)

Write-Host "=== DEBUGGING AUTHENTICATION TOKENS AND USER IDS ===" -ForegroundColor Yellow
Write-Host "Date: $(Get-Date)" -ForegroundColor Green
Write-Host "---------------------------------------------" -ForegroundColor Green

# Test data
$randomSuffix = Get-Random -Minimum 100000 -Maximum 999999
$testUser = @{
    name = "Debug User $randomSuffix"
    email = "debug.user.$randomSuffix@test.com"
    password = "SecurePass123!"
    role = "food_provider"
    phone = "+1234567890"
    gender = "male"
}

try {    # Register user
    Write-Host "1. Registering test user..." -ForegroundColor Cyan
    $registerResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/register" -Method POST -Body ($testUser | ConvertTo-Json) -ContentType "application/json"
    Write-Host "Registration successful. User ID: $($registerResponse.user.id)" -ForegroundColor Green
    
    # 2. Login user
    Write-Host "2. Logging in..." -ForegroundColor Cyan
    $loginData = @{
        email = $testUser.email
        password = $testUser.password
    }
    $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
    Write-Host "Login successful. Token received." -ForegroundColor Green
    
    # Extract token and user info
    $token = $loginResponse.access_token
    $userFromLogin = $loginResponse.user
    Write-Host "User ID from login: $($userFromLogin.id)" -ForegroundColor Yellow
    Write-Host "User ID type: $($userFromLogin.id.GetType().Name)" -ForegroundColor Yellow
    
    # Set headers
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
      # 3. Get all cities to find a valid location
    Write-Host "3. Getting cities..." -ForegroundColor Cyan
    $cities = Invoke-RestMethod -Uri "$BaseUrl/location/cities" -Method GET
    $validLocationId = $cities[0]._id
    Write-Host "Using location ID: $validLocationId" -ForegroundColor Yellow
    
    # 4. Create food provider
    Write-Host "4. Creating food provider..." -ForegroundColor Cyan
    $providerData = @{
        name = "Debug Restaurant $randomSuffix"
        description = "A test restaurant for debugging"
        location = $validLocationId
        cuisine_type = "International"
        operating_hours = @{
            open = "09:00"
            close = "22:00"
        }
        contact_info = @{
            phone = "+1234567890"
            email = "restaurant.$randomSuffix@test.com"
        }
    }
    
    $provider = Invoke-RestMethod -Uri "$BaseUrl/food-providers" -Method POST -Body ($providerData | ConvertTo-Json -Depth 5) -Headers $headers
    Write-Host "Food provider created. ID: $($provider._id)" -ForegroundColor Green    Write-Host "Provider owner ID: $($provider.owner.id)" -ForegroundColor Yellow
    Write-Host "Provider owner type: $($provider.owner.id.GetType().Name)" -ForegroundColor Yellow
    
    # 5. Try to update the provider
    Write-Host "5. Attempting to update provider..." -ForegroundColor Cyan
    $updateData = @{
        description = "Updated description for debugging"
    }
    
    try {
        $updateResult = Invoke-RestMethod -Uri "$BaseUrl/food-providers/$($provider._id)" -Method PUT -Body ($updateData | ConvertTo-Json) -Headers $headers
        Write-Host "✅ Update successful!" -ForegroundColor Green
        Write-Host $updateResult
    } catch {
        Write-Host "❌ Update failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
    }
      # 6. Compare user IDs
    Write-Host "6. User ID Comparison Analysis:" -ForegroundColor Cyan
    Write-Host "Login user ID: '$($userFromLogin.id)'" -ForegroundColor Yellow
    Write-Host "Provider owner ID: '$($provider.owner.id)'" -ForegroundColor Yellow
    Write-Host "IDs match: $($userFromLogin.id -eq $provider.owner.id)" -ForegroundColor $(if ($userFromLogin.id -eq $provider.owner.id) { "Green" } else { "Red" })
    Write-Host "Login user ID as string: '$($userFromLogin.id.ToString())'" -ForegroundColor Yellow
    Write-Host "Provider owner ID as string: '$($provider.owner.id.ToString())'" -ForegroundColor Yellow
    Write-Host "String comparison: $($userFromLogin.id.ToString() -eq $provider.owner.id.ToString())" -ForegroundColor $(if ($userFromLogin.id.ToString() -eq $provider.owner.id.ToString()) { "Green" } else { "Red" })
    
    # 7. Cleanup - Delete the provider
    Write-Host "7. Cleaning up - deleting provider..." -ForegroundColor Cyan
    try {
        Invoke-RestMethod -Uri "$BaseUrl/food-providers/$($provider._id)" -Method DELETE -Headers $headers
        Write-Host "✅ Cleanup successful!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Cleanup failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Full error: $($_.Exception)" -ForegroundColor Red
}

Write-Host "`n=== DEBUG COMPLETE ===" -ForegroundColor Yellow
