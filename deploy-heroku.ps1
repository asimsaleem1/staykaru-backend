# StayKaru Backend Heroku Deployment Script (PowerShell)

Write-Host "Starting StayKaru Backend Heroku Deployment..." -ForegroundColor Yellow

# Check if Heroku CLI is installed
try {
    heroku --version | Out-Null
    Write-Host "Heroku CLI found" -ForegroundColor Green
} catch {
    Write-Host "Heroku CLI is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "https://devcenter.heroku.com/articles/heroku-cli" -ForegroundColor Cyan
    exit 1
}

# Check authentication
Write-Host "Checking Heroku authentication..." -ForegroundColor Yellow
try {
    heroku auth:whoami
} catch {
    Write-Host "Please login to Heroku..." -ForegroundColor Yellow
    heroku login
}

# Create unique app name
$timestamp = [System.DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$APP_NAME = "staykaru-backend-$timestamp"

Write-Host "📱 Creating Heroku application: $APP_NAME" -ForegroundColor Yellow
heroku create $APP_NAME

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Created Heroku app: $APP_NAME" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to create Heroku app" -ForegroundColor Red
    exit 1
}

# Set environment variables
Write-Host "⚙️ Setting environment variables..." -ForegroundColor Yellow

$env_vars = @{
    "NODE_ENV" = "production"
    "JWT_SECRET" = "staykaru-super-secret-jwt-key-production-2025-$(Get-Random -Minimum 100000 -Maximum 999999)"
    "JWT_EXPIRES_IN" = "24h"
    "API_PREFIX" = "api"
    "SWAGGER_TITLE" = "StayKaru API"
    "SWAGGER_DESCRIPTION" = "StayKaru Backend API Documentation"
    "SWAGGER_VERSION" = "1.0"
    "MAX_FILE_SIZE" = "5242880"
    "UPLOAD_DIR" = "./uploads"
    "RATE_LIMIT_TTL" = "60"
    "RATE_LIMIT_LIMIT" = "100"
    "ENCRYPTION_KEY" = "staykaru-encryption-key-$(Get-Random -Minimum 100000 -Maximum 999999)"
}

foreach ($var in $env_vars.GetEnumerator()) {
    Write-Host "Setting $($var.Key)..." -ForegroundColor Cyan
    heroku config:set "$($var.Key)=$($var.Value)" --app $APP_NAME
}

# Add Redis addon
Write-Host "💾 Adding Redis addon..." -ForegroundColor Yellow
heroku addons:create heroku-redis:mini --app $APP_NAME

# Initialize git repository if not exists
if (-not (Test-Path ".git")) {
    Write-Host "📁 Initializing Git repository..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit"
}

# Add Heroku remote
Write-Host "🔗 Adding Heroku remote..." -ForegroundColor Yellow
heroku git:remote -a $APP_NAME

# Deploy to Heroku
Write-Host "🚢 Deploying to Heroku..." -ForegroundColor Yellow
git add .
git commit -m "Deploy StayKaru Backend to Heroku"
git push heroku main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Deployment failed. Check logs with: heroku logs --tail --app $APP_NAME" -ForegroundColor Red
}

# Display important information
Write-Host ""
Write-Host "📱 App Name: $APP_NAME" -ForegroundColor Green
Write-Host "🌐 URL: https://$APP_NAME.herokuapp.com" -ForegroundColor Green
Write-Host "📊 Logs: heroku logs --tail --app $APP_NAME" -ForegroundColor Cyan
Write-Host "⚙️ Config: heroku config --app $APP_NAME" -ForegroundColor Cyan

Write-Host ""
Write-Host "🔧 Manual steps needed:" -ForegroundColor Yellow
Write-Host "1. Set MongoDB URI: heroku config:set MONGODB_URI='your-connection-string' --app $APP_NAME" -ForegroundColor White
Write-Host "2. Verify all environment variables: heroku config --app $APP_NAME" -ForegroundColor White
Write-Host "3. Check application logs: heroku logs --tail --app $APP_NAME" -ForegroundColor White
Write-Host "4. Test API endpoints: https://$APP_NAME.herokuapp.com/api" -ForegroundColor White

# Open the app
Write-Host "🌐 Opening application..." -ForegroundColor Yellow
heroku open --app $APP_NAME
