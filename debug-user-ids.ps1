# Debug script to check user IDs and food provider ownership
$baseUrl = "https://staykaru-backend-77d822917a02.herokuapp.com/api"

Write-Host "=== DEBUG USER IDS AND OWNERSHIP ===" -ForegroundColor Cyan
Write-Host "Testing user ID formats and food provider ownership..." -ForegroundColor Yellow

try {
    # Register and login
    Write-Host "`n1. REGISTER AND LOGIN" -ForegroundColor Green
    $registerData = @{
        name = "Debug User $(Get-Random)"
        email = "debug.user.$(Get-Random)@test.com"
        password = "TestPassword123!"
        confirmPassword = "TestPassword123!"
        role = "food_provider"
        phone = "+1234567890"
        gender = "male"
    } | ConvertTo-Json -Depth 3

    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $registerData -ContentType "application/json"
    Write-Host "Registered user: $($registerResponse.user._id)" -ForegroundColor White

    $loginData = @{
        email = ($registerData | ConvertFrom-Json).email
        password = "TestPassword123!"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginData -ContentType "application/json"
    $token = $loginResponse.access_token
    $userId = $loginResponse.user._id
    Write-Host "Logged in user ID: $userId" -ForegroundColor White
    
    $headers = @{
        'Authorization' = "Bearer $token"
        'Content-Type' = 'application/json'
    }

    # Get all cities
    Write-Host "`n2. GET CITIES" -ForegroundColor Green
    $cities = Invoke-RestMethod -Uri "$baseUrl/location/cities" -Method Get
    $cityId = $cities[0]._id
    Write-Host "Using city ID: $cityId" -ForegroundColor White

    # Create food provider
    Write-Host "`n3. CREATE FOOD PROVIDER" -ForegroundColor Green
    $providerData = @{
        name = "Debug Provider $(Get-Random)"
        description = "A test restaurant for debugging"
        location = $cityId
        cuisine_type = "International"
    } | ConvertTo-Json

    $providerResponse = Invoke-RestMethod -Uri "$baseUrl/food-provider" -Method Post -Body $providerData -ContentType "application/json" -Headers $headers
    $providerId = $providerResponse._id
    Write-Host "Created provider ID: $providerId" -ForegroundColor White
    Write-Host "Provider owner ID: $($providerResponse.owner._id)" -ForegroundColor White
    Write-Host "Current user ID: $userId" -ForegroundColor White
    Write-Host "IDs match: $($providerResponse.owner._id -eq $userId)" -ForegroundColor White

    # Try to update the provider
    Write-Host "`n4. TRY TO UPDATE PROVIDER" -ForegroundColor Green
    $updateData = @{
        name = "Updated Debug Provider"
        description = "Updated description"
    } | ConvertTo-Json

    try {
        $updateResponse = Invoke-RestMethod -Uri "$baseUrl/food-provider/$providerId" -Method Put -Body $updateData -ContentType "application/json" -Headers $headers
        Write-Host "âœ… Update succeeded" -ForegroundColor Green
    } catch {
        Write-Host "âŒ Update failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "Error details: $errorBody" -ForegroundColor Yellow
        }
    }

    # Try to delete the provider
    Write-Host "`n5. TRY TO DELETE PROVIDER" -ForegroundColor Green
    try {
        $deleteResponse = Invoke-RestMethod -Uri "$baseUrl/food-provider/$providerId" -Method Delete -Headers $headers
        Write-Host "âœ… Delete succeeded" -ForegroundColor Green
    } catch {
        Write-Host "âŒ Delete failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "Error details: $errorBody" -ForegroundColor Yellow
        }
    }

} catch {
    Write-Host "âŒ Script failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error details: $errorBody" -ForegroundColor Yellow
    }
}

Write-Host "`n=== DEBUG COMPLETED ===" -ForegroundColor Cyan
