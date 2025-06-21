# Final Corrected Landlord Endpoints Test

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxvZ2luLmRlYnVnLjEwMDE3NjE2MjBAdGVzdC5jb20iLCJzdWIiOiI2ODU2M2UyMjQyZDEwZTBiMDFjZGE0MmYiLCJyb2xlIjoibGFuZGxvcmQiLCJpYXQiOjE3NTA0ODI0NjcsImV4cCI6MTc1MTA4NzI2N30.DscxP7-h6-CE_Xz3VA6aR5S74ijR5Og0nd0mpF2iz24"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "=== Final Corrected Landlord Endpoints Test ===" -ForegroundColor Green

# Test corrected endpoints
$endpoints = @(
    @{ name = "Dashboard Overview"; url = "accommodations/landlord/dashboard"; method = "GET" },
    @{ name = "Landlord Accommodations"; url = "accommodations/landlord"; method = "GET" },  # CORRECTED
    @{ name = "Landlord Profile"; url = "users/landlord/profile"; method = "GET" },
    @{ name = "Landlord Statistics"; url = "users/landlord/statistics"; method = "GET" },
    @{ name = "Landlord Revenue"; url = "users/landlord/revenue"; method = "GET" },
    @{ name = "Landlord Bookings"; url = "users/landlord/bookings"; method = "GET" }
)

foreach ($endpoint in $endpoints) {
    Write-Host "`nTesting $($endpoint.name)..." -ForegroundColor Yellow
    Write-Host "URL: $baseUrl/$($endpoint.url)" -ForegroundColor Cyan
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/$($endpoint.url)" -Method $endpoint.method -Headers $headers
        Write-Host "✅ $($endpoint.name) successful" -ForegroundColor Green
        
        if ($endpoint.name -eq "Landlord Accommodations") {
            Write-Host "Number of accommodations: $($response.Count)" -ForegroundColor Cyan
            if ($response.Count -gt 0) {
                Write-Host "First accommodation: $($response[0].title)" -ForegroundColor Cyan
            }
        } elseif ($endpoint.name -eq "Dashboard Overview") {
            Write-Host "Total Accommodations: $($response.totalAccommodations)" -ForegroundColor Cyan
            Write-Host "Pending: $($response.pendingAccommodations)" -ForegroundColor Cyan
            Write-Host "Approved: $($response.approvedAccommodations)" -ForegroundColor Cyan
        } elseif ($endpoint.name -eq "Landlord Profile") {
            Write-Host "Name: $($response.name)" -ForegroundColor Cyan
            Write-Host "Email: $($response.email)" -ForegroundColor Cyan
            Write-Host "Active: $($response.isActive)" -ForegroundColor Cyan
        } else {
            Write-Host "Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Cyan
        }
        
    } catch {
        Write-Host "❌ $($endpoint.name) failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        }
    }
}

# Test change password endpoint (need to find the correct one)
Write-Host "`nTesting Change Password..." -ForegroundColor Yellow

# Check if it's in users endpoint
$changePasswordData = @{
    currentPassword = "Test123!@#"
    newPassword = "NewTest123!@#"
}

$passwordEndpoints = @(
    "users/change-password",
    "users/landlord/change-password",
    "auth/change-password"
)

foreach ($pwEndpoint in $passwordEndpoints) {
    Write-Host "`nTrying endpoint: $baseUrl/$pwEndpoint" -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/$pwEndpoint" -Method POST -Body ($changePasswordData | ConvertTo-Json) -Headers $headers
        Write-Host "✅ Change password successful at $pwEndpoint" -ForegroundColor Green
        break
    } catch {
        Write-Host "❌ $pwEndpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== Final Test Complete ===" -ForegroundColor Green
