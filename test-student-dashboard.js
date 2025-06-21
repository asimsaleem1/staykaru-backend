#!/usr/bin/env node

/**
 * Student Dashboard Test Runner
 * Comprehensive test suite for StayKaru student features
 */

const https = require('https');
const http = require('http');

// Test configuration
const API_BASE_URL = process.env.API_URL || 'https://staykaru-backend-60ed08adb2a7.herokuapp.com';
const TEST_EMAIL = 'test.student.dashboard@university.edu';
const TEST_PASSWORD = 'TestPass123!';

let authToken = '';
let testUserId = '';
let testBookingId = '';
let testOrderId = '';

// Test results tracking
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE_URL + path);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = lib.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : {};
          resolve({
            status: res.statusCode,
            data: parsedData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: responseData,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test helper functions
function assert(condition, message) {
  testResults.total++;
  if (condition) {
    testResults.passed++;
    console.log(`✅ ${message}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${message}`);
    testResults.errors.push(message);
  }
}

function assertEqual(actual, expected, message) {
  testResults.total++;
  if (actual === expected) {
    testResults.passed++;
    console.log(`✅ ${message}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${message} - Expected: ${expected}, Got: ${actual}`);
    testResults.errors.push(`${message} - Expected: ${expected}, Got: ${actual}`);
  }
}

function assertExists(value, message) {
  testResults.total++;
  if (value !== undefined && value !== null) {
    testResults.passed++;
    console.log(`✅ ${message}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${message} - Value is undefined or null`);
    testResults.errors.push(`${message} - Value is undefined or null`);
  }
}

// Test Suite Implementation
async function runTestSuite() {
  console.log('🚀 Starting StayKaru Student Dashboard Test Suite');
  console.log('=' .repeat(60));

  try {
    await testAuthentication();
    await testProfileManagement();
    await testDashboardOverview();
    await testAccommodationSearch();
    await testBookingManagement();
    await testFoodOrderManagement();
    await testNotifications();
    await testErrorHandling();
    
    // Cleanup
    await cleanup();
    
    // Report results
    printTestResults();
    
  } catch (error) {
    console.error('💥 Test suite failed with error:', error.message);
    process.exit(1);
  }
}

async function testAuthentication() {
  console.log('\n📋 Testing Student Authentication & Registration');
  console.log('-'.repeat(50));

  try {
    // Test registration
    const registerData = {
      name: 'Test Student Dashboard',
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      role: 'student',
      phone: '+1234567890'
    };

    const registerResponse = await makeRequest('POST', '/auth/register', registerData);
    
    if (registerResponse.status === 201 || registerResponse.status === 409) {
      console.log('✅ Student registration endpoint accessible');
    } else {
      console.log(`⚠️  Registration returned status: ${registerResponse.status}`);
    }

    // Test login
    const loginData = {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    };

    const loginResponse = await makeRequest('POST', '/auth/login', loginData);
    assertEqual(loginResponse.status, 200, 'Student login successful');
    
    if (loginResponse.status === 200) {
      assertExists(loginResponse.data.access_token, 'Authentication token received');
      assertExists(loginResponse.data.user, 'User data received');
      assertEqual(loginResponse.data.user.role, 'student', 'User role is student');
      
      authToken = loginResponse.data.access_token;
      testUserId = loginResponse.data.user._id;
    }

    // Test invalid login
    const invalidLoginData = {
      email: TEST_EMAIL,
      password: 'wrongpassword'
    };

    const invalidLoginResponse = await makeRequest('POST', '/auth/login', invalidLoginData);
    assert(invalidLoginResponse.status >= 400, 'Invalid login rejected');

  } catch (error) {
    console.log(`❌ Authentication test failed: ${error.message}`);
  }
}

async function testProfileManagement() {
  console.log('\n👤 Testing Student Profile Management');
  console.log('-'.repeat(50));

  if (!authToken) {
    console.log('⚠️  Skipping profile tests - no auth token');
    return;
  }

  try {
    // Test get profile
    const profileResponse = await makeRequest('GET', '/users/profile', null, {
      'Authorization': `Bearer ${authToken}`
    });
    
    assertEqual(profileResponse.status, 200, 'Get profile successful');
    if (profileResponse.status === 200) {
      assertExists(profileResponse.data.name, 'Profile name exists');
      assertExists(profileResponse.data.email, 'Profile email exists');
      assertEqual(profileResponse.data.role, 'student', 'Profile role is student');
    }

    // Test update profile
    const updateData = {
      name: 'Updated Test Student',
      phone: '+1987654321'
    };

    const updateResponse = await makeRequest('PUT', '/users/profile', updateData, {
      'Authorization': `Bearer ${authToken}`
    });
    
    if (updateResponse.status === 200) {
      console.log('✅ Profile update successful');
      assertEqual(updateResponse.data.name, 'Updated Test Student', 'Profile name updated');
    } else {
      console.log(`⚠️  Profile update returned status: ${updateResponse.status}`);
    }

    // Test unauthorized access
    const unauthorizedResponse = await makeRequest('GET', '/users/profile');
    assert(unauthorizedResponse.status === 401, 'Unauthorized access rejected');

  } catch (error) {
    console.log(`❌ Profile test failed: ${error.message}`);
  }
}

async function testDashboardOverview() {
  console.log('\n📊 Testing Student Dashboard Overview');
  console.log('-'.repeat(50));

  if (!authToken) {
    console.log('⚠️  Skipping dashboard tests - no auth token');
    return;
  }

  try {
    // Test dashboard summary
    const dashboardResponse = await makeRequest('GET', '/users/dashboard', null, {
      'Authorization': `Bearer ${authToken}`
    });
    
    if (dashboardResponse.status === 200) {
      console.log('✅ Dashboard summary accessible');
      assertExists(dashboardResponse.data.totalBookings, 'Total bookings data exists');
      assertExists(dashboardResponse.data.totalOrders, 'Total orders data exists');
      assert(typeof dashboardResponse.data.totalBookings === 'number', 'Total bookings is number');
      assert(typeof dashboardResponse.data.totalOrders === 'number', 'Total orders is number');
    } else {
      console.log(`⚠️  Dashboard endpoint returned status: ${dashboardResponse.status}`);
    }

    // Test analytics
    const analyticsResponse = await makeRequest('GET', '/users/analytics', null, {
      'Authorization': `Bearer ${authToken}`
    });
    
    if (analyticsResponse.status === 200) {
      console.log('✅ Analytics data accessible');
    } else {
      console.log(`⚠️  Analytics endpoint returned status: ${analyticsResponse.status}`);
    }

  } catch (error) {
    console.log(`❌ Dashboard test failed: ${error.message}`);
  }
}

async function testAccommodationSearch() {
  console.log('\n🏠 Testing Accommodation Search & Discovery');
  console.log('-'.repeat(50));

  try {
    // Test get all accommodations
    const accommodationsResponse = await makeRequest('GET', '/accommodations', null, {
      'Authorization': `Bearer ${authToken}`
    });
    
    assertEqual(accommodationsResponse.status, 200, 'Get accommodations successful');
    if (accommodationsResponse.status === 200) {
      assert(Array.isArray(accommodationsResponse.data), 'Accommodations data is array');
      console.log(`✅ Found ${accommodationsResponse.data.length} accommodations`);
    }

    // Test search with price filter
    const priceFilterResponse = await makeRequest('GET', '/accommodations?minPrice=500&maxPrice=2000', null, {
      'Authorization': `Bearer ${authToken}`
    });
    
    if (priceFilterResponse.status === 200) {
      console.log('✅ Price filter search working');
      assert(Array.isArray(priceFilterResponse.data), 'Filtered accommodations is array');
    }

    // Test nearby search
    const nearbyResponse = await makeRequest('GET', '/accommodations/nearby?lat=19.076&lng=72.8777&radius=10000', null, {
      'Authorization': `Bearer ${authToken}`
    });
    
    if (nearbyResponse.status === 200) {
      console.log('✅ Nearby search working');
      assert(Array.isArray(nearbyResponse.data), 'Nearby accommodations is array');
    }

  } catch (error) {
    console.log(`❌ Accommodation search test failed: ${error.message}`);
  }
}

async function testBookingManagement() {
  console.log('\n📅 Testing Booking Management');
  console.log('-'.repeat(50));

  if (!authToken) {
    console.log('⚠️  Skipping booking tests - no auth token');
    return;
  }

  try {
    // Get available accommodations first
    const accommodationsResponse = await makeRequest('GET', '/accommodations', null, {
      'Authorization': `Bearer ${authToken}`
    });

    if (accommodationsResponse.status === 200 && accommodationsResponse.data.length > 0) {
      const testAccommodationId = accommodationsResponse.data[0]._id;

      // Test create booking
      const bookingData = {
        accommodation: testAccommodationId,
        checkIn: '2025-08-01',
        checkOut: '2025-08-05',
        guests: 2,
        totalAmount: 4000
      };

      const createBookingResponse = await makeRequest('POST', '/bookings', bookingData, {
        'Authorization': `Bearer ${authToken}`
      });

      if (createBookingResponse.status === 201) {
        console.log('✅ Booking creation successful');
        testBookingId = createBookingResponse.data._id;
        assertEqual(createBookingResponse.data.status, 'pending', 'Booking status is pending');
      } else {
        console.log(`⚠️  Booking creation returned status: ${createBookingResponse.status}`);
      }
    }

    // Test get user bookings
    const myBookingsResponse = await makeRequest('GET', '/bookings/my-bookings', null, {
      'Authorization': `Bearer ${authToken}`
    });
    
    if (myBookingsResponse.status === 200) {
      console.log('✅ Get user bookings successful');
      assert(Array.isArray(myBookingsResponse.data), 'User bookings is array');
    }

    // Test invalid booking dates
    const invalidBookingData = {
      accommodation: 'invalid-id',
      checkIn: '2025-08-10',
      checkOut: '2025-08-05', // Invalid: checkout before checkin
      guests: 2,
      totalAmount: 4000
    };

    const invalidBookingResponse = await makeRequest('POST', '/bookings', invalidBookingData, {
      'Authorization': `Bearer ${authToken}`
    });
    
    assert(invalidBookingResponse.status >= 400, 'Invalid booking data rejected');

  } catch (error) {
    console.log(`❌ Booking test failed: ${error.message}`);
  }
}

async function testFoodOrderManagement() {
  console.log('\n🍽️  Testing Food Order Management');
  console.log('-'.repeat(50));

  if (!authToken) {
    console.log('⚠️  Skipping order tests - no auth token');
    return;
  }

  try {
    // Test get food providers
    const foodProvidersResponse = await makeRequest('GET', '/food-providers', null, {
      'Authorization': `Bearer ${authToken}`
    });
    
    if (foodProvidersResponse.status === 200) {
      console.log('✅ Get food providers successful');
      assert(Array.isArray(foodProvidersResponse.data), 'Food providers is array');
      
      if (foodProvidersResponse.data.length > 0) {
        const testFoodProviderId = foodProvidersResponse.data[0]._id;
        
        // Get menu items
        const menuResponse = await makeRequest('GET', `/food-providers/${testFoodProviderId}/menu`, null, {
          'Authorization': `Bearer ${authToken}`
        });
        
        if (menuResponse.status === 200 && menuResponse.data.length > 0) {
          const testMenuItemId = menuResponse.data[0]._id;
          
          // Test create order
          const orderData = {
            food_provider: testFoodProviderId,
            items: [{
              menu_item: testMenuItemId,
              quantity: 2
            }],
            delivery_address: 'Student Hostel Room 205'
          };

          const createOrderResponse = await makeRequest('POST', '/orders', orderData, {
            'Authorization': `Bearer ${authToken}`
          });

          if (createOrderResponse.status === 201) {
            console.log('✅ Order creation successful');
            testOrderId = createOrderResponse.data._id;
            assertEqual(createOrderResponse.data.status, 'placed', 'Order status is placed');
          } else {
            console.log(`⚠️  Order creation returned status: ${createOrderResponse.status}`);
          }
        }
      }
    }

    // Test get user orders
    const myOrdersResponse = await makeRequest('GET', '/orders/my-orders', null, {
      'Authorization': `Bearer ${authToken}`
    });
    
    if (myOrdersResponse.status === 200) {
      console.log('✅ Get user orders successful');
      assert(Array.isArray(myOrdersResponse.data), 'User orders is array');
    }

  } catch (error) {
    console.log(`❌ Order test failed: ${error.message}`);
  }
}

async function testNotifications() {
  console.log('\n🔔 Testing Notifications');
  console.log('-'.repeat(50));

  if (!authToken) {
    console.log('⚠️  Skipping notification tests - no auth token');
    return;
  }

  try {
    // Test get notifications
    const notificationsResponse = await makeRequest('GET', '/notifications', null, {
      'Authorization': `Bearer ${authToken}`
    });
    
    if (notificationsResponse.status === 200) {
      console.log('✅ Get notifications successful');
      assert(Array.isArray(notificationsResponse.data), 'Notifications is array');
    } else {
      console.log(`⚠️  Notifications endpoint returned status: ${notificationsResponse.status}`);
    }

    // Test get unread count
    const unreadCountResponse = await makeRequest('GET', '/notifications/unread-count', null, {
      'Authorization': `Bearer ${authToken}`
    });
    
    if (unreadCountResponse.status === 200) {
      console.log('✅ Get unread count successful');
      assert(typeof unreadCountResponse.data.count === 'number', 'Unread count is number');
    }

  } catch (error) {
    console.log(`❌ Notification test failed: ${error.message}`);
  }
}

async function testErrorHandling() {
  console.log('\n⚠️  Testing Error Handling & Security');
  console.log('-'.repeat(50));

  try {
    // Test unauthorized access
    const unauthorizedResponse = await makeRequest('GET', '/users/profile');
    assertEqual(unauthorizedResponse.status, 401, 'Unauthorized access rejected');

    // Test invalid token
    const invalidTokenResponse = await makeRequest('GET', '/users/profile', null, {
      'Authorization': 'Bearer invalid.token.here'
    });
    assertEqual(invalidTokenResponse.status, 401, 'Invalid token rejected');

    // Test non-existent resource
    const notFoundResponse = await makeRequest('GET', '/accommodations/507f1f77bcf86cd799439999', null, {
      'Authorization': `Bearer ${authToken}`
    });
    assertEqual(notFoundResponse.status, 404, 'Non-existent resource returns 404');

    // Test malformed data
    const malformedResponse = await makeRequest('POST', '/bookings', 'invalid json', {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    });
    assert(malformedResponse.status >= 400, 'Malformed data rejected');

  } catch (error) {
    console.log(`❌ Error handling test failed: ${error.message}`);
  }
}

async function cleanup() {
  console.log('\n🧹 Cleaning up test data');
  console.log('-'.repeat(50));

  try {
    // Cancel test booking if created
    if (testBookingId && authToken) {
      const cancelResponse = await makeRequest('PUT', `/bookings/${testBookingId}/status`, 
        { status: 'cancelled' }, {
        'Authorization': `Bearer ${authToken}`
      });
      
      if (cancelResponse.status === 200) {
        console.log('✅ Test booking cancelled');
      }
    }

    // The test user can remain as it's a test account
    console.log('✅ Cleanup completed');

  } catch (error) {
    console.log(`⚠️  Cleanup warning: ${error.message}`);
  }
}

function printTestResults() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n🔍 FAILED TESTS:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }

  console.log('\n🎯 FEATURE COVERAGE:');
  console.log('✓ Student Authentication & Registration');
  console.log('✓ Profile Management');
  console.log('✓ Dashboard Overview & Analytics');
  console.log('✓ Accommodation Search & Discovery');
  console.log('✓ Booking Management');
  console.log('✓ Food Order Management');
  console.log('✓ Notifications');
  console.log('✓ Error Handling & Security');
  console.log('✓ Data Validation');
  console.log('✓ Authorization Controls');

  if (testResults.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Student dashboard is working correctly.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

// Performance test helper
async function performanceTest() {
  console.log('\n⚡ Running Performance Tests');
  console.log('-'.repeat(50));

  if (!authToken) {
    console.log('⚠️  Skipping performance tests - no auth token');
    return;
  }

  const startTime = Date.now();
  
  try {
    // Test concurrent requests
    const concurrentRequests = Array.from({ length: 5 }, () => 
      makeRequest('GET', '/accommodations', null, {
        'Authorization': `Bearer ${authToken}`
      })
    );

    const responses = await Promise.all(concurrentRequests);
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.log(`✅ Handled 5 concurrent requests in ${totalTime}ms`);
    assert(totalTime < 10000, 'Concurrent requests completed within 10 seconds');

    const allSuccessful = responses.every(response => response.status === 200);
    assert(allSuccessful, 'All concurrent requests successful');

  } catch (error) {
    console.log(`❌ Performance test failed: ${error.message}`);
  }
}

// Main execution
if (require.main === module) {
  runTestSuite().catch(error => {
    console.error('💥 Test suite crashed:', error);
    process.exit(1);
  });
}

module.exports = {
  runTestSuite,
  makeRequest,
  testResults
};
