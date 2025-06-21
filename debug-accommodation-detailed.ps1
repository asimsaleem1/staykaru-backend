# Accommodation Creation Debug Test

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

# Register and login
$registerData = @{
    name = "Accommodation Debug"
    email = "acc.debug.$(Get-Random)@test.com"
    password = "Test123!@#"
    phone = "+1234567890"
    role = "landlord"
    gender = "male"
}

Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body ($registerData | ConvertTo-Json) -ContentType "application/json" | Out-Null

$loginData = @{
    email = $registerData.email
    password = $registerData.password
}

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
$token = $loginResponse.access_token

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "Testing accommodation creation with different payloads..." -ForegroundColor Yellow

# Test 1: Minimal payload
Write-Host "`n1. Testing minimal payload..." -ForegroundColor Cyan
$minimalData = @{
    title = "Test Accommodation"
    description = "A test accommodation"
    city = "507f1f77bcf86cd799439011"
    price = 1000
    amenities = @("WiFi")
    availability = @("2024-06-22")
}

try {
    $response1 = Invoke-RestMethod -Uri "$baseUrl/accommodations" -Method POST -Body ($minimalData | ConvertTo-Json) -Headers $headers
    Write-Host "✅ Minimal payload successful!" -ForegroundColor Green
    $response1 | ConvertTo-Json -Depth 2
} catch {
    Write-Host "❌ Minimal payload failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Error details: $responseBody" -ForegroundColor Red
        } catch {
            Write-Host "Could not read error details" -ForegroundColor Red
        }
    }
}

# Test 2: Create a city first
Write-Host "`n2. Testing city creation first..." -ForegroundColor Cyan

$cityData = @{
    name = "Test City"
    country = "507f1f77bcf86cd799439012"
    location = @{
        type = "Point"
        coordinates = @(74.3587, 31.5204)
    }
}

try {
    $cityResponse = Invoke-RestMethod -Uri "$baseUrl/location/cities" -Method POST -Body ($cityData | ConvertTo-Json -Depth 3) -Headers $headers
    Write-Host "✅ City created: $($cityResponse._id)" -ForegroundColor Green
    
    # Now try accommodation with real city
    $accommodationWithRealCity = @{
        title = "Test Accommodation with Real City"
        description = "A test accommodation with real city"
        city = $cityResponse._id
        price = 1500
        amenities = @("WiFi", "Parking")
        availability = @("2024-06-22", "2024-06-23")
    }
    
    $response2 = Invoke-RestMethod -Uri "$baseUrl/accommodations" -Method POST -Body ($accommodationWithRealCity | ConvertTo-Json) -Headers $headers
    Write-Host "✅ Accommodation with real city successful!" -ForegroundColor Green
    $response2 | ConvertTo-Json -Depth 2
    
} catch {
    Write-Host "❌ City/accommodation creation failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Error details: $responseBody" -ForegroundColor Red
        } catch {
            Write-Host "Could not read error details" -ForegroundColor Red
        }
    }
}

# Test 3: Check what cities exist
Write-Host "`n3. Checking existing cities..." -ForegroundColor Cyan
try {
    $citiesResponse = Invoke-RestMethod -Uri "$baseUrl/location/cities" -Method GET
    Write-Host "✅ Found $($citiesResponse.Count) cities" -ForegroundColor Green
    if ($citiesResponse.Count -gt 0) {
        Write-Host "First city: $($citiesResponse[0]._id) - $($citiesResponse[0].name)" -ForegroundColor Cyan
        
        # Try with existing city
        $accommodationWithExistingCity = @{
            title = "Test Accommodation with Existing City"
            description = "A test accommodation with existing city"
            city = $citiesResponse[0]._id
            price = 2000
            amenities = @("WiFi")
            availability = @("2024-06-22")
        }
        
        $response3 = Invoke-RestMethod -Uri "$baseUrl/accommodations" -Method POST -Body ($accommodationWithExistingCity | ConvertTo-Json) -Headers $headers
        Write-Host "✅ Accommodation with existing city successful!" -ForegroundColor Green
        Write-Host "Accommodation ID: $($response3._id)" -ForegroundColor Green
        Write-Host "Approval Status: $($response3.approvalStatus)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Cities check failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}
