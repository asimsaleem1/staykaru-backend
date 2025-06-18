Write-Host "🚀 Deploying Admin Dashboard to Heroku" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Commit the changes
git add .
git commit -m "Fix TypeScript errors in admin dashboard implementation"

# Push to Heroku
git push heroku main

# Check the deployment
Write-Host "✅ Deployment initiated. Checking logs..." -ForegroundColor Green
heroku logs --tail
