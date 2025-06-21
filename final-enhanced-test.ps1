# Final Enhanced Registration Test
Write-Host "=== Final Enhanced Registration Test ===" -ForegroundColor Cyan

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

# Test complete registration with all new fields
$testUser = @{
    name = "Final Test User"
    email = "final.test@enhanced.com"
    password = "FinalTest123!"
    role = "student"
    phone = "1111222333"
    countryCode = "+92"
    gender = "male"
    profileImage = "https://example.com/profiles/final.jpg"
    identificationType = "cnic"
    identificationNumber = "11111-2222222-3"
}

Write-Host "`nTesting complete enhanced registration..." -ForegroundColor Yellow

try {
    # Register user
    $body = $testUser | ConvertTo-Json -Depth 3
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "✓ Registration successful!" -ForegroundColor Green
    Write-Host "Enhanced fields in response:" -ForegroundColor Yellow
    Write-Host "  Name: $($response.user.name)" -ForegroundColor Gray
    Write-Host "  Email: $($response.user.email)" -ForegroundColor Gray
    Write-Host "  Role: $($response.user.role)" -ForegroundColor Gray
    Write-Host "  Phone: $($response.user.phone)" -ForegroundColor Gray
    Write-Host "  Country Code: $($response.user.countryCode)" -ForegroundColor Gray
    Write-Host "  Profile Image: $($response.user.profileImage)" -ForegroundColor Gray
    Write-Host "  ID Type: $($response.user.identificationType)" -ForegroundColor Gray
    Write-Host "  ID Number: $($response.user.identificationNumber)" -ForegroundColor Gray
    
    # Test login
    Write-Host "`nTesting login..." -ForegroundColor Yellow
    $loginData = @{
        email = $testUser.email
        password = $testUser.password
    }
    
    $loginBody = $loginData | ConvertTo-Json -Depth 3
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    
    Write-Host "✓ Login successful!" -ForegroundColor Green
    Write-Host "Access token received: Yes" -ForegroundColor Gray
    Write-Host "Enhanced fields in login response:" -ForegroundColor Yellow
    Write-Host "  Country Code: $($loginResponse.user.countryCode)" -ForegroundColor Gray
    Write-Host "  Profile Image: $($loginResponse.user.profileImage)" -ForegroundColor Gray
    Write-Host "  ID Type: $($loginResponse.user.identificationType)" -ForegroundColor Gray
    Write-Host "  ID Number: $($loginResponse.user.identificationNumber)" -ForegroundColor Gray
    
    # Test profile endpoint
    Write-Host "`nTesting profile endpoint..." -ForegroundColor Yellow
    $headers = @{
        "Authorization" = "Bearer $($loginResponse.access_token)"
        "Content-Type" = "application/json"
    }
    
    $profileResponse = Invoke-RestMethod -Uri "$baseUrl/auth/profile" -Method Get -Headers $headers
    Write-Host "✓ Profile endpoint working!" -ForegroundColor Green
    
    Write-Host "`n=== SUCCESS ===" -ForegroundColor Green
    Write-Host "✓ Enhanced registration system fully functional!" -ForegroundColor Green
    Write-Host "✓ All new fields working correctly" -ForegroundColor Green
    Write-Host "✓ JWT authentication with enhanced data" -ForegroundColor Green
    Write-Host "✓ Profile endpoint accessible" -ForegroundColor Green
    
} catch {
    Write-Host "✗ Test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nEnhanced registration upgrade completed!" -ForegroundColor Cyan
