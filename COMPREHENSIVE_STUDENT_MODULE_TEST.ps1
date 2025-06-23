# 🎓 StayKaru Backend - Comprehensive Student Module Testing
# This script tests all student-specific endpoints with real data scenarios
# Author: GitHub Copilot Assistant
# Date: $(Get-Date -Format 'yyyy-MM-dd')

param(
    [string]$BaseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com/api"
)

# Colors for output
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"
$Magenta = "Magenta"

# Test results storage
$script:passCount = 0
$script:failCount = 0

# Helper function for updating test counts
function Update-TestCounts {
    param(
        [bool]$passed,
        [int]$count = 1
    )
    
    if ($passed) {
        $script:passCount += $count
    } else {
        $script:failCount += $count
    }
}

# Helper function for making HTTP requests
function Invoke-ApiRequest {
    param(
        [string]$method,
        [string]$endpoint,
        [object]$body = $null,
        [hashtable]$headers = @{},
        [string]$testName
    )

    $uri = "$BaseUrl$endpoint"
    Write-Host "`nMaking request to: $uri"

    if ($body) {
        if ($body -is [hashtable] -or $body -is [System.Collections.Specialized.OrderedDictionary]) {
            $jsonBody = $body | ConvertTo-Json -Depth 10
        } else {
            $jsonBody = $body
        }
        Write-Host "Request body: $jsonBody"
    }

    try {
        if ($method -eq "GET") {
            $response = Invoke-RestMethod -Uri $uri -Method $method -Headers $headers -ContentType "application/json"
        } else {
            $response = Invoke-RestMethod -Uri $uri -Method $method -Body $jsonBody -Headers $headers -ContentType "application/json"
        }

        Write-Host "Response received: $($response | ConvertTo-Json -Depth 10)"
        if ($testName) {
            Write-Host "`nPASS: $testName"
            Write-Host "   Successfully completed $method $endpoint"
            Update-TestCounts -passed $true
        }
        return $response
    } catch {
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $errorBody = $reader.ReadToEnd()
            Write-Host "`nRequest failed: $errorBody"
        }
        if ($testName) {
            Write-Host "`nFAIL: $testName"
            Write-Host "   Failed to test endpoints: $method $endpoint failed: $($_.Exception.Message)"
            Update-TestCounts -passed $false
        }
        throw
    }
}

# 1. Student Registration and Login
try {
    $studentCredentials = @{
        email = "test.student@staykaru.com"
        password = "Test123!"
        name = "Test Student"
        phone = "1234567890"
        gender = "other"
        role = "student"
        countryCode = "+91"
    }

    try {
        $registerResult = Invoke-ApiRequest -method "POST" -endpoint "/auth/register" -body $studentCredentials -testName "Student Registration"
    } catch {
        Write-Host "Note: Student may already exist, continuing with login..."
    }

    $loginBody = @{
        email = $studentCredentials.email
        password = $studentCredentials.password
    }

    $loginResult = Invoke-ApiRequest -method "POST" -endpoint "/auth/login" -body $loginBody -testName "Student Login"
    $token = $loginResult.access_token
    $headers = @{ "Authorization" = "Bearer $token" }
} catch {
    throw
}

# 2. Get Accommodation Listings
try {
    $accommodations = Invoke-ApiRequest -method "GET" -endpoint "/accommodations" -headers $headers -testName "List Accommodations"
    $testAccommodation = $accommodations[0]

    # Get single accommodation
    $singleAccommodation = Invoke-ApiRequest -method "GET" -endpoint "/accommodations/$($testAccommodation._id)" -headers $headers -testName "Get Single Accommodation"
} catch {
    throw
}

# 3. Create Booking
try {
    # Booking Creation
    $bookingBody = @{
        accommodation = "6837134eb51e43e39bf7024e"
        start_date = "2025-06-01T00:00:00.000Z"
        end_date = "2025-06-02T00:00:00.000Z"
        guests = 2
        payment_method = "card"
        total_amount = 500
        special_requests = "Test booking request"
    } | ConvertTo-Json

    $bookingResult = Invoke-ApiRequest -method "POST" -endpoint "/bookings" -body $bookingBody -headers $headers -testName "Booking Endpoints"
} catch {
    # Continue testing even if booking fails
}

# 4. Food Service Testing
try {
    # Get food providers
    $foodProviders = Invoke-ApiRequest -method "GET" -endpoint "/food-providers" -headers $headers -testName "List Food Providers"
    $testProvider = $foodProviders[0]

    # Get menu items for selected provider
    $menuItems = Invoke-ApiRequest -method "GET" -endpoint "/menu-items?foodProvider=$($testProvider._id)" -headers $headers -testName "Get Provider Menu"
    $testMenuItem = $menuItems[0]

    # Create order
    $orderBody = @{
        food_provider = "68371acd0529ec2181c4b728"
        items = @(
            @{
                menu_item = "68371dfe492f35a187f47446"
                quantity = 2
                special_instructions = "Test order item"
            }
        )
        delivery_location = @{
            coordinates = @{
                longitude = 77.5946
                latitude = 12.9716
            }
            address = "Test Address, Room 123"
            landmark = "Near Test Landmark"
        }
        delivery_instructions = "Test delivery instructions"
        total_amount = 500
    } | ConvertTo-Json -Depth 10

    $orderResult = Invoke-ApiRequest -method "POST" -endpoint "/orders" -body $orderBody -headers $headers -testName "Food Service Endpoints"
} catch {
    # Continue testing even if food service fails
}

# Print Summary
Write-Host "`nTest Results Summary"
Write-Host "Total Tests: $($script:passCount + $script:failCount)"
Write-Host "Passed: $script:passCount"
Write-Host "Failed: $script:failCount"

# Save detailed results
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$testResults = @{
    totalTests = $script:passCount + $script:failCount
    passed = $script:passCount
    failed = $script:failCount
}
$testResults | ConvertTo-Json -Depth 10 | Out-File "STUDENT_MODULE_TEST_RESULTS_$timestamp.json"
Write-Host "Detailed results saved to: STUDENT_MODULE_TEST_RESULTS_$timestamp.json"
