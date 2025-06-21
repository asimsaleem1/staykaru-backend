# Simple Student Test - Debugging Version

Write-Host "Starting Student Test..." -ForegroundColor Cyan

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"
$testResults = @()

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )
    
    try {
        Write-Host "Testing: $Name" -ForegroundColor Yellow
        
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        
        Write-Host "SUCCESS: $Name" -ForegroundColor Green
        
        $script:testResults += @{
            Test = $Name
            Status = "PASS"
        }
        
        return $response
    }
    catch {
        Write-Host "FAILED: $Name - $($_.Exception.Message)" -ForegroundColor Red
        $script:testResults += @{
            Test = $Name
            Status = "FAIL"
            Error = $_.Exception.Message
        }
        return $null
    }
}

# Test credentials
$studentCredentials = @{
    email = "student@test.com"
    password = "password123"
}

Write-Host "Phase 1: Authentication" -ForegroundColor Magenta

# 1. Student Login
$loginData = @{
    email = $studentCredentials.email
    password = $studentCredentials.password
}

$loginResponse = Test-Endpoint -Name "Student Login" -Method "POST" -Url "$baseUrl/api/auth/login" -Body $loginData

$authToken = ""
$studentId = ""

if ($loginResponse) {
    $authToken = $loginResponse.access_token
    $studentId = $loginResponse.user.id
    Write-Host "Auth Token obtained: $($authToken.Substring(0, 20))..." -ForegroundColor Green
}

$authHeaders = @{
    "Authorization" = "Bearer $authToken"
    "Content-Type" = "application/json"
}

# 2. Get Profile
Test-Endpoint -Name "Get Profile" -Method "GET" -Url "$baseUrl/api/user/profile" -Headers $authHeaders

# 3. Search Accommodations
$searchUrl = "$baseUrl/api/accommodation/search?location=karachi"
Test-Endpoint -Name "Search Accommodations" -Method "GET" -Url $searchUrl -Headers $authHeaders

# Results Summary
Write-Host "`nTest Results Summary:" -ForegroundColor Cyan
$passedTests = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failedTests = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$totalTests = $testResults.Count

Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red

if ($totalTests -gt 0) {
    $successRate = [math]::Round(($passedTests / $totalTests) * 100, 2)
    Write-Host "Success Rate: $successRate%" -ForegroundColor Yellow
}

Write-Host "`nPassed Tests:" -ForegroundColor Green
$testResults | Where-Object { $_.Status -eq "PASS" } | ForEach-Object {
    Write-Host "  ✓ $($_.Test)" -ForegroundColor Green
}

if ($failedTests -gt 0) {
    Write-Host "`nFailed Tests:" -ForegroundColor Red
    $testResults | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
        Write-Host "  ✗ $($_.Test): $($_.Error)" -ForegroundColor Red
    }
}

Write-Host "`nTest completed!" -ForegroundColor Cyan
