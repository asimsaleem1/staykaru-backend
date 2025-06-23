# StayKaru Backend - Comprehensive Cleanup Script
# This script removes all unnecessary test files, reports, and temporary files

Write-Host "🧹 Starting StayKaru Backend Cleanup..." -ForegroundColor Yellow

# Define patterns of files to delete
$filesToDelete = @(
    # Test scripts (PowerShell)
    "*.ps1",
    
    # Markdown reports and documentation (keeping only README.md)
    "*_REPORT.md",
    "*_GUIDE.md", 
    "*_SUMMARY.md",
    "*_STATUS.md",
    "*_PROMPT*.md",
    "*_IMPLEMENTATION*.md",
    "*_TESTING*.md",
    "*_SUCCESS*.md",
    "*_COMPLETE*.md",
    "*_ANALYSIS.md",
    "*_CHECKLIST.md",
    "*_REFERENCE*.md",
    "*_UPGRADE*.md",
    "*_FRONTEND*.md",
    "*_MODULE*.md",
    "*_API*.md",
    "*_AUTH*.md",
    "*_EMAIL*.md",
    "*_SOCIAL*.md",
    "*_DEPLOYMENT*.md",
    "*_MAP*.md",
    "*_CHAT*.md",
    "*_BACKEND*.md",
    "*_CLEANUP*.md",
    "*_VERIFICATION*.md",
    "ADMIN_*.md",
    "STUDENT_*.md",
    "LANDLORD_*.md",
    "FOOD_PROVIDER_*.md",
    "COMPREHENSIVE_*.md",
    "ENHANCED_*.md",
    "FINAL_*.md",
    "MULTI_*.md",
    "SIMPLIFIED_*.md",
    "USER_*.md",
    "UPGRADED_*.md",
    "PRODUCTION_*.md",
    "IMPLEMENTATION_*.md",
    "AUTHENTICATION_*.md",
    "EXECUTIVE_SUMMARY.md",
    
    # HTML test files
    "*.html",
    
    # JavaScript debug files
    "debug-*.js",
    
    # JSON test results
    "*.json" | Where-Object { $_ -notmatch "package*.json|tsconfig*.json|jest.config.js|nest-cli.json|jsconfig.json" },
    
    # Temporary frontend folder (if it exists)
    "food-provider-frontend",
    
    # Any other temporary files
    "*.tmp",
    "*.temp"
)

$deletedCount = 0
$totalSize = 0

# Function to safely delete files/folders
function Remove-SafelyWithSize {
    param([string]$Path)
    
    if (Test-Path $Path) {
        try {
            if (Test-Path $Path -PathType Container) {
                # It's a directory
                $size = (Get-ChildItem -Path $Path -Recurse -File | Measure-Object -Property Length -Sum).Sum
                Remove-Item -Path $Path -Recurse -Force
                Write-Host "🗂️  Deleted folder: $Path ($([math]::Round($size/1KB, 2)) KB)" -ForegroundColor Green
            } else {
                # It's a file
                $size = (Get-Item $Path).Length
                Remove-Item -Path $Path -Force
                Write-Host "📄 Deleted file: $Path ($([math]::Round($size/1KB, 2)) KB)" -ForegroundColor Green
            }
            $script:deletedCount++
            $script:totalSize += $size
            return $true
        } catch {
            Write-Host "❌ Failed to delete: $Path - $($_.Exception.Message)" -ForegroundColor Red
            return $false
        }
    }
    return $false
}

Write-Host "`n🔍 Scanning for unnecessary files..." -ForegroundColor Cyan

# Delete PowerShell test scripts
Write-Host "`n📝 Removing PowerShell test scripts..." -ForegroundColor Yellow
Get-ChildItem -Path "." -Filter "*.ps1" | ForEach-Object {
    Remove-SafelyWithSize $_.FullName
}

# Delete unnecessary markdown files (keep only README.md and essential docs)
Write-Host "`n📋 Removing unnecessary documentation..." -ForegroundColor Yellow
$keepFiles = @("README.md", "package.json", "package-lock.json")
Get-ChildItem -Path "." -Filter "*.md" | Where-Object { 
    $_.Name -notin $keepFiles 
} | ForEach-Object {
    Remove-SafelyWithSize $_.FullName
}

# Delete HTML test files
Write-Host "`n🌐 Removing HTML test files..." -ForegroundColor Yellow
Get-ChildItem -Path "." -Filter "*.html" | ForEach-Object {
    Remove-SafelyWithSize $_.FullName
}

# Delete JavaScript debug files
Write-Host "`n🐛 Removing debug files..." -ForegroundColor Yellow
Get-ChildItem -Path "." -Filter "debug-*.js" | ForEach-Object {
    Remove-SafelyWithSize $_.FullName
}

# Delete JSON test result files (keep essential JSON configs)
Write-Host "`n📊 Removing test result files..." -ForegroundColor Yellow
$essentialJsonFiles = @("package.json", "package-lock.json", "tsconfig.json", "tsconfig.build.json", "tsconfig.test.json", "jest.config.js", "nest-cli.json", "jsconfig.json")
Get-ChildItem -Path "." -Filter "*.json" | Where-Object { 
    $_.Name -notin $essentialJsonFiles 
} | ForEach-Object {
    Remove-SafelyWithSize $_.FullName
}

# Delete temporary frontend folder
Write-Host "`n🗂️  Removing temporary folders..." -ForegroundColor Yellow
if (Test-Path "food-provider-frontend") {
    Remove-SafelyWithSize "food-provider-frontend"
}

# Clean up any temporary files
Write-Host "`n🧽 Removing temporary files..." -ForegroundColor Yellow
@("*.tmp", "*.temp") | ForEach-Object {
    Get-ChildItem -Path "." -Filter $_ | ForEach-Object {
        Remove-SafelyWithSize $_.FullName
    }
}

Write-Host "`n✅ Cleanup Complete!" -ForegroundColor Green
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "   Files/Folders Deleted: $deletedCount" -ForegroundColor White
Write-Host "   Total Space Freed: $([math]::Round($totalSize/1MB, 2)) MB" -ForegroundColor White

Write-Host "`nEssential files preserved:" -ForegroundColor Cyan
Write-Host "   Source code (src/)" -ForegroundColor White
Write-Host "   Configuration files (.env, package.json, tsconfig.json, etc.)" -ForegroundColor White
Write-Host "   README.md" -ForegroundColor White
Write-Host "   Node modules and dependencies" -ForegroundColor White
Write-Host "   Git repository (.git/)" -ForegroundColor White
Write-Host "   Build files (dist/)" -ForegroundColor White

Write-Host "`nYour StayKaru backend is now clean and ready!" -ForegroundColor Green
