$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

Write-Host "🔍 Testing Admin Dashboard APIs..." -ForegroundColor Yellow

# Login as admin to get token
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body (@{
    email = "assaleemofficial@gmail.com"
    password = "Sarim786"
} | ConvertTo-Json) -ContentType "application/json"

$token = $loginResponse.token
$headers = @{
    Authorization = "Bearer $token"
}

# Test dashboard summary
try {
    Write-Host "📊 Testing Dashboard Summary..." -ForegroundColor Cyan
    $dashboardResponse = Invoke-RestMethod -Uri "$baseUrl/analytics/dashboard" -Method GET -Headers $headers
    Write-Host "✅ Dashboard Summary endpoint working!" -ForegroundColor Green
    Write-Host "   Total Users: $($dashboardResponse.counts.users)" -ForegroundColor Green
    Write-Host "   Total Bookings: $($dashboardResponse.counts.bookings)" -ForegroundColor Green
    Write-Host "   Total Orders: $($dashboardResponse.counts.orders)" -ForegroundColor Green
    Write-Host "   Total Reviews: $($dashboardResponse.counts.reviews)" -ForegroundColor Green
    Write-Host "   Total Revenue: $($dashboardResponse.counts.revenue)" -ForegroundColor Green
} catch {
    Write-Host "❌ Dashboard Summary endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test user analytics
try {
    Write-Host "👤 Testing User Analytics..." -ForegroundColor Cyan
    $userAnalyticsResponse = Invoke-RestMethod -Uri "$baseUrl/analytics/users" -Method GET -Headers $headers
    Write-Host "✅ User Analytics endpoint working!" -ForegroundColor Green
    Write-Host "   Total Users: $($userAnalyticsResponse.totalUsers)" -ForegroundColor Green
    
    # Display user counts by role
    foreach ($roleData in $userAnalyticsResponse.usersByRole) {
        Write-Host "   $($roleData.role): $($roleData.count)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ User Analytics endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test user management
try {
    Write-Host "🔧 Testing User Management..." -ForegroundColor Cyan
    $userCountsResponse = Invoke-RestMethod -Uri "$baseUrl/users/admin/count" -Method GET -Headers $headers
    Write-Host "✅ User Counts endpoint working!" -ForegroundColor Green
    Write-Host "   Total Users: $($userCountsResponse.total)" -ForegroundColor Green
    Write-Host "   Students: $($userCountsResponse.byRole.student)" -ForegroundColor Green
    Write-Host "   Landlords: $($userCountsResponse.byRole.landlord)" -ForegroundColor Green
    Write-Host "   Food Providers: $($userCountsResponse.byRole.food_provider)" -ForegroundColor Green
    Write-Host "   Admins: $($userCountsResponse.byRole.admin)" -ForegroundColor Green
} catch {
    Write-Host "❌ User Counts endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test booking analytics
try {
    Write-Host "🏠 Testing Booking Analytics..." -ForegroundColor Cyan
    $bookingAnalyticsResponse = Invoke-RestMethod -Uri "$baseUrl/analytics/bookings?days=30" -Method GET -Headers $headers
    Write-Host "✅ Booking Analytics endpoint working!" -ForegroundColor Green
} catch {
    Write-Host "❌ Booking Analytics endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test report generation
try {
    Write-Host "📃 Testing Report Generation..." -ForegroundColor Cyan
    $userReportResponse = Invoke-RestMethod -Uri "$baseUrl/analytics/reports/users" -Method GET -Headers $headers
    Write-Host "✅ User Report endpoint working!" -ForegroundColor Green
    Write-Host "   Generated At: $($userReportResponse.generatedAt)" -ForegroundColor Green
    Write-Host "   Total Users in Report: $($userReportResponse.stats.total)" -ForegroundColor Green
} catch {
    Write-Host "❌ User Report endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test revenue report
try {
    Write-Host "💰 Testing Revenue Report..." -ForegroundColor Cyan
    $revenueReportResponse = Invoke-RestMethod -Uri "$baseUrl/analytics/reports/revenue?days=90" -Method GET -Headers $headers
    Write-Host "✅ Revenue Report endpoint working!" -ForegroundColor Green
    Write-Host "   Total Revenue: $($revenueReportResponse.summary.totalRevenue)" -ForegroundColor Green
    Write-Host "   Number of Payments: $($revenueReportResponse.summary.numberOfPayments)" -ForegroundColor Green
} catch {
    Write-Host "❌ Revenue Report endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ Admin Dashboard Testing Complete!" -ForegroundColor Green
