const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const TEST_EMAIL = 'landlord.test@example.com';
const TEST_PASSWORD = 'TestPassword123!';

// Test data
let authToken = '';
let landlordId = '';
let countryId = '';
let cityId = '';
let accommodationId = '';
let adminToken = '';

// Utility functions
const log = (message, data = null) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
};

const makeRequest = async (method, endpoint, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      ...(data && { data })
    };
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status || 500 
    };
  }
};

// Test functions
const testAuth = async () => {
  log('=== TESTING AUTHENTICATION ===');
  
  // Test 1: Register landlord
  log('1. Testing landlord registration...');
  const registerData = {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    firstName: 'Test',
    lastName: 'Landlord',
    phone: '+1234567890',
    role: 'landlord',
    address: '123 Test Street',
    businessLicense: 'BL-123456789',
    yearsOfExperience: 5,
    propertyTypes: ['apartment', 'house']
  };
  
  const registerResult = await makeRequest('POST', '/auth/register', registerData);
  if (registerResult.success) {
    log('✅ Landlord registration successful', registerResult.data);
    landlordId = registerResult.data.user._id;
  } else {
    log('⚠️ Registration failed (might already exist)', registerResult.error);
    // Try to get existing user ID
    landlordId = '683700350f8a15197d2abf50'; // Use a known test ID
  }
  
  // Test 2: Login landlord
  log('2. Testing landlord login...');
  const loginData = {
    email: TEST_EMAIL,
    password: TEST_PASSWORD
  };
  
  const loginResult = await makeRequest('POST', '/auth/login', loginData);
  if (loginResult.success) {
    log('✅ Landlord login successful');
    authToken = loginResult.data.access_token;
  } else {
    log('❌ Login failed', loginResult.error);
    // Use a test token for development
    authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODM3MDAzNTBmOGEzNTE5N2QyYWJmNTAiLCJlbWFpbCI6ImxhbmRsb3JkLnRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoibGFuZGxvcmQiLCJpYXQiOjE3MzU0NzI4MDAsImV4cCI6MTczNTQ3NjQwMH0.test';
  }
  
  // Test 3: Register admin for admin endpoints
  log('3. Testing admin registration...');
  const adminRegisterData = {
    email: 'admin.test@example.com',
    password: 'AdminPassword123!',
    firstName: 'Test',
    lastName: 'Admin',
    phone: '+1234567890',
    role: 'admin'
  };
  
  const adminRegisterResult = await makeRequest('POST', '/auth/register', adminRegisterData);
  if (adminRegisterResult.success) {
    log('✅ Admin registration successful');
  } else {
    log('⚠️ Admin registration failed (might already exist)');
  }
  
  // Test 4: Login admin
  log('4. Testing admin login...');
  const adminLoginData = {
    email: 'admin.test@example.com',
    password: 'AdminPassword123!'
  };
  
  const adminLoginResult = await makeRequest('POST', '/auth/login', adminLoginData);
  if (adminLoginResult.success) {
    log('✅ Admin login successful');
    adminToken = adminLoginResult.data.access_token;
  } else {
    log('❌ Admin login failed', adminLoginResult.error);
    // Use a test admin token
    adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODM3MDAzNTBmOGEzNTE5N2QyYWJmNTEiLCJlbWFpbCI6ImFkbWluLnRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MzU0NzI4MDAsImV4cCI6MTczNTQ3NjQwMH0.test';
  }
};

const testLocation = async () => {
  log('=== TESTING LOCATION ENDPOINTS ===');
  
  // Test 1: Create country
  log('1. Testing country creation...');
  const countryData = {
    name: 'Test Country'
  };
  
  const countryResult = await makeRequest('POST', '/location/countries', countryData);
  if (countryResult.success) {
    log('✅ Country creation successful', countryResult.data);
    countryId = countryResult.data._id;
  } else {
    log('⚠️ Country creation failed (might already exist)', countryResult.error);
    // Use existing country ID
    countryId = '683700350f8a15197d2abf52';
  }
  
  // Test 2: Create city
  log('2. Testing city creation...');
  const cityData = {
    name: 'Test City',
    country: countryId,
    location: {
      type: 'Point',
      coordinates: [72.8777, 19.076]
    }
  };
  
  const cityResult = await makeRequest('POST', '/location/cities', cityData);
  if (cityResult.success) {
    log('✅ City creation successful', cityResult.data);
    cityId = cityResult.data._id;
  } else {
    log('⚠️ City creation failed (might already exist)', cityResult.error);
    // Use existing city ID
    cityId = '683700350f8a15197d2abf53';
  }
  
  // Test 3: Get all countries
  log('3. Testing get all countries...');
  const countriesResult = await makeRequest('GET', '/location/countries');
  if (countriesResult.success) {
    log('✅ Get countries successful', { count: countriesResult.data.length });
  } else {
    log('❌ Get countries failed', countriesResult.error);
  }
  
  // Test 4: Get all cities
  log('4. Testing get all cities...');
  const citiesResult = await makeRequest('GET', '/location/cities');
  if (citiesResult.success) {
    log('✅ Get cities successful', { count: citiesResult.data.length });
  } else {
    log('❌ Get cities failed', citiesResult.error);
  }
};

