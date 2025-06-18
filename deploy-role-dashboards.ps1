# Role-based Dashboard Deployment Script for Heroku
Write-Host "StayKaru Role-based Dashboard Deployment to Heroku" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Run verification test script first
Write-Host "Step 1: Verifying role-based dashboards..." -ForegroundColor Green
./verify-role-dashboards.ps1

# Ask for confirmation before deploying
Write-Host "`nReady to deploy to Heroku." -ForegroundColor Yellow
$confirmation = Read-Host "Do you want to continue with deployment? (y/n)"
if ($confirmation -ne "y") {
    Write-Host "Deployment cancelled." -ForegroundColor Red
    exit
}

# 2. Build the project
Write-Host "`nStep 2: Building the project for production..." -ForegroundColor Green
npm run build

# 3. Ensure we're on the latest code
Write-Host "`nStep 3: Committing latest changes..." -ForegroundColor Green
git add .
git commit -m "Deploy role-based dashboards for landlord and food provider"

# 4. Deploy to Heroku
Write-Host "`nStep 4: Deploying to Heroku..." -ForegroundColor Green
git push heroku main

# 5. Show deployment logs
Write-Host "`nStep 5: Showing deployment logs..." -ForegroundColor Green
heroku logs --tail

Write-Host "`nDeployment Complete!" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Share the deployment status with your team" -ForegroundColor Yellow
Write-Host "2. Update frontend to integrate with the new dashboard endpoints" -ForegroundColor Yellow
Write-Host "3. Refer to ROLE_BASED_DASHBOARD_IMPLEMENTATION_GUIDE.md for integration details" -ForegroundColor Yellow
