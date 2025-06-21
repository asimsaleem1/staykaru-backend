# Test Profile Endpoints
param(
    [string]$BaseUrl = "http://localhost:3000"
)

Write-Host "=== TESTING PROFILE ENDPOINTS ===" -ForegroundColor Yellow

# Test data
$randomSuffix = Get-Random -Minimum 100000 -Maximum 999999
$testUser = @{
    name = "Profile Test User $randomSuffix"
    email = "profile.test.$randomSuffix@test.com"
    password = "SecurePass123!"
    role = "food_provider"
    phone = "+1234567890"
    gender = "male"
}

try {
    # Register and login
    Write-Host "1. Registering and logging in..." -ForegroundColor Cyan
    Invoke-RestMethod -Uri "$BaseUrl/auth/register" -Method POST -Body ($testUser | ConvertTo-Json) -ContentType "application/json" | Out-Null
    
    $loginData = @{ email = $testUser.email; password = $testUser.password }
    $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
    
    $headers = @{
        "Authorization" = "Bearer $($loginResponse.access_token)"
        "Content-Type" = "application/json"
    }
    
    # Test food provider profile endpoint
    Write-Host "2. Testing food provider profile endpoint..." -ForegroundColor Cyan
    try {
        $fpProfile = Invoke-RestMethod -Uri "$BaseUrl/users/food-provider/profile" -Method GET -Headers $headers
        Write-Host "✅ Food provider profile: SUCCESS" -ForegroundColor Green
        Write-Host "Profile data: $($fpProfile | ConvertTo-Json -Depth 2)" -ForegroundColor White
    } catch {
        Write-Host "❌ Food provider profile: FAILED - $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test general profile endpoint
    Write-Host "3. Testing general profile endpoint..." -ForegroundColor Cyan
    try {
        $generalProfile = Invoke-RestMethod -Uri "$BaseUrl/users/profile" -Method GET -Headers $headers
        Write-Host "✅ General profile: SUCCESS" -ForegroundColor Green
        Write-Host "Profile data: $($generalProfile | ConvertTo-Json -Depth 2)" -ForegroundColor White
    } catch {
        Write-Host "❌ General profile: FAILED - $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response body: $responseBody" -ForegroundColor Red
        }
    }
    
    # Test profile update
    Write-Host "4. Testing profile update..." -ForegroundColor Cyan
    $updateData = @{
        name = "Updated Profile Test User $randomSuffix"
        phone = "+9876543210"
    }
    
    try {
        $updateResult = Invoke-RestMethod -Uri "$BaseUrl/users/profile" -Method PUT -Body ($updateData | ConvertTo-Json) -Headers $headers
        Write-Host "✅ Profile update: SUCCESS" -ForegroundColor Green
        Write-Host "Update result: $($updateResult | ConvertTo-Json -Depth 2)" -ForegroundColor White
    } catch {
        Write-Host "❌ Profile update: FAILED - $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response body: $responseBody" -ForegroundColor Red
        }
    }
    
} catch {
    Write-Host "❌ Test setup failed: $($_.Exception.Message)" -ForegroundColor Red
}