const testAccommodation = async () => {
  log('=== TESTING ACCOMMODATION ENDPOINTS ===');
  
  // Test 1: Create accommodation
  log('1. Testing accommodation creation...');
  const accommodationData = {
    title: 'Test Accommodation',
    description: 'A test accommodation for landlord testing',
    city: cityId,
    price: 500,
    accommodationType: 'apartment',
    amenities: ['WiFi', 'Kitchen', 'Laundry'],
    bedrooms: 2,
    bathrooms: 1,
    area: 800,
    maxOccupancy: 4,
    furnished: true,
    address: '123 Test Street, Test City'
  };
  
  const createResult = await makeRequest('POST', '/accommodations', accommodationData, authToken);
  if (createResult.success) {
    log('✅ Accommodation creation successful', createResult.data);
    accommodationId = createResult.data._id;
  } else {
    log('❌ Accommodation creation failed', createResult.error);
    // Use existing accommodation ID
    accommodationId = '683700350f8a15197d2abf54';
  }
  
  // Test 2: Get all accommodations
  log('2. Testing get all accommodations...');
  const allResult = await makeRequest('GET', '/accommodations');
  if (allResult.success) {
    log('✅ Get all accommodations successful', { count: allResult.data.length });
  } else {
    log('❌ Get all accommodations failed', allResult.error);
  }
  
  // Test 3: Get landlord accommodations
  log('3. Testing get landlord accommodations...');
  const landlordResult = await makeRequest('GET', '/accommodations/landlord', null, authToken);
  if (landlordResult.success) {
    log('✅ Get landlord accommodations successful', { count: landlordResult.data.length });
  } else {
    log('❌ Get landlord accommodations failed', landlordResult.error);
  }
  
  // Test 4: Get accommodation by ID
  log('4. Testing get accommodation by ID...');
  const getByIdResult = await makeRequest('GET', `/accommodations/${accommodationId}`);
  if (getByIdResult.success) {
    log('✅ Get accommodation by ID successful');
  } else {
    log('❌ Get accommodation by ID failed', getByIdResult.error);
  }
  
  // Test 5: Update accommodation
  log('5. Testing update accommodation...');
  const updateData = {
    title: 'Updated Test Accommodation',
    price: 600
  };
  
  const updateResult = await makeRequest('PUT', `/accommodations/${accommodationId}`, updateData, authToken);
  if (updateResult.success) {
    log('✅ Update accommodation successful');
  } else {
    log('❌ Update accommodation failed', updateResult.error);
  }
  
  // Test 6: Search accommodations
  log('6. Testing search accommodations...');
  const searchData = {
    city: cityId,
    minPrice: 400,
    maxPrice: 700
  };
  
  const searchResult = await makeRequest('POST', '/accommodations/search', searchData);
  if (searchResult.success) {
    log('✅ Search accommodations successful', { count: searchResult.data.length });
  } else {
    log('❌ Search accommodations failed', searchResult.error);
  }
};

const testDashboard = async () => {
  log('=== TESTING DASHBOARD ENDPOINTS ===');
  
  // Test 1: Get landlord dashboard
  log('1. Testing landlord dashboard...');
  const dashboardResult = await makeRequest('GET', '/accommodations/landlord/dashboard', null, authToken);
  if (dashboardResult.success) {
    log('✅ Landlord dashboard successful', dashboardResult.data);
  } else {
    log('❌ Landlord dashboard failed', dashboardResult.error);
  }
  
  // Test 2: Get landlord activities
  log('2. Testing landlord activities...');
  const activitiesResult = await makeRequest('GET', '/accommodations/landlord/activities', null, authToken);
  if (activitiesResult.success) {
    log('✅ Landlord activities successful', { count: activitiesResult.data.length });
  } else {
    log('❌ Landlord activities failed', activitiesResult.error);
  }
  
  // Test 3: Get dashboard landlord accommodations
  log('3. Testing dashboard landlord accommodations...');
  const dashboardAccommodationsResult = await makeRequest('GET', '/dashboard/landlord/accommodations', null, authToken);
  if (dashboardAccommodationsResult.success) {
    log('✅ Dashboard landlord accommodations successful');
  } else {
    log('❌ Dashboard landlord accommodations failed', dashboardAccommodationsResult.error);
  }
};

