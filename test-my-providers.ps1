#!/usr/bin/env pwsh
# Test script for my-providers endpoint

$baseUri = "http://localhost:3000/api"
$headers = @{"Content-Type" = "application/json"}

# Login
$loginBody = @{
    email = "testfoodprovider@example.com"
    password = "TestPassword123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUri/auth/login" -Method Post -Body $loginBody -Headers $headers
    $authHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $($loginResponse.access_token)"
    }
    
    Write-Host "✅ Logged in successfully"
    Write-Host "User ID: $($loginResponse.user._id)"
    
    # Test my-providers endpoint
    Write-Host "`nTesting my-providers endpoint..."
    $myProviders = Invoke-RestMethod -Uri "$baseUri/food-providers/owner/my-providers" -Method Get -Headers $authHeaders
    
    Write-Host "Response:"
    Write-Host ($myProviders | ConvertTo-Json -Depth 3)
    
    if ($myProviders.Count -eq 0) {
        Write-Host "❌ No providers found - this might be the issue!"
    } else {
        Write-Host "✅ Found $($myProviders.Count) provider(s)"
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)"
    }
}
