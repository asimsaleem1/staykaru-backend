# Debug Password Change
Write-Host "Debugging Password Change..." -ForegroundColor Yellow

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

# Test with admin user
Write-Host "1. Admin login..." -ForegroundColor Cyan
$adminLogin = @{
    email = "assaleemofficial@gmail.com"
    password = "Sarim786"
} | ConvertTo-Json

try {
    $adminResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $adminLogin -ContentType "application/json"
    Write-Host "✅ Admin login successful!" -ForegroundColor Green
    $adminToken = $adminResponse.access_token
    
    # Get admin profile to see current state
    Write-Host "2. Getting admin profile..." -ForegroundColor Cyan
    $headers = @{
        Authorization = "Bearer $adminToken"
    }
    
    $profile = Invoke-RestMethod -Uri "$baseUrl/auth/profile" -Method GET -Headers $headers
    Write-Host "Admin profile retrieved" -ForegroundColor Green
    Write-Host "Has password field in DB: $($profile.user.password -ne $null)" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Admin operations failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nDebugging complete." -ForegroundColor Yellow
