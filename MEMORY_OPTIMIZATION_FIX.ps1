# Memory Optimization Fix for Heroku Deployment
# This script updates the backend to handle memory constraints on Heroku

Write-Host "🔧 Applying Memory Optimization Fixes..." -ForegroundColor Cyan

# Update package.json to use memory-optimized Node.js settings
$packagePath = "package.json"
if (Test-Path $packagePath) {
    $packageJson = Get-Content $packagePath | ConvertFrom-Json
    
    # Update start:prod script with memory optimization
    $packageJson.scripts."start:prod" = "node --max-old-space-size=512 dist/main"
    
    # Add memory monitoring script
    $packageJson.scripts."start:heroku" = "node --max-old-space-size=512 --optimize-for-size dist/main"
    
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content $packagePath
    Write-Host "✅ Updated package.json with memory optimization settings" -ForegroundColor Green
}

# Create Heroku-specific Procfile
$procfileContent = "web: npm run start:heroku"
Set-Content -Path "Procfile" -Value $procfileContent
Write-Host "✅ Updated Procfile for memory optimization" -ForegroundColor Green

# Commit changes
git add .
git commit -m "Fix: Implement memory optimization for Heroku deployment

- Add pagination to prevent loading all records at once
- Implement memory limits for accommodation and food provider services
- Add TTL to cache to prevent memory buildup
- Optimize Node.js memory settings for Heroku dyno limits
- Update API endpoints to support pagination parameters"

Write-Host "📦 Building optimized application..." -ForegroundColor Yellow
npm run build

Write-Host "🚀 Deploying memory-optimized version to Heroku..." -ForegroundColor Yellow
git push heroku main

Write-Host "✨ Memory optimization deployment completed!" -ForegroundColor Green
Write-Host "🔍 The app now uses pagination and memory limits to prevent crashes" -ForegroundColor Blue