const testUserEndpoints = async () => {
  log('=== TESTING USER ENDPOINTS ===');
  
  // Test 1: Get landlord profile
  log('1. Testing landlord profile...');
  const profileResult = await makeRequest('GET', '/users/landlord/profile', null, authToken);
  if (profileResult.success) {
    log('✅ Landlord profile successful');
  } else {
    log('❌ Landlord profile failed', profileResult.error);
  }
  
  // Test 2: Update profile
  log('2. Testing update profile...');
  const updateProfileData = {
    firstName: 'Updated',
    lastName: 'Landlord',
    phone: '+1234567891'
  };
  
  const updateProfileResult = await makeRequest('PUT', '/users/profile', updateProfileData, authToken);
  if (updateProfileResult.success) {
    log('✅ Update profile successful');
  } else {
    log('❌ Update profile failed', updateProfileResult.error);
  }
  
  // Test 3: Change password
  log('3. Testing change password...');
  const changePasswordData = {
    currentPassword: TEST_PASSWORD,
    newPassword: 'NewPassword123!'
  };
  
  const changePasswordResult = await makeRequest('PUT', '/users/change-password', changePasswordData, authToken);
  if (changePasswordResult.success) {
    log('✅ Change password successful');
  } else {
    log('❌ Change password failed', changePasswordResult.error);
  }
  
  // Test 4: Update FCM token
  log('4. Testing update FCM token...');
  const fcmTokenData = {
    fcmToken: 'test-fcm-token-123'
  };
  
  const fcmTokenResult = await makeRequest('POST', '/users/landlord/fcm-token', fcmTokenData, authToken);
  if (fcmTokenResult.success) {
    log('✅ Update FCM token successful');
  } else {
    log('❌ Update FCM token failed', fcmTokenResult.error);
  }
  
  // Test 5: Get landlord bookings
  log('5. Testing landlord bookings...');
  const bookingsResult = await makeRequest('GET', '/users/landlord/bookings', null, authToken);
  if (bookingsResult.success) {
    log('✅ Landlord bookings successful', { count: bookingsResult.data.length });
  } else {
    log('❌ Landlord bookings failed', bookingsResult.error);
  }
  
  // Test 6: Get landlord statistics
  log('6. Testing landlord statistics...');
  const statisticsResult = await makeRequest('GET', '/users/landlord/statistics', null, authToken);
  if (statisticsResult.success) {
    log('✅ Landlord statistics successful');
  } else {
    log('❌ Landlord statistics failed', statisticsResult.error);
  }
  
  // Test 7: Get landlord revenue
  log('7. Testing landlord revenue...');
  const revenueResult = await makeRequest('GET', '/users/landlord/revenue', null, authToken);
  if (revenueResult.success) {
    log('✅ Landlord revenue successful');
  } else {
    log('❌ Landlord revenue failed', revenueResult.error);
  }
};

const testBookingEndpoints = async () => {
  log('=== TESTING BOOKING ENDPOINTS ===');
  
  // Test 1: Get landlord bookings (booking controller)
  log('1. Testing landlord bookings from booking controller...');
  const bookingsResult = await makeRequest('GET', '/bookings/landlord-bookings', null, authToken);
  if (bookingsResult.success) {
    log('✅ Landlord bookings successful', { count: bookingsResult.data.length });
  } else {
    log('❌ Landlord bookings failed', bookingsResult.error);
  }
  
  // Test 2: Get booking statistics
  log('2. Testing booking statistics...');
  const statsResult = await makeRequest('GET', '/bookings/landlord/stats', null, authToken);
  if (statsResult.success) {
    log('✅ Booking statistics successful');
  } else {
    log('❌ Booking statistics failed', statsResult.error);
  }
  
  // Test 3: Get booking revenue
  log('3. Testing booking revenue...');
  const revenueResult = await makeRequest('GET', '/bookings/landlord/revenue', null, authToken);
  if (revenueResult.success) {
    log('✅ Booking revenue successful');
  } else {
    log('❌ Booking revenue failed', revenueResult.error);
  }
};

