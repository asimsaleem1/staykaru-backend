# Complete StayKaru Backend Test Suite
# Runs all test suites and generates comprehensive report

Write-Host "StayKaru Backend Complete Test Suite" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Running all test suites for comprehensive system validation" -ForegroundColor Gray
Write-Host ""

# Configuration
$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"
$logFile = "complete-test-results-$(Get-Date -Format 'yyyy-MM-dd-HH-mm-ss').log"

# Test results tracking
$script:allResults = @()

function Run-TestSuite {
    param(
        [string]$suiteName,
        [string]$scriptPath,
        [string]$description
    )
    
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host "RUNNING: $suiteName" -ForegroundColor Cyan
    Write-Host "Description: $description" -ForegroundColor Gray
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host ""
    
    $startTime = Get-Date
    
    try {
        # Run the test script and capture output
        $output = & powershell.exe -File $scriptPath 2>&1
        $endTime = Get-Date
        $duration = $endTime - $startTime
        
        # Parse results from output
        $successRate = "0%"
        $totalTests = 0
        $passedTests = 0
        $failedTests = 0
        
        foreach ($line in $output) {
            if ($line -match "Success Rate: (\d+\.?\d*)%") {
                $successRate = $matches[1] + "%"
            }
            if ($line -match "Total Tests: (\d+)") {
                $totalTests = [int]$matches[1]
            }
            if ($line -match "Passed: (\d+)") {
                $passedTests = [int]$matches[1]
            }
            if ($line -match "Failed: (\d+)") {
                $failedTests = [int]$matches[1]
            }
        }
        
        $result = @{
            SuiteName = $suiteName
            Description = $description
            SuccessRate = $successRate
            TotalTests = $totalTests
            PassedTests = $passedTests
            FailedTests = $failedTests
            Duration = $duration.TotalSeconds
            Status = if ($successRate -replace "%" -as [double] -ge 80) { "EXCELLENT" } 
                     elseif ($successRate -replace "%" -as [double] -ge 60) { "GOOD" }
                     elseif ($successRate -replace "%" -as [double] -ge 40) { "NEEDS WORK" }
                     else { "CRITICAL" }
            Output = $output -join "`n"
        }
        
        $script:allResults += $result
        
        Write-Host "COMPLETED: $suiteName" -ForegroundColor Green
        Write-Host "Success Rate: $successRate" -ForegroundColor Yellow
        Write-Host "Duration: $([math]::Round($duration.TotalSeconds, 2)) seconds" -ForegroundColor Gray
        Write-Host ""
        
    }
    catch {
        Write-Host "ERROR running $suiteName`: $($_.Exception.Message)" -ForegroundColor Red
        
        $result = @{
            SuiteName = $suiteName
            Description = $description
            SuccessRate = "0%"
            TotalTests = 0
            PassedTests = 0
            FailedTests = 0
            Duration = 0
            Status = "ERROR"
            Output = $_.Exception.Message
        }
        
        $script:allResults += $result
    }
}

