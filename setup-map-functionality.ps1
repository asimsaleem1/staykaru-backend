# Map Functionality Setup and Deployment Script

Write-Host "Setting up Map Functionality for StayKaru Backend..." -ForegroundColor Green

# Check if Google Maps API key is configured
Write-Host "`n1. Checking Google Maps API configuration..." -ForegroundColor Yellow

$envFile = ".env"
if (Test-Path $envFile) {
    $content = Get-Content $envFile
    $hasApiKey = $content | Where-Object { $_ -like "GOOGLE_MAPS_API_KEY=*" }
    
    if ($hasApiKey) {
        Write-Host "✓ Google Maps API key found in .env file" -ForegroundColor Green
    } else {
        Write-Host "⚠ Google Maps API key not found in .env file" -ForegroundColor Yellow
        Write-Host "Please add GOOGLE_MAPS_API_KEY=your_api_key to your .env file" -ForegroundColor White
    }
} else {
    Write-Host "⚠ .env file not found" -ForegroundColor Yellow
    Write-Host "Creating .env file template..." -ForegroundColor White
    
    $envTemplate = @"
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/staykaru

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=development
"@
    
    $envTemplate | Out-File -FilePath $envFile -Encoding UTF8
    Write-Host "✓ .env file template created" -ForegroundColor Green
}

# Install dependencies
Write-Host "`n2. Installing dependencies..." -ForegroundColor Yellow
try {
    $result = npm install
    Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to install dependencies: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Build the project
Write-Host "`n3. Building the project..." -ForegroundColor Yellow
try {
    $result = npm run build
    Write-Host "✓ Project built successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Build failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check for compilation errors and fix them before proceeding" -ForegroundColor Yellow
}

# Check if server can start
Write-Host "`n4. Testing server startup..." -ForegroundColor Yellow
$testProcess = Start-Process -FilePath "npm" -ArgumentList "run", "start:dev" -PassThru -WindowStyle Hidden

Start-Sleep -Seconds 10

if ($testProcess.HasExited) {
    Write-Host "✗ Server failed to start" -ForegroundColor Red
    Write-Host "Please check the logs for errors" -ForegroundColor Yellow
} else {
    Write-Host "✓ Server started successfully" -ForegroundColor Green
    Stop-Process -Id $testProcess.Id -Force
}

# Deploy to Heroku (if logged in)
Write-Host "`n5. Checking Heroku deployment..." -ForegroundColor Yellow
try {
    $herokuApps = heroku apps --json | ConvertFrom-Json
    $staykaruApp = $herokuApps | Where-Object { $_.name -eq "staykaru-backend" }
    
    if ($staykaruApp) {
        Write-Host "✓ Heroku app 'staykaru-backend' found" -ForegroundColor Green
        
        Write-Host "Setting environment variables on Heroku..." -ForegroundColor White
        if ($hasApiKey) {
            $apiKeyLine = $content | Where-Object { $_ -like "GOOGLE_MAPS_API_KEY=*" }
            $apiKey = $apiKeyLine.Split('=')[1]
            if ($apiKey -and $apiKey -ne "your_google_maps_api_key_here") {
                try {
                    heroku config:set GOOGLE_MAPS_API_KEY=$apiKey --app staykaru-backend
                    Write-Host "✓ Google Maps API key set on Heroku" -ForegroundColor Green
                } catch {
                    Write-Host "⚠ Failed to set API key on Heroku" -ForegroundColor Yellow
                }
            }
        }
        
        Write-Host "Deploying to Heroku..." -ForegroundColor White
        try {
            git add .
            git commit -m "Add comprehensive map functionality and order tracking"
            git push heroku main
            Write-Host "✓ Successfully deployed to Heroku" -ForegroundColor Green
        } catch {
            Write-Host "⚠ Deployment may have issues. Please check manually." -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠ Heroku app 'staykaru-backend' not found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ Heroku CLI not available or not logged in" -ForegroundColor Yellow
    Write-Host "Please deploy manually using: git push heroku main" -ForegroundColor White
}

Write-Host "`n6. Setup Summary" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green

Write-Host "`nMap Features Added:" -ForegroundColor Cyan
Write-Host "✓ Property search with Google Places API" -ForegroundColor White
Write-Host "✓ Route calculation and directions" -ForegroundColor White
Write-Host "✓ Geocoding and reverse geocoding" -ForegroundColor White
Write-Host "✓ Real-time order tracking" -ForegroundColor White
Write-Host "✓ Delivery route optimization" -ForegroundColor White
Write-Host "✓ Estimated arrival time calculation" -ForegroundColor White

Write-Host "`nAPI Endpoints Added:" -ForegroundColor Cyan
Write-Host "• /api/maps/search/properties" -ForegroundColor White
Write-Host "• /api/maps/route" -ForegroundColor White
Write-Host "• /api/maps/geocode" -ForegroundColor White
Write-Host "• /api/maps/reverse-geocode" -ForegroundColor White
Write-Host "• /api/maps/search/places" -ForegroundColor White
Write-Host "• /api/maps/estimated-arrival" -ForegroundColor White
Write-Host "• /api/order-tracking/location" -ForegroundColor White
Write-Host "• /api/order-tracking/{id}/tracking" -ForegroundColor White
Write-Host "• /api/order-tracking/active-deliveries" -ForegroundColor White
Write-Host "• /api/order-tracking/optimize-route" -ForegroundColor White

Write-Host "`nNext Steps:" -ForegroundColor Cyan
if (-not $hasApiKey -or $hasApiKey -eq "your_google_maps_api_key_here") {
    Write-Host "1. Get a Google Maps API key from Google Cloud Platform" -ForegroundColor Yellow
    Write-Host "2. Enable required APIs (Places, Directions, Geocoding)" -ForegroundColor Yellow
    Write-Host "3. Update GOOGLE_MAPS_API_KEY in .env file" -ForegroundColor Yellow
    Write-Host "4. Set the API key on Heroku: heroku config:set GOOGLE_MAPS_API_KEY=your_key" -ForegroundColor Yellow
}
Write-Host "5. Test the endpoints using the test script: .\map-functionality-test.ps1" -ForegroundColor White
Write-Host "6. View API documentation at: https://staykaru-backend-60ed08adb2a7.herokuapp.com/api" -ForegroundColor White

Write-Host "`nDocumentation:" -ForegroundColor Cyan
Write-Host "• MAP_FUNCTIONALITY_GUIDE.md - Complete implementation guide" -ForegroundColor White
Write-Host "• map-functionality-test.ps1 - Test script for all endpoints" -ForegroundColor White

Write-Host "`nMap functionality setup completed! 🗺️" -ForegroundColor Green
