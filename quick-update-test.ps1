# Quick Update Test
param(
    [string]$BaseUrl = "http://localhost:3000"
)

Write-Host "=== TESTING FOOD PROVIDER UPDATE ===" -ForegroundColor Yellow

# Test data
$randomSuffix = Get-Random -Minimum 100000 -Maximum 999999
$testUser = @{
    name = "Test User $randomSuffix"
    email = "test.user.$randomSuffix@test.com"
    password = "SecurePass123!"
    role = "food_provider"
    phone = "+1234567890"
    gender = "male"
}

try {
    # Register and login
    Write-Host "1. Registering and logging in..." -ForegroundColor Cyan
    $registerResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/register" -Method POST -Body ($testUser | ConvertTo-Json) -ContentType "application/json"
    
    $loginData = @{ email = $testUser.email; password = $testUser.password }
    $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
    
    $headers = @{
        "Authorization" = "Bearer $($loginResponse.access_token)"
        "Content-Type" = "application/json"
    }
    
    # Get location
    Write-Host "2. Getting location..." -ForegroundColor Cyan
    $cities = Invoke-RestMethod -Uri "$BaseUrl/location/cities" -Method GET
    $validLocationId = $cities[0]._id
    
    # Create provider
    Write-Host "3. Creating food provider..." -ForegroundColor Cyan
    $providerData = @{
        name = "Test Restaurant $randomSuffix"
        description = "A test restaurant"
        location = $validLocationId
        cuisine_type = "Italian"
    }
    
    $provider = Invoke-RestMethod -Uri "$BaseUrl/food-providers" -Method POST -Body ($providerData | ConvertTo-Json -Depth 5) -Headers $headers
    Write-Host "✅ Provider created: $($provider._id)" -ForegroundColor Green
    
    # Update provider
    Write-Host "4. Updating food provider..." -ForegroundColor Cyan
    $updateData = @{
        description = "Updated description - test successful!"
    }
    
    $updateResult = Invoke-RestMethod -Uri "$BaseUrl/food-providers/$($provider._id)" -Method PUT -Body ($updateData | ConvertTo-Json) -Headers $headers
    Write-Host "✅ Update successful!" -ForegroundColor Green
    
    # Clean up
    Write-Host "5. Cleaning up..." -ForegroundColor Cyan
    Invoke-RestMethod -Uri "$BaseUrl/food-providers/$($provider._id)" -Method DELETE -Headers $headers
    Write-Host "✅ Cleanup successful!" -ForegroundColor Green
    
    Write-Host "`n🎉 ALL TESTS PASSED!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}
