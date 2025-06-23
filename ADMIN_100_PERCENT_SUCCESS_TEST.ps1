# StayKaru Admin Module - 100% Success Test Script
# This script ensures all admin endpoints work with 100% success rate

param(
    [string]$BaseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com/api"
)

# Global variables
$script:ADMIN_TOKEN = ""
$script:TEST_RESULTS = @()
$script:TOTAL_TESTS = 0
$script:PASSED_TESTS = 0
$script:FAILED_TESTS = 0

# Helper function to make API requests
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers = @{},
        [object]$Body = $null,
        [string]$TestName = ""
    )
    
    $script:TOTAL_TESTS++
    
    try {
        $requestParams = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $requestParams.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @requestParams
        
        $result = @{
            Success = $true
            StatusCode = 200
            Data = $response
            Error = $null
        }
        
        Write-Host "✅ $TestName - SUCCESS" -ForegroundColor Green
        $script:PASSED_TESTS++
        
        return $result
        
    } catch {
        $statusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { "Unknown" }
        $errorMessage = if ($_.Exception.Response) { 
            try {
                $stream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($stream)
                $errorBody = $reader.ReadToEnd()
                $errorObj = $errorBody | ConvertFrom-Json
                $errorObj.message
            } catch {
                $_.Exception.Message
            }
        } else { 
            $_.Exception.Message 
        }
        
        $result = @{
            Success = $false
            StatusCode = $statusCode
            Data = $null
            Error = $errorMessage
        }
        
        Write-Host "❌ $TestName - FAILED (Status: $statusCode) - $errorMessage" -ForegroundColor Red
        $script:FAILED_TESTS++
        
        return $result
    }
}

# Function to add test result to summary
function Add-TestResult {
    param(
        [string]$TestName,
        [string]$Status,
        [string]$Details = ""
    )
    
    $script:TEST_RESULTS += [PSCustomObject]@{
        Test = $TestName
        Status = $Status
        Details = $Details
    }
}

# Step 1: Create Admin User
function Register-AdminUser {
    Write-Host "`n🔐 Setting up admin user..." -ForegroundColor Cyan
    
    $adminUser = @{
        name = "Admin User"
        email = "admin@staykaru.com"
        password = "Admin123!@#"
        role = "admin"
        phone = "1234567890"
        countryCode = "+1"
        gender = "male"
    }
    
    # Try to register admin user
    $registerResult = Invoke-ApiRequest -Method "POST" -Url "$BaseUrl/auth/register" -Body $adminUser -TestName "Admin Registration"
    
    if ($registerResult.Success) {
        $script:ADMIN_TOKEN = $registerResult.Data.access_token
        Write-Host "✅ Admin user registered and logged in successfully!" -ForegroundColor Green
        Add-TestResult "Admin Registration" "PASS" "User registered and auto-logged in"
        return $true
    } else {
        # Try to login instead (user might already exist)
        $loginResult = Invoke-ApiRequest -Method "POST" -Url "$BaseUrl/auth/login" -Body @{
            email = $adminUser.email
            password = $adminUser.password
        } -TestName "Admin Login"
        
        if ($loginResult.Success) {
            $script:ADMIN_TOKEN = $loginResult.Data.access_token
            Write-Host "✅ Admin user logged in successfully!" -ForegroundColor Green
            Add-TestResult "Admin Login" "PASS" "User exists and logged in successfully"
            return $true
        } else {
            Write-Host "❌ Failed to setup admin user" -ForegroundColor Red
            Add-TestResult "Admin Setup" "FAIL" "Neither registration nor login worked"
            return $false
        }
    }
}

# Function to get auth headers
function Get-AuthHeaders {
    return @{
        "Authorization" = "Bearer $script:ADMIN_TOKEN"
        "Content-Type" = "application/json"
    }
}

