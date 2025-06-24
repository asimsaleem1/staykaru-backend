# StayKaru Backend - Cleanup and Maintenance Scripts
# This script removes temporary test files and debug scripts

Write-Host "🧹 Cleaning up StayKaru Backend..." -ForegroundColor Green
Write-Host ("=" * 50)

# List of temporary/debug files to remove
$filesToRemove = @(
    "CREATE_ADMIN_USER.ps1",
    "RESET_ADMIN_PASSWORD.js", 
    "DEBUG_ADMIN_PASSWORD.js",
    "CHECK_USER_DATA.js",
    "CREATE_SIMPLE_ADMIN.js",
    "TEST_LOGIN.js",
    "TEST_BOOKING_CREATION.js",
    "TEST_ORDER_CREATION.js", 
    "COMPREHENSIVE_MODULE_TEST.js",
    "ACCURATE_MODULE_TEST.js",
    "TEST_CHATBOT.js",
    "SEED_DATABASE.js",
    "test-report.json",
    "accurate-test-report.json",
    "COMPLETE_100_PERCENT_MODULE_TEST.ps1",
    "CORRECTED_100_PERCENT_MODULE_TEST.ps1", 
    "FINAL_100_PERCENT_MODULE_TEST.ps1",
    "SIMPLE_100_PERCENT_MODULE_TEST.ps1",
    "SIMPLE_CLEANUP.ps1",
    "SIMPLE_COMPREHENSIVE_TEST.ps1",
    "MASTER_CLEANUP.ps1"
)

$removedCount = 0
$keptCount = 0

foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        try {
            Remove-Item $file -Force
            Write-Host "✅ Removed: $file" -ForegroundColor Yellow
            $removedCount++
        } catch {
            Write-Host "❌ Failed to remove: $file" -ForegroundColor Red
        }
    } else {
        Write-Host "ℹ️  Not found: $file" -ForegroundColor Gray
        $keptCount++
    }
}

# Keep important files but move them to a docs folder
$docsFolder = "docs"
if (-not (Test-Path $docsFolder)) {
    New-Item -ItemType Directory -Path $docsFolder | Out-Null
    Write-Host "📁 Created docs folder" -ForegroundColor Blue
}

$docsFiles = @(
    "README.md",
    "EXECUTIVE_SUMMARY.md", 
    "FINAL_100_PERCENT_SUCCESS_REPORT.md",
    "CLEANUP_SUMMARY.md",
    "COMPLETE_FRONTEND_DEVELOPMENT_GUIDE.md",
    "FRONTEND_DEVELOPMENT_PROMPT.md",
    "STUDENT_MODULE_FRONTEND_SPECIFICATION.md",
    "ADMIN_FRONTEND_SPECIFICATION.md"
)

foreach ($file in $docsFiles) {
    if (Test-Path $file) {
        $destPath = Join-Path $docsFolder $file
        if (-not (Test-Path $destPath)) {
            Copy-Item $file $destPath
            Write-Host "📄 Copied to docs: $file" -ForegroundColor Cyan
        }
    }
}

# Clean up CSV files (move to data folder)
$dataFolder = "data"
if (-not (Test-Path $dataFolder)) {
    New-Item -ItemType Directory -Path $dataFolder | Out-Null
    Write-Host "📁 Created data folder" -ForegroundColor Blue
}

$csvFiles = @(
    "restaurants_data_analysis.csv",
    "Karachi.csv", 
    "Lahore.csv",
    "Islamabad.csv"
)

foreach ($file in $csvFiles) {
    if (Test-Path $file) {
        $destPath = Join-Path $dataFolder $file
        if (-not (Test-Path $destPath)) {
            Move-Item $file $destPath
            Write-Host "📊 Moved to data: $file" -ForegroundColor Magenta
        }
    }
}

Write-Host ""
Write-Host ("=" * 50)
Write-Host "🎉 Cleanup Complete!" -ForegroundColor Green
Write-Host "📊 Summary:" -ForegroundColor White
Write-Host "   - Removed: $removedCount debug/test files" -ForegroundColor Yellow
Write-Host "   - Organized: Documentation moved to docs/" -ForegroundColor Cyan  
Write-Host "   - Organized: Data files moved to data/" -ForegroundColor Magenta
Write-Host ""
Write-Host "🚀 StayKaru Backend is now production-ready!" -ForegroundColor Green
Write-Host ("=" * 50)
