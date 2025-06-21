# Debug Change Password Field Names Test

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

Write-Host "=== Change Password Field Debug Test ===" -ForegroundColor Green

# Register a new user for testing
$registerData = @{
    name = "Password Field Test User"
    email = "password.field.test.$(Get-Random)@test.com"
    password = "Test123!@#"
    phone = "+1234567890"
    role = "landlord"
    gender = "male"
}

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body ($registerData | ConvertTo-Json) -ContentType "application/json"
    Write-Host "✅ Registration successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Login
$loginData = @{
    email = $registerData.email
    password = $registerData.password
}

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
    $token = $loginResponse.access_token
    Write-Host "✅ Login successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Test 1: Wrong field names (currentPassword)
Write-Host "`nTest 1: Using 'currentPassword' field..." -ForegroundColor Yellow
$changePasswordData1 = @{
    currentPassword = $registerData.password
    newPassword = "NewTest123!@#"
}

try {
    $response1 = Invoke-RestMethod -Uri "$baseUrl/users/change-password" -Method PUT -Body ($changePasswordData1 | ConvertTo-Json) -Headers $headers
    Write-Host "✅ Success with currentPassword field" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed with currentPassword field: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Error details: $responseBody" -ForegroundColor Red
        } catch {
            Write-Host "Could not read error details" -ForegroundColor Red
        }
    }
}

# Test 2: Correct field names (oldPassword)
Write-Host "`nTest 2: Using 'oldPassword' field..." -ForegroundColor Yellow
$changePasswordData2 = @{
    oldPassword = $registerData.password
    newPassword = "NewTest123!@#"
}

try {
    $response2 = Invoke-RestMethod -Uri "$baseUrl/users/change-password" -Method PUT -Body ($changePasswordData2 | ConvertTo-Json) -Headers $headers
    Write-Host "✅ Success with oldPassword field" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed with oldPassword field: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Error details: $responseBody" -ForegroundColor Red
        } catch {
            Write-Host "Could not read error details" -ForegroundColor Red
        }
    }
}

Write-Host "`n=== Field Debug Test Complete ===" -ForegroundColor Green
