# Test Fixed Landlord Endpoints

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxvZ2luLmRlYnVnLjEwMDE3NjE2MjBAdGVzdC5jb20iLCJzdWIiOiI2ODU2M2UyMjQyZDEwZTBiMDFjZGE0MmYiLCJyb2xlIjoibGFuZGxvcmQiLCJpYXQiOjE3NTA0ODI0NjcsImV4cCI6MTc1MTA4NzI2N30.DscxP7-h6-CE_Xz3VA6aR5S74ijR5Og0nd0mpF2iz24"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "=== Testing Fixed Landlord Endpoints ===" -ForegroundColor Green

# Test the previously failing endpoint
Write-Host "`nTesting /accommodations/landlord (previously 500 error)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/accommodations/landlord" -Method GET -Headers $headers
    Write-Host "✅ Success! Landlord accommodations retrieved" -ForegroundColor Green
    Write-Host "Number of accommodations: $($response.Count)" -ForegroundColor Cyan
    if ($response.Count -gt 0) {
        Write-Host "First accommodation: $($response[0].title)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Still failing: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# Test change password endpoint
Write-Host "`nTesting /users/change-password..." -ForegroundColor Yellow
$changePasswordData = @{
    currentPassword = "Test123!@#"
    newPassword = "NewTest123!@#"
}

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/users/change-password" -Method PUT -Body ($changePasswordData | ConvertTo-Json) -Headers $headers
    Write-Host "✅ Change password successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Change password failed: $($_.Exception.Message)" -ForegroundColor Red
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

Write-Host "`n=== Test Complete ===" -ForegroundColor Green
