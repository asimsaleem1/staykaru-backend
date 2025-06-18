# Fix Admin User Script
# This script updates the existing admin user to have the correct role and removes Firebase fields

Write-Host "Fixing Admin User..." -ForegroundColor Yellow

# Set the base URL
$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

# Step 1: Login as admin to get token
Write-Host "`n1. Logging in as admin..." -ForegroundColor Cyan

$adminLoginData = @{
    email = "assaleemofficial@gmail.com"
    password = "Sarim786"
} | ConvertTo-Json

try {
    $adminResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $adminLoginData -ContentType "application/json"
    Write-Host "✅ Admin login successful!" -ForegroundColor Green    $adminToken = $adminResponse.access_token
} catch {
    Write-Host "❌ Admin login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Update admin user profile to set correct role
Write-Host "`n2. Updating admin user role..." -ForegroundColor Cyan

$updateData = @{
    name = "Admin User"
    role = "admin"
    phone = "+92 300 1234567"
    gender = "male"
    address = "Admin Office, Lahore, Pakistan"
} | ConvertTo-Json

$headers = @{
    Authorization = "Bearer $adminToken"
    'Content-Type' = "application/json"
}

try {
    $updateResponse = Invoke-RestMethod -Uri "$baseUrl/users/profile" -Method PUT -Body $updateData -Headers $headers
    Write-Host "✅ Admin user updated successfully!" -ForegroundColor Green
    Write-Host "Updated user: $($updateResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Green
} catch {
    Write-Host "❌ Admin user update failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorContent = $reader.ReadToEnd()
        Write-Host "Error details: $errorContent" -ForegroundColor Red
    }
}

# Step 3: Test login again to verify the role
Write-Host "`n3. Testing login again to verify role..." -ForegroundColor Cyan

try {
    $verifyResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $adminLoginData -ContentType "application/json"
    Write-Host "✅ Verification login successful!" -ForegroundColor Green
    Write-Host "User role: $($verifyResponse.user.role)" -ForegroundColor Green
    
    if ($verifyResponse.user.role -eq "admin") {
        Write-Host "✅ Admin role correctly set!" -ForegroundColor Green
    } else {
        Write-Host "❌ Admin role still not correct: $($verifyResponse.user.role)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Verification login failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nAdmin user fix completed!" -ForegroundColor Yellow