# Step 2: Test All Admin Analytics Endpoints
function Test-AdminAnalytics {
    Write-Host "`n📊 Testing Admin Analytics..." -ForegroundColor Cyan
    
    $headers = Get-AuthHeaders
    
    # Dashboard Analytics
    $result = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/admin/analytics/dashboard" -Headers $headers -TestName "Dashboard Analytics"
    Add-TestResult "Dashboard Analytics" $(if ($result.Success) { "PASS" } else { "FAIL" }) $result.Error
    
    # User Analytics
    $result = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/admin/analytics/users" -Headers $headers -TestName "User Analytics"
    Add-TestResult "User Analytics" $(if ($result.Success) { "PASS" } else { "FAIL" }) $result.Error
    
    # Revenue Analytics
    $result = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/admin/analytics/revenue" -Headers $headers -TestName "Revenue Analytics"
    Add-TestResult "Revenue Analytics" $(if ($result.Success) { "PASS" } else { "FAIL" }) $result.Error
    
    # Booking Analytics
    $result = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/admin/analytics/bookings" -Headers $headers -TestName "Booking Analytics"
    Add-TestResult "Booking Analytics" $(if ($result.Success) { "PASS" } else { "FAIL" }) $result.Error
}

# Step 3: Test User Management
function Test-UserManagement {
    Write-Host "`n👥 Testing User Management..." -ForegroundColor Cyan
    
    $headers = Get-AuthHeaders
    
    # Get all users
    $result = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/admin/users" -Headers $headers -TestName "Get All Users"
    Add-TestResult "Get All Users" $(if ($result.Success) { "PASS" } else { "FAIL" }) $result.Error
    
    # User search
    $result = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/admin/users?search=test" -Headers $headers -TestName "User Search"
    Add-TestResult "User Search" $(if ($result.Success) { "PASS" } else { "FAIL" }) $result.Error
    
    # User statistics (will be implemented)
    $result = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/admin/users/statistics" -Headers $headers -TestName "User Statistics"
    Add-TestResult "User Statistics" $(if ($result.Success) { "PASS" } else { "FAIL" }) $result.Error
}

# Step 4: Test Accommodation Management
function Test-AccommodationManagement {
    Write-Host "`n🏠 Testing Accommodation Management..." -ForegroundColor Cyan
    
    $headers = Get-AuthHeaders
    
    # Get all accommodations
    $result = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/admin/accommodations" -Headers $headers -TestName "Get All Accommodations"
    Add-TestResult "Get All Accommodations" $(if ($result.Success) { "PASS" } else { "FAIL" }) $result.Error
    
    # Accommodation statistics
    $result = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/admin/accommodations/statistics" -Headers $headers -TestName "Accommodation Statistics"
    Add-TestResult "Accommodation Statistics" $(if ($result.Success) { "PASS" } else { "FAIL" }) $result.Error
    
    # Pending approvals
    $result = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/admin/accommodations?status=pending" -Headers $headers -TestName "Pending Approvals"
    Add-TestResult "Pending Approvals" $(if ($result.Success) { "PASS" } else { "FAIL" }) $result.Error
}

# Step 5: Test Food Service Management
function Test-FoodServiceManagement {
    Write-Host "`n🍕 Testing Food Service Management..." -ForegroundColor Cyan
    
    $headers = Get-AuthHeaders
    
    # Get all food services
    $result = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/admin/food-services" -Headers $headers -TestName "Get All Food Services"
    Add-TestResult "Get All Food Services" $(if ($result.Success) { "PASS" } else { "FAIL" }) $result.Error
    
    # Food service statistics
    $result = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/admin/food-services/statistics" -Headers $headers -TestName "Food Service Statistics"
    Add-TestResult "Food Service Statistics" $(if ($result.Success) { "PASS" } else { "FAIL" }) $result.Error
    
    # Provider reports
    $result = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/admin/food-services/reports" -Headers $headers -TestName "Provider Reports"
    Add-TestResult "Provider Reports" $(if ($result.Success) { "PASS" } else { "FAIL" }) $result.Error
}

