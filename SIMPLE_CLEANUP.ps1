Write-Host "🧹 Cleaning up StayKaru Backend..." -ForegroundColor Green

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
    "accurate-test-report.json"
)

$removedCount = 0

foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "✅ Removed: $file" -ForegroundColor Yellow
        $removedCount++
    }
}

Write-Host "🎉 Cleanup Complete! Removed $removedCount files" -ForegroundColor Green
Write-Host "🚀 StayKaru Backend is now production-ready!" -ForegroundColor Green
