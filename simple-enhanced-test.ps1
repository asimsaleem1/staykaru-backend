# Enhanced Registration Test - Simple Version
Write-Host "=== Enhanced Registration Test ===" -ForegroundColor Cyan

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

# Test data with all new fields
$testUser = @{
    name = "Enhanced Test User"
    email = "enhanced.test@example.com"
    password = "password123"
    role = "student"
    phone = "1234567890"
    countryCode = "+92"
    gender = "male"
    profileImage = "https://example.com/profiles/test.jpg"
    identificationType = "cnic"
    identificationNumber = "12345-6789012-3"
}

Write-Host "`nTesting enhanced registration..." -ForegroundColor Yellow

try {
    $body = $testUser | ConvertTo-Json -Depth 3
    Write-Host "Request body:" -ForegroundColor Gray
    Write-Host $body -ForegroundColor Gray
    
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "`n✓ Registration successful!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Gray
    Write-Host ($response | ConvertTo-Json -Depth 3) -ForegroundColor Gray
    
    # Test login
    Write-Host "`nTesting login..." -ForegroundColor Yellow
    $loginData = @{
        email = $testUser.email
        password = $testUser.password
    }
    
    $loginBody = $loginData | ConvertTo-Json -Depth 3
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    
    Write-Host "✓ Login successful!" -ForegroundColor Green
    Write-Host "Login response:" -ForegroundColor Gray
    Write-Host ($loginResponse | ConvertTo-Json -Depth 3) -ForegroundColor Gray
    
} catch {
    Write-Host "✗ Test failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $errorContent = $reader.ReadToEnd()
            Write-Host "Error details: $errorContent" -ForegroundColor Red
        } catch {
            Write-Host "Could not read error details" -ForegroundColor Red
        }
    }
}

Write-Host "`nTest completed." -ForegroundColor Cyan
