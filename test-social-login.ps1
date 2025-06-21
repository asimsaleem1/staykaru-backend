# Social Login Test Script

# Test the social login endpoints with real OAuth tokens
# Replace the token and test with your actual OAuth tokens

$baseUrl = "http://localhost:3000"

# Test Google Social Login
Write-Host "Testing Google Social Login..." -ForegroundColor Green

$googleLoginData = @{
    provider = "google"
    token = "YOUR_GOOGLE_ID_TOKEN_HERE"
    role = "student"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/social-login" -Method POST -Body $googleLoginData -ContentType "application/json"
    Write-Host "Google Login Success:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "Google Login Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host "`n" + "="*50 + "`n"

# Test Facebook Social Login
Write-Host "Testing Facebook Social Login..." -ForegroundColor Green

$facebookLoginData = @{
    provider = "facebook"
    token = "YOUR_FACEBOOK_ACCESS_TOKEN_HERE"
    role = "landlord"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/social-login" -Method POST -Body $facebookLoginData -ContentType "application/json"
    Write-Host "Facebook Login Success:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "Facebook Login Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host "`n" + "="*50 + "`n"

# Test Registration Completion
Write-Host "Testing Student Registration Completion..." -ForegroundColor Green

$registrationData = @{
    university = "Test University"
    studentId = "STU123456"
    phone = "1234567890"
    countryCode = "+1"
    gender = "male"
    program = "Computer Science"
    yearOfStudy = "3"
} | ConvertTo-Json

# Note: You'll need to get the JWT token from the login response above
$jwtToken = "YOUR_JWT_TOKEN_FROM_LOGIN_RESPONSE"

$headers = @{
    "Authorization" = "Bearer $jwtToken"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/complete-student-registration" -Method POST -Body $registrationData -Headers $headers
    Write-Host "Registration Completion Success:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "Registration Completion Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host "`n" + "="*50 + "`n"
Write-Host "Test completed!" -ForegroundColor Yellow
Write-Host "Remember to:" -ForegroundColor Yellow
Write-Host "1. Replace YOUR_GOOGLE_ID_TOKEN_HERE with actual Google ID token" -ForegroundColor Yellow
Write-Host "2. Replace YOUR_FACEBOOK_ACCESS_TOKEN_HERE with actual Facebook access token" -ForegroundColor Yellow
Write-Host "3. Replace YOUR_JWT_TOKEN_FROM_LOGIN_RESPONSE with JWT from login response" -ForegroundColor Yellow
Write-Host "4. Configure your .env file with OAuth credentials" -ForegroundColor Yellow
