# Simple Admin Login Test
# Tests the specific admin credentials: assaleemofficial@gmail.com / Sarim786

Write-Host "=== StayKaru Admin Login Test ===" -ForegroundColor Yellow
Write-Host "Testing admin access for: assaleemofficial@gmail.com" -ForegroundColor Cyan

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

# Admin login test
$adminLoginData = @{
    email = "assaleemofficial@gmail.com"
    password = "Sarim786"
} | ConvertTo-Json

Write-Host "`nAttempting admin login..." -ForegroundColor White

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $adminLoginData -ContentType "application/json"
    
    Write-Host "✅ SUCCESS: Admin login approved!" -ForegroundColor Green
    Write-Host "Admin User ID: $($response.user.id)" -ForegroundColor Gray
    Write-Host "Admin Name: $($response.user.name)" -ForegroundColor Gray
    Write-Host "Admin Email: $($response.user.email)" -ForegroundColor Gray
    Write-Host "Access Token: $($response.access_token.Substring(0,50))..." -ForegroundColor Gray
    
    Write-Host "`n🎉 Admin access granted successfully!" -ForegroundColor Green
    Write-Host "You can now access admin features with this email/password combination." -ForegroundColor Green
    
} catch {
    Write-Host "❌ FAILED: Admin login denied!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Yellow
