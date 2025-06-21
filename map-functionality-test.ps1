# Map Functionality Test Script
# Test the comprehensive map and tracking features

# Test basic map endpoints
Write-Host "Testing Map Functionality..." -ForegroundColor Green

$baseUrl = "http://localhost:3000"
$apiUrl = "$baseUrl/api"

# Test 1: Search nearby properties
Write-Host "`n1. Testing nearby property search..." -ForegroundColor Yellow
$searchData = @{
    location = @{
        latitude = 24.8607
        longitude = 67.0011
    }
    radius = 5000
    type = "lodging"
    keyword = "hotel"
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-RestMethod -Uri "$apiUrl/maps/search/properties" -Method POST -Body $searchData -ContentType "application/json"
    Write-Host "✓ Property search successful" -ForegroundColor Green
    Write-Host "Found $($response.Count) properties" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Property search failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Geocode address
Write-Host "`n2. Testing address geocoding..." -ForegroundColor Yellow
$geocodeData = @{
    address = "Karachi, Pakistan"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$apiUrl/maps/geocode" -Method POST -Body $geocodeData -ContentType "application/json"
    Write-Host "✓ Geocoding successful" -ForegroundColor Green
    Write-Host "Coordinates: $($response.latitude), $($response.longitude)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Geocoding failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Reverse geocode coordinates
Write-Host "`n3. Testing reverse geocoding..." -ForegroundColor Yellow
$reverseGeocodeData = @{
    location = @{
        latitude = 24.8607
        longitude = 67.0011
    }
} | ConvertTo-Json -Depth 2

try {
    $response = Invoke-RestMethod -Uri "$apiUrl/maps/reverse-geocode" -Method POST -Body $reverseGeocodeData -ContentType "application/json"
    Write-Host "✓ Reverse geocoding successful" -ForegroundColor Green
    Write-Host "Address: $($response.address)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Reverse geocoding failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Get route between two points
Write-Host "`n4. Testing route calculation..." -ForegroundColor Yellow
$routeData = @{
    origin = @{
        latitude = 24.8607
        longitude = 67.0011
    }
    destination = @{
        latitude = 24.8615
        longitude = 67.0021
    }
    mode = "driving"
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-RestMethod -Uri "$apiUrl/maps/route" -Method POST -Body $routeData -ContentType "application/json"
    Write-Host "✓ Route calculation successful" -ForegroundColor Green
    Write-Host "Distance: $($response.distance), Duration: $($response.duration)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Route calculation failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Search places by text
Write-Host "`n5. Testing place search..." -ForegroundColor Yellow
$placeSearchData = @{
    query = "restaurants in Karachi"
    location = @{
        latitude = 24.8607
        longitude = 67.0011
    }
    radius = 5000
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-RestMethod -Uri "$apiUrl/maps/search/places" -Method POST -Body $placeSearchData -ContentType "application/json"
    Write-Host "✓ Place search successful" -ForegroundColor Green
    Write-Host "Found $($response.Count) places" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Place search failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Get estimated arrival time
Write-Host "`n6. Testing estimated arrival..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$apiUrl/maps/estimated-arrival?fromLat=24.8607&fromLng=67.0011&toLat=24.8615&toLng=67.0021&mode=driving" -Method GET
    Write-Host "✓ Estimated arrival calculation successful" -ForegroundColor Green
    Write-Host "Estimated arrival: $($response.estimatedArrival)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Estimated arrival failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Order Tracking Functionality
Write-Host "`n`nTesting Order Tracking Functionality..." -ForegroundColor Green

# First, let's create a test order (you might need to modify this based on your existing order structure)
Write-Host "`n7. Testing order location update..." -ForegroundColor Yellow
$orderLocationData = @{
    orderId = "507f1f77bcf86cd799439011"  # Replace with actual order ID
    location = @{
        latitude = 24.8607
        longitude = 67.0011
    }
    status = "out_for_delivery"
    notes = "Driver has picked up the order"
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-RestMethod -Uri "$apiUrl/order-tracking/location" -Method PUT -Body $orderLocationData -ContentType "application/json"
    Write-Host "✓ Order location update successful" -ForegroundColor Green
} catch {
    Write-Host "✗ Order location update failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Note: This might fail if the order ID doesn't exist" -ForegroundColor Yellow
}

# Test 8: Set delivery location
Write-Host "`n8. Testing delivery location setting..." -ForegroundColor Yellow
$deliveryLocationData = @{
    orderId = "507f1f77bcf86cd799439011"  # Replace with actual order ID
    coordinates = @{
        latitude = 24.8615
        longitude = 67.0021
    }
    address = "House #123, Block A, Gulshan-e-Iqbal, Karachi"
    landmark = "Near Cafe Coffee Day"
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-RestMethod -Uri "$apiUrl/order-tracking/delivery-location" -Method POST -Body $deliveryLocationData -ContentType "application/json"
    Write-Host "✓ Delivery location setting successful" -ForegroundColor Green
} catch {
    Write-Host "✗ Delivery location setting failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Note: This might fail if the order ID doesn't exist" -ForegroundColor Yellow
}

# Test 9: Get tracking information
Write-Host "`n9. Testing tracking information retrieval..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$apiUrl/order-tracking/507f1f77bcf86cd799439011/tracking" -Method GET
    Write-Host "✓ Tracking information retrieval successful" -ForegroundColor Green
    Write-Host "Order status: $($response.status)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Tracking information retrieval failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Note: This might fail if the order ID doesn't exist" -ForegroundColor Yellow
}

# Test 10: Get active deliveries
Write-Host "`n10. Testing active deliveries..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$apiUrl/order-tracking/active-deliveries" -Method GET
    Write-Host "✓ Active deliveries retrieval successful" -ForegroundColor Green
    Write-Host "Active deliveries count: $($response.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Active deliveries retrieval failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 11: Optimize delivery route
Write-Host "`n11. Testing route optimization..." -ForegroundColor Yellow
$routeOptimizationData = @{
    startLocation = @{
        latitude = 24.8600
        longitude = 67.0010
    }
    deliveryLocations = @(
        @{
            latitude = 24.8615
            longitude = 67.0021
        },
        @{
            latitude = 24.8625
            longitude = 67.0031
        }
    )
} | ConvertTo-Json -Depth 4

try {
    $response = Invoke-RestMethod -Uri "$apiUrl/order-tracking/optimize-route" -Method POST -Body $routeOptimizationData -ContentType "application/json"
    Write-Host "✓ Route optimization successful" -ForegroundColor Green
    Write-Host "Total routes: $($response.totalRoutes)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Route optimization failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n`nMap and Tracking Tests Completed!" -ForegroundColor Green
Write-Host "Note: Some tests may fail if Google Maps API key is not configured or if test order IDs don't exist." -ForegroundColor Yellow
Write-Host "`nTo configure Google Maps API:" -ForegroundColor Cyan
Write-Host "1. Get an API key from Google Cloud Platform" -ForegroundColor White
Write-Host "2. Add GOOGLE_MAPS_API_KEY=your_api_key to your .env file" -ForegroundColor White
Write-Host "3. Enable the following APIs in Google Cloud:" -ForegroundColor White
Write-Host "   - Maps JavaScript API" -ForegroundColor White
Write-Host "   - Places API" -ForegroundColor White
Write-Host "   - Directions API" -ForegroundColor White
Write-Host "   - Geocoding API" -ForegroundColor White