# Step 6: Test Booking and Order Management
function Test-BookingOrderManagement {
    Write-Host "`n📋 Testing Booking and Order Management..." -ForegroundColor Cyan
    
    $headers = Get-AuthHeaders
    
    # Get all bookings
    $result = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/admin/bookings" -Headers $headers -TestName "Get All Bookings"
    Add-TestResult "Get All Bookings" $(if ($result.Success) { "PASS" } else { "FAIL" }) $result.Error
    
    # Get all orders
    $result = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/admin/orders" -Headers $headers -TestName "Get All Orders"
    Add-TestResult "Get All Orders" $(if ($result.Success) { "PASS" } else { "FAIL" }) $result.Error
}

# Step 7: Test Content Moderation
function Test-ContentModeration {
    Write-Host "`n🛡 Testing Content Moderation..." -ForegroundColor Cyan
    
    $headers = Get-AuthHeaders
    
    # Content reports
    $result = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/admin/content/reports" -Headers $headers -TestName "Content Reports"
    Add-TestResult "Content Reports" $(if ($result.Success) { "PASS" } else { "FAIL" }) $result.Error
    
    # Review queue
    $result = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/admin/content/review-queue" -Headers $headers -TestName "Review Queue"
    Add-TestResult "Review Queue" $(if ($result.Success) { "PASS" } else { "FAIL" }) $result.Error
    
    # Moderation statistics
    $result = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/admin/content/statistics" -Headers $headers -TestName "Moderation Statistics"
    Add-TestResult "Moderation Statistics" $(if ($result.Success) { "PASS" } else { "FAIL" }) $result.Error
}

# Step 8: Test Financial Management
function Test-FinancialManagement {
    Write-Host "`n💳 Testing Financial Management..." -ForegroundColor Cyan
    
    $headers = Get-AuthHeaders
    
    # All transactions
    $result = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/admin/transactions" -Headers $headers -TestName "Get All Transactions"
    Add-TestResult "Get All Transactions" $(if ($result.Success) { "PASS" } else { "FAIL" }) $result.Error
    
    # Revenue reports
    $result = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/admin/reports/revenue" -Headers $headers -TestName "Revenue Reports"
    Add-TestResult "Revenue Reports" $(if ($result.Success) { "PASS" } else { "FAIL" }) $result.Error
    
    # Payment statistics
    $result = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/admin/payments/statistics" -Headers $headers -TestName "Payment Statistics"
    Add-TestResult "Payment Statistics" $(if ($result.Success) { "PASS" } else { "FAIL" }) $result.Error
    
    # Commission reports
    $result = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/admin/commissions" -Headers $headers -TestName "Commission Reports"
    Add-TestResult "Commission Reports" $(if ($result.Success) { "PASS" } else { "FAIL" }) $result.Error
}

# Step 9: Test System Management
function Test-SystemManagement {
    Write-Host "`n📋 Testing System Management..." -ForegroundColor Cyan
    
    $headers = Get-AuthHeaders
    
    # System health
    $result = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/admin/system/health" -Headers $headers -TestName "System Health"
    Add-TestResult "System Health" $(if ($result.Success) { "PASS" } else { "FAIL" }) $result.Error
    
    # Error logs
    $result = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/admin/system/logs" -Headers $headers -TestName "Error Logs"
    Add-TestResult "Error Logs" $(if ($result.Success) { "PASS" } else { "FAIL" }) $result.Error
    
    # Performance metrics
    $result = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/admin/system/performance" -Headers $headers -TestName "Performance Metrics"
    Add-TestResult "Performance Metrics" $(if ($result.Success) { "PASS" } else { "FAIL" }) $result.Error
}

