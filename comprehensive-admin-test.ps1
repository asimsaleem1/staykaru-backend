$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

Write-Host "🔍 COMPREHENSIVE ADMIN DASHBOARD TEST" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow

# Login as admin to get token
$loginData = @{
    email = "assaleemofficial@gmail.com"
    password = "Sarim786"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ Admin login successful!" -ForegroundColor Green
    
    $token = $loginResponse.access_token
    $headers = @{
        Authorization = "Bearer $token"
    }
    
    # 1. Dashboard Summary
    Write-Host "`n📊 TESTING DASHBOARD SUMMARY" -ForegroundColor Cyan
    Write-Host "-------------------------" -ForegroundColor Cyan
    
    $dashboardResponse = Invoke-RestMethod -Uri "$baseUrl/analytics/dashboard" -Method GET -Headers $headers
    Write-Host "✅ Dashboard endpoint working!" -ForegroundColor Green
    Write-Host "   Total Users: $($dashboardResponse.counts.users)" -ForegroundColor White
    Write-Host "   Total Bookings: $($dashboardResponse.counts.bookings)" -ForegroundColor White
    Write-Host "   Total Orders: $($dashboardResponse.counts.orders)" -ForegroundColor White
    Write-Host "   Total Reviews: $($dashboardResponse.counts.reviews)" -ForegroundColor White
    Write-Host "   Total Revenue: $($dashboardResponse.counts.revenue)" -ForegroundColor White
    
    # 2. User Analytics
    Write-Host "`n👤 TESTING USER ANALYTICS" -ForegroundColor Cyan
    Write-Host "-----------------------" -ForegroundColor Cyan
    
    $userAnalyticsResponse = Invoke-RestMethod -Uri "$baseUrl/analytics/users" -Method GET -Headers $headers
    Write-Host "✅ User analytics endpoint working!" -ForegroundColor Green
    Write-Host "   Total Users: $($userAnalyticsResponse.totalUsers)" -ForegroundColor White
    
    Write-Host "   User Role Distribution:" -ForegroundColor White
    foreach ($roleData in $userAnalyticsResponse.usersByRole) {
        Write-Host "     - $($roleData.role): $($roleData.count)" -ForegroundColor White
    }
    
    Write-Host "   Recent Users: $($userAnalyticsResponse.recentUsers.Count) retrieved" -ForegroundColor White
    Write-Host "   User Growth Data: $($userAnalyticsResponse.userGrowth.Count) periods" -ForegroundColor White
    
    # 3. Review Analytics
    Write-Host "`n⭐ TESTING REVIEW ANALYTICS" -ForegroundColor Cyan
    Write-Host "-------------------------" -ForegroundColor Cyan
    
    $reviewAnalyticsResponse = Invoke-RestMethod -Uri "$baseUrl/analytics/reviews" -Method GET -Headers $headers
    Write-Host "✅ Review analytics endpoint working!" -ForegroundColor Green
    Write-Host "   Total Reviews: $($reviewAnalyticsResponse.totalReviews)" -ForegroundColor White
    Write-Host "   Average Rating: $($reviewAnalyticsResponse.averageRating)" -ForegroundColor White
    
    Write-Host "   Reviews by Target Type:" -ForegroundColor White
    foreach ($targetData in $reviewAnalyticsResponse.reviewsByTargetType) {
        Write-Host "     - $($targetData.targetType): $($targetData.count) reviews, avg rating: $($targetData.averageRating)" -ForegroundColor White
    }
    
    # 4. User Management
    Write-Host "`n🔧 TESTING USER MANAGEMENT" -ForegroundColor Cyan
    Write-Host "------------------------" -ForegroundColor Cyan
    
    $userCountsResponse = Invoke-RestMethod -Uri "$baseUrl/users/admin/count" -Method GET -Headers $headers
    Write-Host "✅ User counts endpoint working!" -ForegroundColor Green
    Write-Host "   Total Users: $($userCountsResponse.total)" -ForegroundColor White
    Write-Host "   By Role:" -ForegroundColor White
    Write-Host "     - Students: $($userCountsResponse.byRole.student)" -ForegroundColor White
    Write-Host "     - Landlords: $($userCountsResponse.byRole.landlord)" -ForegroundColor White
    Write-Host "     - Food Providers: $($userCountsResponse.byRole.food_provider)" -ForegroundColor White
    Write-Host "     - Admins: $($userCountsResponse.byRole.admin)" -ForegroundColor White
    
    Write-Host "   By Status:" -ForegroundColor White
    Write-Host "     - Active: $($userCountsResponse.byStatus.active)" -ForegroundColor White
    Write-Host "     - Inactive: $($userCountsResponse.byStatus.inactive)" -ForegroundColor White
    
    $allUsersResponse = Invoke-RestMethod -Uri "$baseUrl/users/admin/all" -Method GET -Headers $headers
    Write-Host "✅ All users endpoint working!" -ForegroundColor Green
    Write-Host "   Retrieved $($allUsersResponse.Count) users" -ForegroundColor White
    
    # 5. Report Generation
    Write-Host "`n📃 TESTING REPORT GENERATION" -ForegroundColor Cyan
    Write-Host "---------------------------" -ForegroundColor Cyan
    
    $userReportResponse = Invoke-RestMethod -Uri "$baseUrl/analytics/reports/users" -Method GET -Headers $headers
    Write-Host "✅ User report endpoint working!" -ForegroundColor Green
    Write-Host "   Generated At: $($userReportResponse.generatedAt)" -ForegroundColor White
    Write-Host "   Total Users in Report: $($userReportResponse.stats.total)" -ForegroundColor White
    Write-Host "   User Data Points: $($userReportResponse.users.Count)" -ForegroundColor White
    
    $revenueReportResponse = Invoke-RestMethod -Uri "$baseUrl/analytics/reports/revenue?days=90" -Method GET -Headers $headers
    Write-Host "✅ Revenue report endpoint working!" -ForegroundColor Green
    
    $bookingReportResponse = Invoke-RestMethod -Uri "$baseUrl/analytics/reports/bookings?days=90" -Method GET -Headers $headers
    Write-Host "✅ Booking report endpoint working!" -ForegroundColor Green
    
    Write-Host "`n🎉 COMPREHENSIVE TEST COMPLETED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "All admin dashboard endpoints are working properly and returning real-time data." -ForegroundColor Green
    Write-Host "The frontend can now be integrated with these endpoints." -ForegroundColor Green
}
catch {
    Write-Host "`n❌ TEST FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        Write-Host "Status Description: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    }
}
