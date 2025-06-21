# Quick Profile Debug Test
$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"
$testEmail = "student.dashboard.test.$(Get-Random)@university.edu"
$testPassword = "StudentTest123!"

# Login
$loginData = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    # Register first
    $regResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body (@{
        email = $testEmail
        password = $testPassword
        name = "Debug Test Student"
        role = "student"
        phone = "+1$(Get-Random -Minimum 1000000000 -Maximum 9999999999)"
        gender = "male"
    } | ConvertTo-Json) -ContentType "application/json"
    
    Write-Host "Registration Response:" -ForegroundColor Yellow
    $regResponse | ConvertTo-Json -Depth 10
    
    # Login
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    
    Write-Host "`nLogin Response:" -ForegroundColor Yellow
    $loginResponse | ConvertTo-Json -Depth 10
    
    if ($loginResponse.access_token) {
        # Get Profile
        $headers = @{
            "Authorization" = "Bearer $($loginResponse.access_token)"
            "Content-Type" = "application/json"
        }
        
        $profileResponse = Invoke-RestMethod -Uri "$baseUrl/auth/profile" -Method GET -Headers $headers
        
        Write-Host "`nProfile Response:" -ForegroundColor Yellow
        $profileResponse | ConvertTo-Json -Depth 10
        
        Write-Host "`nProfile Properties:" -ForegroundColor Yellow
        $profileResponse | Get-Member -MemberType Properties
    }
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}
