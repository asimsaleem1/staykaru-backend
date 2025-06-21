Write-Host "=== Enhanced Registration Test ===" -ForegroundColor Cyan

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

$testUser = @{
    name = "Enhanced Test"
    email = "enhance@test.com"  
    password = "Test123!"
    role = "student"
    phone = "1234567890"
    countryCode = "+92"
    gender = "male"
    profileImage = "https://example.com/test.jpg"
    identificationType = "cnic"
    identificationNumber = "12345-6789012-3"
}

Write-Host "Testing enhanced registration..." -ForegroundColor Yellow

$body = $testUser | ConvertTo-Json -Depth 3
$response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $body -ContentType "application/json"

Write-Host "Registration successful!" -ForegroundColor Green
Write-Host "Response:" -ForegroundColor Gray
Write-Host ($response | ConvertTo-Json -Depth 3) -ForegroundColor Gray

$loginData = @{
    email = $testUser.email
    password = $testUser.password
}

Write-Host "Testing login..." -ForegroundColor Yellow
$loginBody = $loginData | ConvertTo-Json -Depth 3
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"

Write-Host "Login successful!" -ForegroundColor Green
Write-Host "Login response:" -ForegroundColor Gray
Write-Host ($loginResponse | ConvertTo-Json -Depth 3) -ForegroundColor Gray

Write-Host "Enhanced registration upgrade completed!" -ForegroundColor Cyan
