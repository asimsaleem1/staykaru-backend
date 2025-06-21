#!/usr/bin/env pwsh
# Debug script for food provider ownership

$baseUri = "http://localhost:3000"
$headers = @{"Content-Type" = "application/json"}

# Create a test user
$randomSuffix = Get-Random
$testEmail = "debug.foodprovider.$randomSuffix@test.com"
$testPassword = "StrongP@ss123"

$registerData = @{
    name = "Debug Food Provider $randomSuffix"
    email = $testEmail
    password = $testPassword
    phone = "+1234567890"
    role = "food_provider"
    gender = "male"
}

try {
    Write-Host "1. Registering user..."
    Invoke-RestMethod -Uri "$baseUri/auth/register" -Method POST -Body ($registerData | ConvertTo-Json) -Headers $headers | Out-Null
    Write-Host "✅ User registered successfully"
    
    Write-Host "`n2. Logging in..."
    $loginBody = @{
        email = $testEmail
        password = $testPassword
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "$baseUri/auth/login" -Method Post -Body $loginBody -Headers $headers
    $authHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $($loginResponse.access_token)"
    }
    Write-Host "✅ Logged in successfully"
    Write-Host "User ID: $($loginResponse.user._id)"
    
    Write-Host "`n3. Getting cities..."
    $cities = Invoke-RestMethod -Uri "$baseUri/location/cities" -Method GET -Headers $headers
    $existingCityId = $cities[0]._id
    Write-Host "✅ Using city ID: $existingCityId"
    
    Write-Host "`n4. Creating food provider..."
    $foodProviderData = @{
        name = "Debug Restaurant $randomSuffix"
        description = "A debug restaurant for testing ownership"
        location = $existingCityId
        cuisine_type = "International"
        operating_hours = @{
            open = "09:00"
            close = "22:00"
        }
        contact_info = @{
            phone = "+1234567890"
            email = "debug.restaurant.$randomSuffix@test.com"
        }
    }
    
    $foodProviderResponse = Invoke-RestMethod -Uri "$baseUri/food-providers" -Method POST -Body ($foodProviderData | ConvertTo-Json -Depth 5) -Headers $authHeaders
    Write-Host "✅ Food provider created successfully"
    Write-Host "Provider ID: $($foodProviderResponse._id)"
    Write-Host "Provider Owner: $($foodProviderResponse.owner)"
    
    Write-Host "`n5. Testing my-providers endpoint..."
    $myProviders = Invoke-RestMethod -Uri "$baseUri/food-providers/owner/my-providers" -Method Get -Headers $authHeaders
    
    Write-Host "Response:"
    Write-Host ($myProviders | ConvertTo-Json -Depth 3)
    
    if ($myProviders.Count -eq 0) {
        Write-Host "❌ No providers found - this is the issue!"
        Write-Host "User ID from login: $($loginResponse.user._id)"
        Write-Host "Provider owner ID: $($foodProviderResponse.owner)"
    } else {
        Write-Host "✅ Found $($myProviders.Count) provider(s)"
        $foundProvider = $myProviders | Where-Object { $_._id -eq $foodProviderResponse._id }
        if ($foundProvider) {
            Write-Host "✅ Created provider found in my-providers"
        } else {
            Write-Host "❌ Created provider NOT found in my-providers"
        }
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)"
    }
}
