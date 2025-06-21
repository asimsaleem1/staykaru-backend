param(
    [switch]$Verbose
)

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"
$randomSuffix = Get-Random

# Registration
$registerData = @{
    name = "Test Food Provider Debug $randomSuffix"
    email = "debug.foodprovider.$randomSuffix@test.com"
    password = "Test123!@#"
    phone = "+1234567890"
    role = "food_provider"
    gender = "male"
}

Write-Host "Registering new food provider user..." -ForegroundColor Cyan
try {
    Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body ($registerData | ConvertTo-Json) -ContentType "application/json" | Out-Null
    Write-Host "✅ Registration successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Login
$loginData = @{
    email = $registerData.email
    password = $registerData.password
}

Write-Host "Logging in..." -ForegroundColor Cyan
try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
    $token = $loginResponse.access_token
    Write-Host "✅ Login successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Get city ID
Write-Host "Getting city ID..." -ForegroundColor Cyan
try {
    $citiesResponse = Invoke-RestMethod -Uri "$baseUrl/location/cities" -Method GET
    $existingCityId = $citiesResponse[0]._id
    Write-Host "✅ Got city ID: $existingCityId" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to get cities: $($_.Exception.Message)" -ForegroundColor Red
    $existingCityId = "683700350f8a15197d2abf4f"  # Fallback ID
    Write-Host "Using fallback city ID: $existingCityId" -ForegroundColor Yellow
}

# First attempt - using current test script data format
Write-Host "`nAttempt 1: Using current test script format" -ForegroundColor Magenta
$foodProviderData1 = @{
    name = "Test Restaurant Format 1 $randomSuffix"
    description = "A great test restaurant with amazing food"
    address = "123 Test Street"
    city = $existingCityId
    cuisineType = "International"
    openingHours = @{
        monday = @{ open = "09:00"; close = "22:00" }
        tuesday = @{ open = "09:00"; close = "22:00" }
        wednesday = @{ open = "09:00"; close = "22:00" }
        thursday = @{ open = "09:00"; close = "22:00" }
        friday = @{ open = "09:00"; close = "23:00" }
        saturday = @{ open = "10:00"; close = "23:00" }
        sunday = @{ open = "10:00"; close = "22:00" }
    }
}

Write-Host "Request payload:" -ForegroundColor Yellow
if ($Verbose) {
    $foodProviderData1 | ConvertTo-Json -Depth 5
}

try {
    $response1 = Invoke-RestMethod -Uri "$baseUrl/food-providers" -Method POST -Body ($foodProviderData1 | ConvertTo-Json -Depth 5) -Headers $headers
    Write-Host "✅ Success! Food provider created with ID: $($response1._id)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($Verbose -and $_.Exception.Response) {
        $responseStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($responseStream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Red
    }
}

# Second attempt - matching DTO format
Write-Host "`nAttempt 2: Using DTO format" -ForegroundColor Magenta
$foodProviderData2 = @{
    name = "Test Restaurant Format 2 $randomSuffix"
    description = "A great test restaurant with amazing food"
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

Write-Host "Request payload:" -ForegroundColor Yellow
if ($Verbose) {
    $foodProviderData2 | ConvertTo-Json -Depth 5
}

try {
    $response2 = Invoke-RestMethod -Uri "$baseUrl/food-providers" -Method POST -Body ($foodProviderData2 | ConvertTo-Json -Depth 5) -Headers $headers
    Write-Host "✅ Success! Food provider created with ID: $($response2._id)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($Verbose -and $_.Exception.Response) {
        $responseStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($responseStream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Red
    }
}

# Third attempt - using minimal data
Write-Host "`nAttempt 3: Using minimal data" -ForegroundColor Magenta
$foodProviderData3 = @{
    name = "Test Restaurant Format 3 $randomSuffix"
    description = "A great test restaurant with amazing food"
    location = $existingCityId
}

Write-Host "Request payload:" -ForegroundColor Yellow
if ($Verbose) {
    $foodProviderData3 | ConvertTo-Json -Depth 5
}

try {
    $response3 = Invoke-RestMethod -Uri "$baseUrl/food-providers" -Method POST -Body ($foodProviderData3 | ConvertTo-Json -Depth 5) -Headers $headers
    Write-Host "✅ Success! Food provider created with ID: $($response3._id)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($Verbose -and $_.Exception.Response) {
        $responseStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($responseStream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Red
    }
}