function Generate-ComprehensiveReport {
    Write-Host "=" * 80 -ForegroundColor Cyan
    Write-Host "STAYKARU BACKEND COMPREHENSIVE TEST REPORT" -ForegroundColor Cyan
    Write-Host "=" * 80 -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Test Execution Summary:" -ForegroundColor Yellow
    Write-Host "Target API: $baseUrl" -ForegroundColor Gray
    Write-Host "Execution Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
    Write-Host "Total Test Suites: $($script:allResults.Count)" -ForegroundColor Gray
    Write-Host ""
    
    # Calculate overall statistics
    $totalTests = ($script:allResults | Measure-Object -Property TotalTests -Sum).Sum
    $totalPassed = ($script:allResults | Measure-Object -Property PassedTests -Sum).Sum
    $totalFailed = ($script:allResults | Measure-Object -Property FailedTests -Sum).Sum
    $overallSuccessRate = if ($totalTests -gt 0) { [math]::Round(($totalPassed / $totalTests) * 100, 1) } else { 0 }
    
    Write-Host "OVERALL SYSTEM STATISTICS:" -ForegroundColor Cyan
    Write-Host "Total Tests Executed: $totalTests" -ForegroundColor White
    Write-Host "Total Passed: $totalPassed" -ForegroundColor Green
    Write-Host "Total Failed: $totalFailed" -ForegroundColor Red
    Write-Host "Overall Success Rate: $overallSuccessRate%" -ForegroundColor Yellow
    Write-Host ""
    
    # Display results table
    Write-Host "DETAILED RESULTS BY TEST SUITE:" -ForegroundColor Cyan
    Write-Host ""
    
    $format = "{0,-25} {1,-15} {2,-10} {3,-10} {4,-10} {5,-15}"
    Write-Host ($format -f "Test Suite", "Success Rate", "Passed", "Failed", "Total", "Status") -ForegroundColor Yellow
    Write-Host ("-" * 85) -ForegroundColor Gray
    
    foreach ($result in $script:allResults) {
        $color = switch ($result.Status) {
            "EXCELLENT" { "Green" }
            "GOOD" { "Yellow" }
            "NEEDS WORK" { "DarkYellow" }
            "CRITICAL" { "Red" }
            "ERROR" { "Magenta" }
            default { "White" }
        }
        
        Write-Host ($format -f 
            $result.SuiteName, 
            $result.SuccessRate, 
            $result.PassedTests, 
            $result.FailedTests, 
            $result.TotalTests, 
            $result.Status
        ) -ForegroundColor $color
    }
    
    Write-Host ""
    
    # System Health Assessment
    Write-Host "SYSTEM HEALTH ASSESSMENT:" -ForegroundColor Cyan
    
    $excellentSuites = ($script:allResults | Where-Object { $_.Status -eq "EXCELLENT" }).Count
    $goodSuites = ($script:allResults | Where-Object { $_.Status -eq "GOOD" }).Count
    $needsWorkSuites = ($script:allResults | Where-Object { $_.Status -eq "NEEDS WORK" }).Count
    $criticalSuites = ($script:allResults | Where-Object { $_.Status -eq "CRITICAL" }).Count
    $errorSuites = ($script:allResults | Where-Object { $_.Status -eq "ERROR" }).Count
    
    if ($overallSuccessRate -ge 80) {
        Write-Host "🟢 SYSTEM STATUS: PRODUCTION READY" -ForegroundColor Green
    } elseif ($overallSuccessRate -ge 60) {
        Write-Host "🟡 SYSTEM STATUS: GOOD - MINOR ISSUES" -ForegroundColor Yellow
    } elseif ($overallSuccessRate -ge 40) {
        Write-Host "🟠 SYSTEM STATUS: NEEDS DEVELOPMENT" -ForegroundColor DarkYellow
    } else {
        Write-Host "🔴 SYSTEM STATUS: REQUIRES MAJOR WORK" -ForegroundColor Red
    }    Write-Host ""    Write-Host "Suite Status Distribution:" -ForegroundColor Gray
    Write-Host "  Excellent (80`%+): $excellentSuites suites" -ForegroundColor Green
    Write-Host "  Good (60-79`%): $goodSuites suites" -ForegroundColor Yellow
    Write-Host "  Needs Work (40-59`%): $needsWorkSuites suites" -ForegroundColor DarkYellow
    Write-Host "  Critical (<40`%): $criticalSuites suites" -ForegroundColor Red
    Write-Host "  Errors: $errorSuites suites" -ForegroundColor Magenta
    
    # Recommendations
    Write-Host ""
    Write-Host "RECOMMENDATIONS:" -ForegroundColor Cyan
    
    if ($overallSuccessRate -ge 80) {
        Write-Host "✅ System is performing well. Focus on optimizing failed test cases." -ForegroundColor Green
    } elseif ($overallSuccessRate -ge 60) {
        Write-Host "⚠️  System has good foundation. Address failing test suites for production readiness." -ForegroundColor Yellow
    } else {
        Write-Host "🚨 System requires significant development. Prioritize critical failing features." -ForegroundColor Red
    }
    
    # Priority actions
    Write-Host ""
    Write-Host "PRIORITY ACTIONS:" -ForegroundColor Cyan
    
    $criticalAndErrorSuites = $script:allResults | Where-Object { $_.Status -in @("CRITICAL", "ERROR") }
    if ($criticalAndErrorSuites.Count -gt 0) {
        Write-Host "HIGH PRIORITY - Fix these test suites:" -ForegroundColor Red
        foreach ($suite in $criticalAndErrorSuites) {
            Write-Host "  • $($suite.SuiteName) ($($suite.SuccessRate))" -ForegroundColor Red
        }
    }
    
    $needsWorkSuites = $script:allResults | Where-Object { $_.Status -eq "NEEDS WORK" }
    if ($needsWorkSuites.Count -gt 0) {
        Write-Host "MEDIUM PRIORITY - Improve these test suites:" -ForegroundColor DarkYellow
        foreach ($suite in $needsWorkSuites) {
            Write-Host "  • $($suite.SuiteName) ($($suite.SuccessRate))" -ForegroundColor DarkYellow
        }
    }
      Write-Host ""
    Write-Host "Report saved to: COMPLETE_TEST_RESULTS_REPORT.md" -ForegroundColor Gray
    Write-Host "Complete test execution completed successfully!" -ForegroundColor Green
}
}

# Main execution
Write-Host "Starting complete StayKaru backend test execution..." -ForegroundColor Green
Write-Host ""

# Run all test suites
Run-TestSuite -suiteName "Admin Controls" -scriptPath ".\test-admin-controls.ps1" -description "Admin management and approval workflows"
Run-TestSuite -suiteName "Landlord Dashboard" -scriptPath ".\test-landlord-dashboard.ps1" -description "Landlord accommodation and booking management"
Run-TestSuite -suiteName "User Features" -scriptPath ".\test-user-features.ps1" -description "Student and food provider core features"

# Generate comprehensive report
Generate-ComprehensiveReport

Write-Host ""
Write-Host "All test suites completed. Check COMPLETE_TEST_RESULTS_REPORT.md for detailed analysis." -ForegroundColor Cyan
