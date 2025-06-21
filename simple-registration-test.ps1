# Simple Registration Debug Test

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

Write-Host "Testing landlord registration..." -ForegroundColor Yellow

$registerData = @{
    name = "Test Landlord"
    email = "simple.test.landlord.$(Get-Random)@test.com"
    password = "Test123!@#"
    phone = "+1234567890"
    role = "landlord"
    gender = "male"
}

Write-Host "Sending registration data:" -ForegroundColor Cyan
$registerData | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body ($registerData | ConvertTo-Json) -ContentType "application/json"
    Write-Host "✅ Registration successful!" -ForegroundColor Green
    $registerResponse | ConvertTo-Json -Depth 2
} catch {
    Write-Host "❌ Registration failed:" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    # Try to get the detailed error message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}
