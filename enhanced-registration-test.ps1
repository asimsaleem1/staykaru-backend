# Enhanced Registration Test
# Tests the new registration endpoint with enhanced fields

Write-Host "=== Enhanced Registration Test ===" -ForegroundColor Cyan
Write-Host "Testing registration with new fields: profileImage, identificationType, identificationNumber, countryCode" -ForegroundColor Yellow

$baseUrl = "https://staykaru-backend-c2959b7b2c66.herokuapp.com"
# $baseUrl = "http://localhost:3000"

# Test data with all new fields
$testUsers = @(
    @{
        name = "Ahmad Khan"
        email = "ahmad.test@example.com"
        password = "password123"
        role = "student"
        phone = "1234567890"
        countryCode = "+92"
        gender = "male"
        profileImage = "https://example.com/profiles/ahmad.jpg"
        identificationType = "cnic"
        identificationNumber = "12345-6789012-3"
    },
    @{
        name = "Sarah Ahmed"
        email = "sarah.test@example.com"
        password = "password123"
        role = "landlord"
        phone = "9876543210"
        countryCode = "+1"
        gender = "female"
        profileImage = "https://example.com/profiles/sarah.jpg"
        identificationType = "passport"
        identificationNumber = "AB123456789"
    },
    @{
        name = "Hassan Ali"
        email = "hassan.test@example.com"
        password = "password123"
        role = "food_provider"
        phone = "5555666777"
        countryCode = "+44"
        gender = "male"
        profileImage = ""
        identificationType = "cnic"
        identificationNumber = "54321-9876543-2"
    }
)

$passCount = 0
$totalTests = $testUsers.Count + 2  # Extra tests for validation

Write-Host "`n--- Testing Enhanced Registration ---" -ForegroundColor Green

foreach ($user in $testUsers) {
    Write-Host "`nTesting registration for: $($user.name) ($($user.role))" -ForegroundColor Yellow
    
    $body = $user | ConvertTo-Json -Depth 3
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $body -ContentType "application/json"
        
        if ($response.message -eq "Registration successful" -and $response.user) {
            Write-Host "✓ Registration successful" -ForegroundColor Green
            Write-Host "  User ID: $($response.user.id)" -ForegroundColor Gray
            Write-Host "  Name: $($response.user.name)" -ForegroundColor Gray
            Write-Host "  Email: $($response.user.email)" -ForegroundColor Gray
            Write-Host "  Role: $($response.user.role)" -ForegroundColor Gray
            Write-Host "  Phone: $($response.user.phone)" -ForegroundColor Gray
            Write-Host "  Country Code: $($response.user.countryCode)" -ForegroundColor Gray
            Write-Host "  Profile Image: $($response.user.profileImage)" -ForegroundColor Gray
            Write-Host "  ID Type: $($response.user.identificationType)" -ForegroundColor Gray
            Write-Host "  ID Number: $($response.user.identificationNumber)" -ForegroundColor Gray
            
            # Verify all fields are present
            $fieldChecks = @(
                ($response.user.name -eq $user.name),
                ($response.user.email -eq $user.email),
                ($response.user.role -eq $user.role),
                ($response.user.phone -eq $user.phone),
                ($response.user.countryCode -eq $user.countryCode),
                ($response.user.gender -eq $user.gender),
                ($response.user.identificationType -eq $user.identificationType),
                ($response.user.identificationNumber -eq $user.identificationNumber)
            )
            
            if ($user.profileImage) {
                $fieldChecks += ($response.user.profileImage -eq $user.profileImage)
            }
            
            if ($fieldChecks -contains $false) {
                Write-Host "✗ Field validation failed" -ForegroundColor Red
            } else {
                Write-Host "✓ All fields validated successfully" -ForegroundColor Green
                $passCount++
            }
        } else {
            Write-Host "✗ Registration failed - Invalid response format" -ForegroundColor Red
            Write-Host "Response: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "✗ Registration failed - $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $errorResponse = $_.Exception.Response | ConvertFrom-Json
            Write-Host "Error details: $($errorResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Red
        }
    }
}

# Test duplicate email validation
Write-Host "`n--- Testing Duplicate Email Validation ---" -ForegroundColor Green
$duplicateUser = @{
    name = "Test Duplicate"
    email = "ahmad.test@example.com"  # Same as first user
    password = "password123"
    role = "student"
    phone = "1111111111"
    countryCode = "+92"
    gender = "male"
    profileImage = "https://example.com/test.jpg"
    identificationType = "cnic"
    identificationNumber = "11111-1111111-1"
}

try {
    $body = $duplicateUser | ConvertTo-Json -Depth 3
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✗ Duplicate email validation failed - Registration should have been rejected" -ForegroundColor Red
}
catch {
    if ($_.Exception.Message -like "*400*" -or $_.Exception.Message -like "*conflict*" -or $_.Exception.Message -like "*exists*") {
        Write-Host "✓ Duplicate email correctly rejected" -ForegroundColor Green
        $passCount++
    } else {
        Write-Host "✗ Unexpected error for duplicate email: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test login with enhanced user
Write-Host "`n--- Testing Login with Enhanced User ---" -ForegroundColor Green
$loginData = @{
    email = "ahmad.test@example.com"
    password = "password123"
}

try {
    $body = $loginData | ConvertTo-Json -Depth 3
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $body -ContentType "application/json"
    
    if ($response.access_token -and $response.user) {
        Write-Host "✓ Login successful" -ForegroundColor Green
        Write-Host "  Access token received: $($response.access_token.Substring(0, 20))..." -ForegroundColor Gray
        Write-Host "  User data includes enhanced fields:" -ForegroundColor Gray
        Write-Host "    Country Code: $($response.user.countryCode)" -ForegroundColor Gray
        Write-Host "    Profile Image: $($response.user.profileImage)" -ForegroundColor Gray
        Write-Host "    ID Type: $($response.user.identificationType)" -ForegroundColor Gray
        Write-Host "    ID Number: $($response.user.identificationNumber)" -ForegroundColor Gray
        $passCount++
    } else {
        Write-Host "✗ Login failed - Invalid response" -ForegroundColor Red
    }
}
catch {
    Write-Host "✗ Login failed - $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host "`n=== Test Summary ===" -ForegroundColor Cyan
Write-Host "Passed: $passCount / $totalTests tests" -ForegroundColor $(if ($passCount -eq $totalTests) { "Green" } else { "Yellow" })

if ($passCount -eq $totalTests) {
    Write-Host "🎉 All enhanced registration tests passed!" -ForegroundColor Green
    Write-Host "✓ New fields working correctly" -ForegroundColor Green
    Write-Host "✓ Registration endpoint enhanced successfully" -ForegroundColor Green
    Write-Host "✓ Login returns enhanced user data" -ForegroundColor Green
    Write-Host "✓ Validation working properly" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Please check the issues above." -ForegroundColor Yellow
}

Write-Host "`nEnhanced registration test completed." -ForegroundColor Cyan
