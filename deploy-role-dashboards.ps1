# Deploy the updated landlord and food provider dashboard features to Heroku

Write-Host "Building and deploying role-based dashboard updates to Heroku..." -ForegroundColor Cyan

# Ensure we're on the latest code
git add .
git commit -m "Add landlord and food provider dashboard functionality"

# Deploy to Heroku
git push heroku master

# Show deployment logs
heroku logs --tail
