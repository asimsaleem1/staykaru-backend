# Test script for JWT-based authentication
# This script tests user registration and login with the new JWT authentication system

Write-Host "StayKaru Backend - Authentication Test Script" -ForegroundColor Cyan
Write-Host "--------------------------------------------" -ForegroundColor Cyan

# Configuration
$baseUrl = "http://localhost:3002"  # Updated to match NestJS server port
$testEmail = "test-user-$(Get-Random)@example.com"
$testPassword = "Password123!"
$testName = "Test User"
$testRole = "student"  # Can be: student, landlord, food_provider, admin
$testPhone = "+1234567890"
$testGender = "male"

Write-Host "Test Configuration:" -ForegroundColor Yellow
Write-Host "  Base URL: $baseUrl"
Write-Host "  Test Email: $testEmail"
Write-Host "  Test Name: $testName"
Write-Host "  Test Role: $testRole"
Write-Host ""

# Test 1: User Registration
Write-Host "TEST 1: User Registration" -ForegroundColor Green
$registrationData = @{
    email = $testEmail
    password = $testPassword
    name = $testName
    role = $testRole
    phone = $testPhone
    gender = $testGender
} | ConvertTo-Json

try {
    Write-Host "  Sending registration request..." -ForegroundColor Gray
    $registrationResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $registrationData -ContentType "application/json" -ErrorAction Stop
    Write-Host "  Registration successful!" -ForegroundColor Green
    Write-Host "  User ID: $($registrationResponse.user.id)" -ForegroundColor Green
    Write-Host "  Name: $($registrationResponse.user.name)" -ForegroundColor Green
    Write-Host "  Email: $($registrationResponse.user.email)" -ForegroundColor Green
    Write-Host "  Role: $($registrationResponse.user.role)" -ForegroundColor Green
} catch {
    Write-Host "  Registration failed!" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "  Response: $responseBody" -ForegroundColor Red
        $reader.Close()
    }
}

Write-Host ""

# Test 2: User Login
Write-Host "TEST 2: User Login" -ForegroundColor Green
$loginData = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    Write-Host "  Sending login request..." -ForegroundColor Gray
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginData -ContentType "application/json" -ErrorAction Stop
    Write-Host "  Login successful!" -ForegroundColor Green
    Write-Host "  Access Token: $($loginResponse.access_token.Substring(0, 20))..." -ForegroundColor Green
    Write-Host "  User ID: $($loginResponse.user.id)" -ForegroundColor Green
    Write-Host "  Name: $($loginResponse.user.name)" -ForegroundColor Green
    Write-Host "  Email: $($loginResponse.user.email)" -ForegroundColor Green
    Write-Host "  Role: $($loginResponse.user.role)" -ForegroundColor Green
    
    # Save the token for the next test
    $token = $loginResponse.access_token
} catch {
    Write-Host "  Login failed!" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "  Response: $responseBody" -ForegroundColor Red
        $reader.Close()
    }
}

Write-Host ""

# Test 3: Profile Access (Protected Route)
if ($token) {
    Write-Host "TEST 3: Accessing Protected Profile Route" -ForegroundColor Green
    try {
        Write-Host "  Sending profile request..." -ForegroundColor Gray
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        $profileResponse = Invoke-RestMethod -Uri "$baseUrl/auth/profile" -Method Get -Headers $headers -ErrorAction Stop
        Write-Host "  Profile access successful!" -ForegroundColor Green
        Write-Host "  User ID: $($profileResponse.user._id)" -ForegroundColor Green
        Write-Host "  Name: $($profileResponse.user.name)" -ForegroundColor Green
        Write-Host "  Email: $($profileResponse.user.email)" -ForegroundColor Green
        Write-Host "  Role: $($profileResponse.user.role)" -ForegroundColor Green
    } catch {
        Write-Host "  Profile access failed!" -ForegroundColor Red
        Write-Host "  Error: $_" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "  Response: $responseBody" -ForegroundColor Red
            $reader.Close()
        }
    }
} else {
    Write-Host "TEST 3: Skipped - No access token available" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Authentication Test Script Completed" -ForegroundColor Cyan
Write-Host "--------------------------------------------" -ForegroundColor Cyan
