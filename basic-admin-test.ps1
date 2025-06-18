$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

# Login as admin
$loginData = @{
    email = "assaleemofficial@gmail.com"
    password = "Sarim786"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json"
$token = $loginResponse.access_token
$headers = @{
    Authorization = "Bearer $token"
}

Write-Host "Admin login successful!" -ForegroundColor Green

# Test dashboard endpoint
$dashboardResponse = Invoke-RestMethod -Uri "$baseUrl/analytics/dashboard" -Method GET -Headers $headers
Write-Host "Dashboard endpoint working!" -ForegroundColor Green
Write-Host "Users: $($dashboardResponse.counts.users)" -ForegroundColor White
Write-Host "Bookings: $($dashboardResponse.counts.bookings)" -ForegroundColor White
Write-Host "Orders: $($dashboardResponse.counts.orders)" -ForegroundColor White
Write-Host "Reviews: $($dashboardResponse.counts.reviews)" -ForegroundColor White

# Test user analytics endpoint
$userAnalyticsResponse = Invoke-RestMethod -Uri "$baseUrl/analytics/users" -Method GET -Headers $headers
Write-Host "User analytics endpoint working!" -ForegroundColor Green
Write-Host "Total Users: $($userAnalyticsResponse.totalUsers)" -ForegroundColor White

# Test review analytics endpoint
$reviewAnalyticsResponse = Invoke-RestMethod -Uri "$baseUrl/analytics/reviews" -Method GET -Headers $headers
Write-Host "Review analytics endpoint working!" -ForegroundColor Green
Write-Host "Total Reviews: $($reviewAnalyticsResponse.totalReviews)" -ForegroundColor White

# Test user management endpoints
$userCountsResponse = Invoke-RestMethod -Uri "$baseUrl/users/admin/count" -Method GET -Headers $headers
Write-Host "User counts endpoint working!" -ForegroundColor Green
Write-Host "Total Users: $($userCountsResponse.total)" -ForegroundColor White

# Test reports endpoints
$userReportResponse = Invoke-RestMethod -Uri "$baseUrl/analytics/reports/users" -Method GET -Headers $headers
Write-Host "User report endpoint working!" -ForegroundColor Green

Write-Host "All admin dashboard endpoints are working successfully!" -ForegroundColor Green
