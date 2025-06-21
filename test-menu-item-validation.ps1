# Test script to debug menu item validation issues
param(
    [string]$BaseUrl = "http://localhost:3000"
)

Write-Host "Testing Menu Item Validation Issues..." -ForegroundColor Yellow

# Register and login to get token
$registerData = @{
    name = "Test User Menu 587293"
    email = "test.menu.587293@test.com"
    password = "password123"
    role = "food_provider"
    phone = "+1234567890"
    gender = "male"
}

Write-Host "Registering user..." -ForegroundColor Green
try {
    $registerResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/register" -Method POST -Body ($registerData | ConvertTo-Json) -ContentType "application/json"
    Write-Host "Registration successful" -ForegroundColor Green
} catch {
    Write-Host "Registration may have failed (user might already exist), continuing..." -ForegroundColor Yellow
}

Write-Host "Logging in to get token..." -ForegroundColor Green
$loginData = @{
    email = "test.menu.587293@test.com"
    password = "password123"
}
$loginResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
$token = $loginResponse.access_token

$headers = @{
    'Authorization' = "Bearer $token"
    'Content-Type' = 'application/json'
}

Write-Host "Creating food provider..." -ForegroundColor Green
$foodProviderData = @{
    name = "Test Food Provider"
    description = "Test food provider for menu validation"
    location = "683700350f8a15197d2abf4f"
    cuisine = "Indian"
    phone = "+1234567890"
    email = "test@foodprovider.com"
    address = "123 Test St"
}

$foodProviderResponse = Invoke-RestMethod -Uri "$BaseUrl/food-providers" -Method POST -Body ($foodProviderData | ConvertTo-Json) -Headers $headers
$providerId = $foodProviderResponse._id
Write-Host "Created food provider with ID: $providerId" -ForegroundColor Cyan

Write-Host "`nTesting menu item with missing fields..." -ForegroundColor Yellow

# Test 1: Menu item with missing fields (should return 400 Bad Request)
$invalidMenuItemData = @{
    # Missing name and price
    description = "Test description"
    provider = $providerId
}

try {
    Write-Host "Testing invalid menu item creation (missing name and price)..." -ForegroundColor Green
    $menuResponse = Invoke-RestMethod -Uri "$BaseUrl/menu-items" -Method POST -Body ($invalidMenuItemData | ConvertTo-Json) -Headers $headers
    Write-Host "[FAIL] Expected 400 error but got successful response: $($menuResponse | ConvertTo-Json)" -ForegroundColor Red
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorResponse = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($errorResponse)
    $errorContent = $reader.ReadToEnd()
    
    Write-Host "Status Code: $statusCode" -ForegroundColor Cyan
    Write-Host "Error Response: $errorContent" -ForegroundColor Cyan
    
    if ($statusCode -eq 400) {
        Write-Host "[PASS] Correctly returned 400 Bad Request for missing fields" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Expected 400 but got $statusCode" -ForegroundColor Red
    }
}

# Test 2: Menu item with only missing name
$invalidMenuItemData2 = @{
    price = 15.99
    description = "Test description"
    provider = $providerId
}

try {
    Write-Host "`nTesting invalid menu item creation (missing name)..." -ForegroundColor Green
    $menuResponse = Invoke-RestMethod -Uri "$BaseUrl/menu-items" -Method POST -Body ($invalidMenuItemData2 | ConvertTo-Json) -Headers $headers
    Write-Host "[FAIL] Expected 400 error but got successful response: $($menuResponse | ConvertTo-Json)" -ForegroundColor Red
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorResponse = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($errorResponse)
    $errorContent = $reader.ReadToEnd()
    
    Write-Host "Status Code: $statusCode" -ForegroundColor Cyan
    Write-Host "Error Response: $errorContent" -ForegroundColor Cyan
    
    if ($statusCode -eq 400) {
        Write-Host "[PASS] Correctly returned 400 Bad Request for missing name" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Expected 400 but got $statusCode" -ForegroundColor Red
    }
}

# Test 3: Valid menu item (should succeed)
$validMenuItemData = @{
    name = "Test Menu Item"
    price = 15.99
    description = "Test description"
    provider = $providerId
}

try {
    Write-Host "`nTesting valid menu item creation..." -ForegroundColor Green
    $menuResponse = Invoke-RestMethod -Uri "$BaseUrl/menu-items" -Method POST -Body ($validMenuItemData | ConvertTo-Json) -Headers $headers
    Write-Host "[PASS] Successfully created valid menu item: $($menuResponse._id)" -ForegroundColor Green
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorResponse = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($errorResponse)
    $errorContent = $reader.ReadToEnd()
    
    Write-Host "[FAIL] Valid menu item creation failed:" -ForegroundColor Red
    Write-Host "Status Code: $statusCode" -ForegroundColor Red
    Write-Host "Error Response: $errorContent" -ForegroundColor Red
}

Write-Host "`nMenu item validation test complete." -ForegroundColor Yellow