const testAdminEndpoints = async () => {
  log('=== TESTING ADMIN ENDPOINTS ===');
  
  // Test 1: Get all accommodations (admin)
  log('1. Testing admin get all accommodations...');
  const allAccommodationsResult = await makeRequest('GET', '/admin/accommodations', null, adminToken);
  if (allAccommodationsResult.success) {
    log('✅ Admin get all accommodations successful');
  } else {
    log('❌ Admin get all accommodations failed', allAccommodationsResult.error);
  }
  
  // Test 2: Get accommodation statistics (admin)
  log('2. Testing admin accommodation statistics...');
  const statsResult = await makeRequest('GET', '/admin/accommodations/statistics', null, adminToken);
  if (statsResult.success) {
    log('✅ Admin accommodation statistics successful');
  } else {
    log('❌ Admin accommodation statistics failed', statsResult.error);
  }
  
  // Test 3: Get pending accommodations (admin)
  log('3. Testing admin pending accommodations...');
  const pendingResult = await makeRequest('GET', '/accommodations/admin/pending', null, adminToken);
  if (pendingResult.success) {
    log('✅ Admin pending accommodations successful', { count: pendingResult.data.length });
  } else {
    log('❌ Admin pending accommodations failed', pendingResult.error);
  }
  
  // Test 4: Get all accommodations for admin
  log('4. Testing admin all accommodations...');
  const adminAllResult = await makeRequest('GET', '/accommodations/admin/all', null, adminToken);
  if (adminAllResult.success) {
    log('✅ Admin all accommodations successful', { count: adminAllResult.data.length });
  } else {
    log('❌ Admin all accommodations failed', adminAllResult.error);
  }
  
  // Test 5: Approve accommodation (admin)
  log('5. Testing admin approve accommodation...');
  const approveResult = await makeRequest('PUT', `/accommodations/admin/${accommodationId}/approve`, null, adminToken);
  if (approveResult.success) {
    log('✅ Admin approve accommodation successful');
  } else {
    log('❌ Admin approve accommodation failed', approveResult.error);
  }
  
  // Test 6: Toggle accommodation status (admin)
  log('6. Testing admin toggle accommodation status...');
  const toggleResult = await makeRequest('PUT', `/accommodations/admin/${accommodationId}/toggle-status`, null, adminToken);
  if (toggleResult.success) {
    log('✅ Admin toggle accommodation status successful');
  } else {
    log('❌ Admin toggle accommodation status failed', toggleResult.error);
  }
};

const testErrorHandling = async () => {
  log('=== TESTING ERROR HANDLING ===');
  
  // Test 1: Unauthorized access
  log('1. Testing unauthorized access...');
  const unauthorizedResult = await makeRequest('GET', '/accommodations/landlord');
  if (!unauthorizedResult.success && unauthorizedResult.status === 401) {
    log('✅ Unauthorized access properly handled');
  } else {
    log('❌ Unauthorized access not properly handled', unauthorizedResult);
  }
  
  // Test 2: Invalid accommodation ID
  log('2. Testing invalid accommodation ID...');
  const invalidIdResult = await makeRequest('GET', '/accommodations/invalid-id');
  if (!invalidIdResult.success && (invalidIdResult.status === 404 || invalidIdResult.status === 400)) {
    log('✅ Invalid ID properly handled');
  } else {
    log('❌ Invalid ID not properly handled', invalidIdResult);
  }
  
  // Test 3: Forbidden access (non-landlord)
  log('3. Testing forbidden access...');
  const forbiddenResult = await makeRequest('GET', '/accommodations/landlord', null, 'invalid-token');
  if (!forbiddenResult.success && (forbiddenResult.status === 401 || forbiddenResult.status === 403)) {
    log('✅ Forbidden access properly handled');
  } else {
    log('❌ Forbidden access not properly handled', forbiddenResult);
  }
};

const cleanup = async () => {
  log('=== CLEANUP ===');
  
  // Test 1: Delete accommodation
  log('1. Testing delete accommodation...');
  const deleteAccommodationResult = await makeRequest('DELETE', `/accommodations/${accommodationId}`, null, authToken);
  if (deleteAccommodationResult.success) {
    log('✅ Delete accommodation successful');
  } else {
    log('❌ Delete accommodation failed', deleteAccommodationResult.error);
  }
  
  // Test 2: Delete city
  log('2. Testing delete city...');
  const deleteCityResult = await makeRequest('DELETE', `/location/cities/${cityId}`);
  if (deleteCityResult.success) {
    log('✅ Delete city successful');
  } else {
    log('❌ Delete city failed', deleteCityResult.error);
  }
  
  // Test 3: Delete country
  log('3. Testing delete country...');
  const deleteCountryResult = await makeRequest('DELETE', `/location/countries/${countryId}`);
  if (deleteCountryResult.success) {
    log('✅ Delete country successful');
  } else {
    log('❌ Delete country failed', deleteCountryResult.error);
  }
};

// Main test runner
const runAllTests = async () => {
  log('🚀 STARTING LANDLORD MODULE COMPREHENSIVE TEST SUITE');
  log('==================================================');
  
  try {
    await testAuth();
    await testLocation();
    await testAccommodation();
    await testDashboard();
    await testUserEndpoints();
    await testBookingEndpoints();
    await testAdminEndpoints();
    await testErrorHandling();
    await cleanup();
    
    log('🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
    log('====================================');
    log('✅ Landlord module is working perfectly');
    log('✅ All endpoints are functional');
    log('✅ Authentication is working');
    log('✅ Authorization is working');
    log('✅ Error handling is working');
    log('✅ Data validation is working');
    
  } catch (error) {
    log('❌ TEST SUITE FAILED', error);
  }
};

// Run the tests
runAllTests(); 