# Debug script to test booking and order creation with detailed error info
param(
    [string]$BaseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com/api"
)

function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    try {
        $response = if ($Body) {
            Invoke-RestMethod -Uri $Url -Method $Method -Headers $Headers -Body $Body -ContentType "application/json"
        } else {
            Invoke-RestMethod -Uri $Url -Method $Method -Headers $Headers
        }
        return @{
            Success = $true
            Data = $response
            StatusCode = 200
        }
    } catch {
        $errorResponse = $_.Exception.Response
        $errorBody = ""
        if ($errorResponse) {
            $stream = $errorResponse.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $errorBody = $reader.ReadToEnd()
        }
        return @{
            Success = $false
            StatusCode = $errorResponse.StatusCode
            Error = $_.Exception.Message
            ErrorBody = $errorBody
        }
    }
}

Write-Host "DEBUGGING BOOKING AND ORDER CREATION ENDPOINTS" -ForegroundColor Cyan
Write-Host "=" * 50

# Step 1: Register test user
Write-Host "`n1. Registering test user..." -ForegroundColor Yellow
$registerData = @{
    name = "Debug Test User"
    email = "debug.test.$(Get-Random)@example.com"
    password = "DebugPass123!"
    role = "student"
    phone = "1234567890"
    countryCode = "+1"
    gender = "male"
    dateOfBirth = "1998-05-15"
    address = "123 Debug Ave"
    university = "Debug University"
    studentId = "DEBUG123"
    emergencyContact = @{
        name = "Debug Parent"
        phone = "9876543210"
        relationship = "parent"
    }
} | ConvertTo-Json

$registerResult = Test-Endpoint -Url "$BaseUrl/auth/register" -Method "POST" -Body $registerData
if (-not $registerResult.Success) {
    Write-Host "Registration failed: $($registerResult.Error)" -ForegroundColor Red
    Write-Host "Error body: $($registerResult.ErrorBody)" -ForegroundColor Red
    exit 1
}

$token = $registerResult.Data.access_token
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "✅ User registered successfully" -ForegroundColor Green

# Step 2: Get accommodations to find a valid ID
Write-Host "`n2. Getting accommodations..." -ForegroundColor Yellow
$accommodationsResult = Test-Endpoint -Url "$BaseUrl/accommodations" -Headers $headers
if (-not $accommodationsResult.Success) {
    Write-Host "Failed to get accommodations: $($accommodationsResult.Error)" -ForegroundColor Red
    exit 1
}

$accommodationId = if ($accommodationsResult.Data[0]._id) { $accommodationsResult.Data[0]._id } else { $accommodationsResult.Data[0].id }
Write-Host "✅ Found accommodation ID: $accommodationId" -ForegroundColor Green

# Step 3: Test booking creation with detailed error info
Write-Host "`n3. Testing booking creation..." -ForegroundColor Yellow
$bookingData = @{
    accommodation = $accommodationId
    payment_method = "card"
    total_amount = 500
    start_date = "2025-06-01T00:00:00.000Z"
    end_date = "2025-06-02T00:00:00.000Z"
    special_requests = "Test booking request"
    guests = 2
} | ConvertTo-Json

Write-Host "Booking payload:" -ForegroundColor Gray
Write-Host $bookingData -ForegroundColor Gray

$bookingResult = Test-Endpoint -Url "$BaseUrl/bookings" -Method "POST" -Headers $headers -Body $bookingData
if ($bookingResult.Success) {
    Write-Host "✅ Booking created successfully!" -ForegroundColor Green
    Write-Host "Booking ID: $($bookingResult.Data.id)" -ForegroundColor Green
} else {
    Write-Host "❌ Booking creation failed" -ForegroundColor Red
    Write-Host "Status Code: $($bookingResult.StatusCode)" -ForegroundColor Red
    Write-Host "Error: $($bookingResult.Error)" -ForegroundColor Red
    Write-Host "Error Body: $($bookingResult.ErrorBody)" -ForegroundColor Red
}

# Step 4: Get food providers to find a valid ID
Write-Host "`n4. Getting food providers..." -ForegroundColor Yellow
$foodProvidersResult = Test-Endpoint -Url "$BaseUrl/food-providers" -Headers $headers
if (-not $foodProvidersResult.Success) {
    Write-Host "Failed to get food providers: $($foodProvidersResult.Error)" -ForegroundColor Red
    exit 1
}

$foodProviderId = if ($foodProvidersResult.Data[0]._id) { $foodProvidersResult.Data[0]._id } else { $foodProvidersResult.Data[0].id }
Write-Host "✅ Found food provider ID: $foodProviderId" -ForegroundColor Green

# Step 5: Test order creation with detailed error info
Write-Host "`n5. Testing order creation..." -ForegroundColor Yellow
$orderData = @{
    food_provider = $foodProviderId
    total_amount = 42.48
    items = @(
        @{
            menu_item = "68371dfe492f35a187f47446"  # Get a valid menu item from menu items response
            quantity = 2
            special_instructions = "Extra spicy"
        }
    )
    delivery_location = @{
        coordinates = @{
            latitude = 12.9716
            longitude = 77.5946
        }
        address = "123 University Ave, Room 123"
        landmark = "Near Test Landmark"
    }
    delivery_instructions = "Call when you arrive"
} | ConvertTo-Json -Depth 4

Write-Host "Order payload:" -ForegroundColor Gray
Write-Host $orderData -ForegroundColor Gray

$orderResult = Test-Endpoint -Url "$BaseUrl/orders" -Method "POST" -Headers $headers -Body $orderData
if ($orderResult.Success) {
    Write-Host "✅ Order created successfully!" -ForegroundColor Green
    Write-Host "Order ID: $($orderResult.Data.id)" -ForegroundColor Green
} else {
    Write-Host "❌ Order creation failed" -ForegroundColor Red
    Write-Host "Status Code: $($orderResult.StatusCode)" -ForegroundColor Red
    Write-Host "Error: $($orderResult.Error)" -ForegroundColor Red
    Write-Host "Error Body: $($orderResult.ErrorBody)" -ForegroundColor Red
}

Write-Host "`n" + "=" * 50
Write-Host "DEBUG COMPLETE" -ForegroundColor Cyan
