# Simple test script for food provider deletion
$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"
$randomSuffix = Get-Random

# Create food provider user
$registerData = @{
    name = "Delete Test Provider $randomSuffix"
    email = "delete.test.$randomSuffix@test.com"
    password = "Password123!"
    phone = "+1234567890"
    role = "food_provider"
    gender = "male"
}

Write-Host "Creating food provider user..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body ($registerData | ConvertTo-Json) -ContentType "application/json" | Out-Null
    Write-Host "User created successfully" -ForegroundColor Green
} catch {
    Write-Host "Failed to create user: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Login
Write-Host "Logging in..." -ForegroundColor Yellow
$loginData = @{
    email = $registerData.email
    password = $registerData.password
}

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
    $token = $loginResponse.access_token
    Write-Host "Login successful, token received" -ForegroundColor Green
} catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Create food provider
$providerData = @{
    name = "Test Restaurant $randomSuffix"
    description = "Restaurant for delete test"
    cuisine_type = "Test Cuisine"
    location = "646a4aaef90c5295e820c18a"  # Using a valid location ID
    operating_hours = @{
        open = "09:00"
        close = "22:00"
    }
    contact_info = @{
        phone = "+1234567890"
        email = "restaurant.$randomSuffix@test.com"
    }
}

Write-Host "Creating food provider..." -ForegroundColor Yellow
try {
    $provider = Invoke-RestMethod -Uri "$baseUrl/food-providers" -Method POST -Body ($providerData | ConvertTo-Json -Depth 5) -Headers $headers
    $providerId = $provider._id
    Write-Host "Food provider created with ID: $providerId" -ForegroundColor Green
} catch {
    Write-Host "Failed to create food provider: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Verify provider exists
Write-Host "Verifying provider exists..." -ForegroundColor Yellow
try {
    $verifyProvider = Invoke-RestMethod -Uri "$baseUrl/food-providers/$providerId" -Method GET
    Write-Host "Provider exists with name: $($verifyProvider.name)" -ForegroundColor Green
} catch {
    Write-Host "Provider not found: $($_.Exception.Message)" -ForegroundColor Red
}

# Delete provider
Write-Host "Attempting to delete food provider..." -ForegroundColor Yellow
try {
    Write-Host "DELETE request to: $baseUrl/food-providers/$providerId" -ForegroundColor Gray
    Write-Host "Headers: $($headers | ConvertTo-Json)" -ForegroundColor Gray
    
    $deleteResponse = Invoke-RestMethod -Uri "$baseUrl/food-providers/$providerId" -Method DELETE -Headers $headers
    Write-Host "Food provider deleted successfully: $($deleteResponse.message)" -ForegroundColor Green
} catch {
    Write-Host "Failed to delete food provider: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response
        Write-Host "Status code: $($errorResponse.StatusCode)" -ForegroundColor Red
        
        try {
            $reader = New-Object System.IO.StreamReader($errorResponse.GetResponseStream())
            $reader.BaseStream.Position = 0
            $reader.DiscardBufferedData()
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response body: $responseBody" -ForegroundColor Red
        } catch {
            Write-Host "Could not read response body: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Verify deletion
Write-Host "Verifying deletion..." -ForegroundColor Yellow
try {
    $checkProvider = Invoke-RestMethod -Uri "$baseUrl/food-providers/$providerId" -Method GET -ErrorAction SilentlyContinue
    Write-Host "Provider still exists (deletion failed): $($checkProvider.name)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-Host "Provider successfully deleted - confirmed by 404 response" -ForegroundColor Green
    } else {
        Write-Host "Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
