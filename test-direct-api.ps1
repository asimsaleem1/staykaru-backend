# Direct API test to check what's stored
Write-Host "Direct API Test..." -ForegroundColor Yellow

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

# Get users endpoint to see actual data (if available)
Write-Host "1. Testing users endpoint..." -ForegroundColor Cyan

try {
    $usersResponse = Invoke-RestMethod -Uri "$baseUrl/users" -Method GET
    Write-Host "✅ Users endpoint accessible" -ForegroundColor Green
    
    # Look for our test users
    $testUsers = $usersResponse | Where-Object { $_.email -like "*debug*" -or $_.email -like "*pwtest*" }
    
    if ($testUsers) {
        Write-Host "Found test users:" -ForegroundColor Green
        foreach ($user in $testUsers) {
            Write-Host "  Email: $($user.email)" -ForegroundColor Gray
            Write-Host "  Password field present: $($user.password -ne $null)" -ForegroundColor Gray
            if ($user.password) {
                Write-Host "  Password starts with: $($user.password.Substring(0, [Math]::Min(10, $user.password.Length)))..." -ForegroundColor Gray
            }
            Write-Host "" -ForegroundColor Gray
        }
    } else {
        Write-Host "No test users found" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Users endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest complete." -ForegroundColor Yellow
