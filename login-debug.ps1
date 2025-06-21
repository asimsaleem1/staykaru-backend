# Login Response Debug

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

$registerData = @{
    name = "Login Debug"
    email = "login.debug.$(Get-Random)@test.com"
    password = "Test123!@#"
    phone = "+1234567890"
    role = "landlord"
    gender = "male"
}

Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body ($registerData | ConvertTo-Json) -ContentType "application/json" | Out-Null

$loginData = @{
    email = $registerData.email
    password = $registerData.password
}

Write-Host "Login response:" -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
$loginResponse | ConvertTo-Json -Depth 3

Write-Host "`nToken field names:" -ForegroundColor Yellow
$loginResponse.PSObject.Properties | ForEach-Object { 
    Write-Host "- $($_.Name): $($_.Value)" -ForegroundColor Cyan 
}