# Step 10: Test Data Export
function Test-DataExport {
    Write-Host "`n📤 Testing Data Export..." -ForegroundColor Cyan
    
    $headers = Get-AuthHeaders
    
    # Export users
    $result = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/admin/export/users" -Headers $headers -TestName "Export Users"
    Add-TestResult "Export Users" $(if ($result.Success) { "PASS" } else { "FAIL" }) $result.Error
    
    # Export bookings
    $result = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/admin/export/bookings" -Headers $headers -TestName "Export Bookings"
    Add-TestResult "Export Bookings" $(if ($result.Success) { "PASS" } else { "FAIL" }) $result.Error
    
    # Export transactions
    $result = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/admin/export/transactions" -Headers $headers -TestName "Export Transactions"
    Add-TestResult "Export Transactions" $(if ($result.Success) { "PASS" } else { "FAIL" }) $result.Error
}

# Main execution
function Main {
    Write-Host "============================================================" -ForegroundColor Magenta
    Write-Host "🚀 STAYKARU ADMIN MODULE - 100% SUCCESS TEST" -ForegroundColor Magenta
    Write-Host "============================================================" -ForegroundColor Magenta
    Write-Host "API Base: $BaseUrl" -ForegroundColor White
    Write-Host ""
    
    # Step 1: Setup admin user
    if (-not (Register-AdminUser)) {
        Write-Host "❌ Cannot proceed without admin access" -ForegroundColor Red
        return
    }
    
    # Step 2: Run all tests
    Test-AdminAnalytics
    Test-UserManagement
    Test-AccommodationManagement
    Test-FoodServiceManagement
    Test-BookingOrderManagement
    Test-ContentModeration
    Test-FinancialManagement
    Test-SystemManagement
    Test-DataExport
    
    # Generate summary
    Write-Host "`n============================================================" -ForegroundColor Green
    Write-Host "🏁 STAYKARU ADMIN MODULE TEST RESULTS" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host "📊 Overall Statistics:" -ForegroundColor White
    Write-Host "   Total Tests: $script:TOTAL_TESTS" -ForegroundColor White
    Write-Host "   Successful: $script:PASSED_TESTS" -ForegroundColor Green
    Write-Host "   Failed: $script:FAILED_TESTS" -ForegroundColor Red
    $successRate = if ($script:TOTAL_TESTS -gt 0) { [math]::Round(($script:PASSED_TESTS / $script:TOTAL_TESTS) * 100, 1) } else { 0 }
    Write-Host "   Success Rate: $successRate%" -ForegroundColor $(if ($successRate -eq 100) { "Green" } else { "Yellow" })
    
    Write-Host "`n📋 Detailed Results:" -ForegroundColor White
    $script:TEST_RESULTS | Format-Table -AutoSize
    
    # Determine final status
    $finalStatus = if ($successRate -eq 100) { "✅ 100% SUCCESS ACHIEVED!" } else { "⚠️  NEEDS ATTENTION" }
    Write-Host "`n🎯 Final Status: $finalStatus" -ForegroundColor $(if ($successRate -eq 100) { "Green" } else { "Yellow" })
    
    # Save detailed report
    $report = @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        totalTests = $script:TOTAL_TESTS
        passedTests = $script:PASSED_TESTS
        failedTests = $script:FAILED_TESTS
        successRate = $successRate
        results = $script:TEST_RESULTS
    }
    
    $reportJson = $report | ConvertTo-Json -Depth 10
    $reportFileName = "ADMIN_MODULE_TEST_RESULTS_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
    $reportJson | Out-File -FilePath $reportFileName -Encoding UTF8
    
    Write-Host "`n💡 Recommendations:" -ForegroundColor Yellow
    if ($script:FAILED_TESTS -gt 0) {
        Write-Host "   • Review failed endpoints and implement missing functionality" -ForegroundColor Yellow
        Write-Host "   • Check admin role permissions in guards" -ForegroundColor Yellow
        Write-Host "   • Ensure all required services are properly injected" -ForegroundColor Yellow
        Write-Host "   • Verify database models and relationships" -ForegroundColor Yellow
    } else {
        Write-Host "   • All admin endpoints are working perfectly!" -ForegroundColor Green
        Write-Host "   • Admin module is ready for production use" -ForegroundColor Green
    }
    
    Write-Host "`n📄 Detailed report saved to: $reportFileName" -ForegroundColor Green
}

# Run the main function
Main
