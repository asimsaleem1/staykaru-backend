$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

Write-Host "Testing Admin Dashboard APIs..." -ForegroundColor Yellow

# Login
$loginData = @{
    email = "assaleemofficial@gmail.com"
    password = "Sarim786"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ Login successful!" -ForegroundColor Green
    
    $token = $loginResponse.token
    $headers = @{
        Authorization = "Bearer $token"
    }
    
    # Test dashboard endpoint
    Write-Host "`nTesting dashboard endpoint..." -ForegroundColor Cyan
    $dashboardResponse = Invoke-RestMethod -Uri "$baseUrl/analytics/dashboard" -Method GET -Headers $headers
    Write-Host "✅ Dashboard endpoint working!" -ForegroundColor Green
    Write-Host "Users: $($dashboardResponse.counts.users)" -ForegroundColor White
    Write-Host "Bookings: $($dashboardResponse.counts.bookings)" -ForegroundColor White
    Write-Host "Orders: $($dashboardResponse.counts.orders)" -ForegroundColor White
    Write-Host "Reviews: $($dashboardResponse.counts.reviews)" -ForegroundColor White
    
    # Test user analytics endpoint
    Write-Host "`nTesting user analytics endpoint..." -ForegroundColor Cyan
    $userAnalyticsResponse = Invoke-RestMethod -Uri "$baseUrl/analytics/users" -Method GET -Headers $headers
    Write-Host "✅ User analytics endpoint working!" -ForegroundColor Green
    Write-Host "Total Users: $($userAnalyticsResponse.totalUsers)" -ForegroundColor White
    
    # Test user management endpoint
    Write-Host "`nTesting user management endpoint..." -ForegroundColor Cyan
    $userCountsResponse = Invoke-RestMethod -Uri "$baseUrl/users/admin/count" -Method GET -Headers $headers
    Write-Host "✅ User counts endpoint working!" -ForegroundColor Green
    Write-Host "Total Users: $($userCountsResponse.total)" -ForegroundColor White
    
    # Test report endpoints
    Write-Host "`nTesting report generation endpoints..." -ForegroundColor Cyan
    $userReportResponse = Invoke-RestMethod -Uri "$baseUrl/analytics/reports/users" -Method GET -Headers $headers
    Write-Host "✅ User report endpoint working!" -ForegroundColor Green
    
    Write-Host "`n🎉 All tests completed successfully!" -ForegroundColor Green
}
catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.Exception.Response -ForegroundColor Red
}
