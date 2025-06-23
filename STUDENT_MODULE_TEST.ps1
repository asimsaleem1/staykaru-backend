Write-Host "StayKaru Student Module Test" -ForegroundColor Cyan

$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com/api"

# Login as student
$loginBody = '{"email":"test@example.com","password":"password123"}'
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.access_token
$headers = @{ 'Authorization' = "Bearer $token" }

Write-Host "Student authenticated successfully!" -ForegroundColor Green

# Test student endpoints
$endpoints = @(
    "accommodations",
    "food-providers", 
    "user/profile"
)

$passed = 0
$failed = 0

foreach ($endpoint in $endpoints) {
    try {
        Invoke-RestMethod -Uri "$baseUrl/$endpoint" -Headers $headers -Method GET | Out-Null
        Write-Host "OK $endpoint" -ForegroundColor Green
        $passed++
    }
    catch {
        Write-Host "FAIL $endpoint" -ForegroundColor Red
        $failed++  
    }
}

Write-Host ""
Write-Host "Results: $passed passed, $failed failed"
$successRate = [math]::Round(($passed / ($passed + $failed)) * 100, 1)
Write-Host "Student Module Success Rate: $successRate percent"
