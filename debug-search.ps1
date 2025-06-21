# Debug Accommodation Search
$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

try {
    # Test basic search
    Write-Host "Testing basic accommodations search..." -ForegroundColor Yellow
    $basicResponse = Invoke-RestMethod -Uri "$baseUrl/accommodations" -Method GET -ContentType "application/json"
    Write-Host "Basic search returned $($basicResponse.Count) results" -ForegroundColor Green
    
    # Test price filter with different formats
    Write-Host "`nTesting price filter search..." -ForegroundColor Yellow
    
    # Try with proper numeric parameters
    $priceFilterUrl = "$baseUrl/accommodations?minPrice=500&maxPrice=2000"
    Write-Host "Testing URL: $priceFilterUrl" -ForegroundColor Gray
    
    $priceResponse = Invoke-RestMethod -Uri $priceFilterUrl -Method GET -ContentType "application/json"
    Write-Host "Price filter search returned $($priceResponse.Count) results" -ForegroundColor Green
    
    # Test with single accommodation details
    if ($basicResponse.Count -gt 0) {
        $testAccId = $basicResponse[0]._id
        Write-Host "`nTesting accommodation details for ID: $testAccId" -ForegroundColor Yellow
        $detailResponse = Invoke-RestMethod -Uri "$baseUrl/accommodations/$testAccId" -Method GET -ContentType "application/json"
        Write-Host "Detail response: Success" -ForegroundColor Green
        Write-Host "Accommodation title: $($detailResponse.title)" -ForegroundColor Gray
        Write-Host "Accommodation price: $($detailResponse.price)" -ForegroundColor Gray
    }
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseText = $reader.ReadToEnd()
        Write-Host "Response: $responseText" -ForegroundColor Red
    }
}
