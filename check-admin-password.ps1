# Check Admin User Password
Write-Host "=== Checking Admin User Password ===" -ForegroundColor Yellow

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

# Login to get user profile
Write-Host "`n1. Getting admin user profile..." -ForegroundColor Cyan

$loginData = @{
    email = "assaleemofficial@gmail.com"
    password = "Sarim786"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ Login successful!" -ForegroundColor Green
    
    $profileResponse = Invoke-RestMethod -Uri "$baseUrl/auth/profile" -Method GET -Headers @{Authorization = "Bearer $($loginResponse.access_token)"}
    Write-Host "User Profile:" -ForegroundColor White
    Write-Host ($profileResponse.user | ConvertTo-Json -Depth 3) -ForegroundColor Gray
    
    Write-Host "`nUser ID: $($profileResponse.user._id)" -ForegroundColor Cyan
    Write-Host "Password field exists: $($null -ne $profileResponse.user.password)" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Check Complete ===" -ForegroundColor Yellow
