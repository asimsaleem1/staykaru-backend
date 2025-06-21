# Test Specific Landlord Endpoints with Existing Token

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxvZ2luLmRlYnVnLjEwMDE3NjE2MjBAdGVzdC5jb20iLCJzdWIiOiI2ODU2M2UyMjQyZDEwZTBiMDFjZGE0MmYiLCJyb2xlIjoibGFuZGxvcmQiLCJpYXQiOjE3NTA0ODI0NjcsImV4cCI6MTc1MTA4NzI2N30.DscxP7-h6-CE_Xz3VA6aR5S74ijR5Og0nd0mpF2iz24"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "=== Testing Landlord Endpoints ===" -ForegroundColor Green

# Test each endpoint individually
$endpoints = @(
    @{ name = "Dashboard Overview"; url = "accommodations/landlord/dashboard" },
    @{ name = "Landlord Accommodations"; url = "accommodations/landlord/accommodations" },
    @{ name = "Landlord Profile"; url = "users/landlord/profile" },
    @{ name = "Landlord Statistics"; url = "users/landlord/statistics" },
    @{ name = "Landlord Revenue"; url = "users/landlord/revenue" },
    @{ name = "Landlord Bookings"; url = "users/landlord/bookings" }
)

foreach ($endpoint in $endpoints) {
    Write-Host "`nTesting $($endpoint.name)..." -ForegroundColor Yellow
    Write-Host "URL: $baseUrl/$($endpoint.url)" -ForegroundColor Cyan
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/$($endpoint.url)" -Method GET -Headers $headers
        Write-Host "✅ $($endpoint.name) successful" -ForegroundColor Green
        Write-Host "Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ $($endpoint.name) failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
            try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $responseBody = $reader.ReadToEnd()
                Write-Host "Error details: $responseBody" -ForegroundColor Red
            } catch {
                Write-Host "Could not read error details" -ForegroundColor Red
            }
        }
    }
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green
