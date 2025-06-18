# Test Admin Password After Change
Write-Host "Testing Admin Password After Change..." -ForegroundColor Yellow

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

# Test if admin can still login with original password
Write-Host "1. Testing original admin password..." -ForegroundColor Cyan
$originalLogin = @{
    email = "assaleemofficial@gmail.com"
    password = "Sarim786"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $originalLogin -ContentType "application/json"
    Write-Host "✅ Original password still works!" -ForegroundColor Green
    Write-Host "User role: $($response.user.role)" -ForegroundColor Green
} catch {
    Write-Host "❌ Original password no longer works: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest complete." -ForegroundColor Yellow
