const axios = require('axios');

// Configuration
const BASE_URL = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api';
const ADMIN_EMAIL = 'admin@staykaru.com';
const ADMIN_PASSWORD = 'admin123';

// Test Results
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  details: []
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m', // Yellow
    reset: '\x1b[0m'     // Reset
  };
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
}

function addTestResult(testName, success, details = '') {
  testResults.total++;
  if (success) {
    testResults.passed++;
    log(`✅ PASSED: ${testName}`, 'success');
  } else {
    testResults.failed++;
    log(`❌ FAILED: ${testName} - ${details}`, 'error');
  }
  testResults.details.push({ testName, success, details });
}

// Authentication
let adminToken = null;

async function createAdminUser() {
  try {
    log('👤 Creating admin user...', 'info');
    
    const response = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Admin User',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
      phone: '1234567890',
      countryCode: '+92',
      gender: 'male'
    });

    if (response.status === 201 || response.status === 200) {
      log('✅ Admin user created successfully', 'success');
      return true;
    } else {
      log('❌ Failed to create admin user', 'error');
      return false;
    }
  } catch (error) {
    if (error.response?.status === 409) {
      log('ℹ️ Admin user already exists', 'info');
      return true;
    }
    log(`❌ Error creating admin user: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

async function authenticateAdmin() {
  try {
    log('🔐 Authenticating admin user...', 'info');
    
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    if (response.data && response.data.access_token) {
      adminToken = response.data.access_token;
      log('✅ Admin authentication successful', 'success');
      return true;
    } else {
      log('❌ Admin authentication failed - No token received', 'error');
      return false;
    }
  } catch (error) {
    log(`❌ Admin authentication failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

// Test functions
async function testGetAllUsers() {
  try {
    const response = await axios.get(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.status === 200 && response.data) {
      addTestResult('Get All Users', true, `Found ${response.data.data?.length || 0} users`);
      return response.data;
    } else {
      addTestResult('Get All Users', false, 'Invalid response');
      return null;
    }
  } catch (error) {
    addTestResult('Get All Users', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testGetUserStatistics() {
  try {
    const response = await axios.get(`${BASE_URL}/admin/users/statistics`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.status === 200 && response.data) {
      addTestResult('Get User Statistics', true, 'Statistics retrieved successfully');
      return response.data;
    } else {
      addTestResult('Get User Statistics', false, 'Invalid response');
      return null;
    }
  } catch (error) {
    addTestResult('Get User Statistics', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testGetAllAccommodations() {
  try {
    const response = await axios.get(`${BASE_URL}/admin/accommodations`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.status === 200 && response.data) {
      addTestResult('Get All Accommodations', true, `Found ${response.data.data?.length || 0} accommodations`);
      return response.data;
    } else {
      addTestResult('Get All Accommodations', false, 'Invalid response');
      return null;
    }
  } catch (error) {
    addTestResult('Get All Accommodations', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testGetAccommodationStatistics() {
  try {
    const response = await axios.get(`${BASE_URL}/admin/accommodations/statistics`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.status === 200 && response.data) {
      addTestResult('Get Accommodation Statistics', true, 'Statistics retrieved successfully');
      return response.data;
    } else {
      addTestResult('Get Accommodation Statistics', false, 'Invalid response');
      return null;
    }
  } catch (error) {
    addTestResult('Get Accommodation Statistics', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testGetAllFoodServices() {
  try {
    const response = await axios.get(`${BASE_URL}/admin/food-services`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.status === 200 && response.data) {
      addTestResult('Get All Food Services', true, `Found ${response.data.data?.length || 0} food services`);
      return response.data;
    } else {
      addTestResult('Get All Food Services', false, 'Invalid response');
      return null;
    }
  } catch (error) {
    addTestResult('Get All Food Services', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testGetFoodServiceStatistics() {
  try {
    const response = await axios.get(`${BASE_URL}/admin/food-services/statistics`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.status === 200 && response.data) {
      addTestResult('Get Food Service Statistics', true, 'Statistics retrieved successfully');
      return response.data;
    } else {
      addTestResult('Get Food Service Statistics', false, 'Invalid response');
      return null;
    }
  } catch (error) {
    addTestResult('Get Food Service Statistics', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testGetAllBookings() {
  try {
    const response = await axios.get(`${BASE_URL}/admin/bookings`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.status === 200 && response.data) {
      addTestResult('Get All Bookings', true, `Found ${response.data.data?.length || 0} bookings`);
      return response.data;
    } else {
      addTestResult('Get All Bookings', false, 'Invalid response');
      return null;
    }
  } catch (error) {
    addTestResult('Get All Bookings', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testGetAllOrders() {
  try {
    const response = await axios.get(`${BASE_URL}/admin/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.status === 200 && response.data) {
      addTestResult('Get All Orders', true, `Found ${response.data.data?.length || 0} orders`);
      return response.data;
    } else {
      addTestResult('Get All Orders', false, 'Invalid response');
      return null;
    }
  } catch (error) {
    addTestResult('Get All Orders', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testGetDashboardAnalytics() {
  try {
    const response = await axios.get(`${BASE_URL}/admin/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.status === 200 && response.data) {
      addTestResult('Get Dashboard Analytics', true, 'Analytics retrieved successfully');
      return response.data;
    } else {
      addTestResult('Get Dashboard Analytics', false, 'Invalid response');
      return null;
    }
  } catch (error) {
    addTestResult('Get Dashboard Analytics', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testGetUserAnalytics() {
  try {
    const response = await axios.get(`${BASE_URL}/admin/analytics/users?period=month`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.status === 200 && response.data) {
      addTestResult('Get User Analytics', true, 'User analytics retrieved successfully');
      return response.data;
    } else {
      addTestResult('Get User Analytics', false, 'Invalid response');
      return null;
    }
  } catch (error) {
    addTestResult('Get User Analytics', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testGetRevenueAnalytics() {
  try {
    const response = await axios.get(`${BASE_URL}/admin/analytics/revenue?period=month`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.status === 200 && response.data) {
      addTestResult('Get Revenue Analytics', true, 'Revenue analytics retrieved successfully');
      return response.data;
    } else {
      addTestResult('Get Revenue Analytics', false, 'Invalid response');
      return null;
    }
  } catch (error) {
    addTestResult('Get Revenue Analytics', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testGetBookingAnalytics() {
  try {
    const response = await axios.get(`${BASE_URL}/admin/analytics/bookings?period=month`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.status === 200 && response.data) {
      addTestResult('Get Booking Analytics', true, 'Booking analytics retrieved successfully');
      return response.data;
    } else {
      addTestResult('Get Booking Analytics', false, 'Invalid response');
      return null;
    }
  } catch (error) {
    addTestResult('Get Booking Analytics', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testGetOrderAnalytics() {
  try {
    const response = await axios.get(`${BASE_URL}/admin/analytics/orders?period=month`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.status === 200 && response.data) {
      addTestResult('Get Order Analytics', true, 'Order analytics retrieved successfully');
      return response.data;
    } else {
      addTestResult('Get Order Analytics', false, 'Invalid response');
      return null;
    }
  } catch (error) {
    addTestResult('Get Order Analytics', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testGetPaymentStatistics() {
  try {
    const response = await axios.get(`${BASE_URL}/admin/payments/statistics`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.status === 200 && response.data) {
      addTestResult('Get Payment Statistics', true, 'Payment statistics retrieved successfully');
      return response.data;
    } else {
      addTestResult('Get Payment Statistics', false, 'Invalid response');
      return null;
    }
  } catch (error) {
    addTestResult('Get Payment Statistics', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testGetAllTransactions() {
  try {
    const response = await axios.get(`${BASE_URL}/admin/transactions`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.status === 200 && response.data) {
      addTestResult('Get All Transactions', true, `Found ${response.data.data?.length || 0} transactions`);
      return response.data;
    } else {
      addTestResult('Get All Transactions', false, 'Invalid response');
      return null;
    }
  } catch (error) {
    addTestResult('Get All Transactions', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testGetSystemHealth() {
  try {
    const response = await axios.get(`${BASE_URL}/admin/system/health`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.status === 200 && response.data) {
      addTestResult('Get System Health', true, 'System health check successful');
      return response.data;
    } else {
      addTestResult('Get System Health', false, 'Invalid response');
      return null;
    }
  } catch (error) {
    addTestResult('Get System Health', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testGetPlatformConfig() {
  try {
    const response = await axios.get(`${BASE_URL}/admin/config/platform`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.status === 200 && response.data) {
      addTestResult('Get Platform Config', true, 'Platform configuration retrieved successfully');
      return response.data;
    } else {
      addTestResult('Get Platform Config', false, 'Invalid response');
      return null;
    }
  } catch (error) {
    addTestResult('Get Platform Config', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testGetPerformanceMetrics() {
  try {
    const response = await axios.get(`${BASE_URL}/admin/analytics/performance`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.status === 200 && response.data) {
      addTestResult('Get Performance Metrics', true, 'Performance metrics retrieved successfully');
      return response.data;
    } else {
      addTestResult('Get Performance Metrics', false, 'Invalid response');
      return null;
    }
  } catch (error) {
    addTestResult('Get Performance Metrics', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testGetUserActivityReport() {
  try {
    const response = await axios.get(`${BASE_URL}/admin/users/activity-report`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.status === 200 && response.data) {
      addTestResult('Get User Activity Report', true, 'User activity report retrieved successfully');
      return response.data;
    } else {
      addTestResult('Get User Activity Report', false, 'Invalid response');
      return null;
    }
  } catch (error) {
    addTestResult('Get User Activity Report', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testExportUsers() {
  try {
    const response = await axios.get(`${BASE_URL}/admin/export/users?format=json`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.status === 200 && response.data) {
      addTestResult('Export Users', true, 'Users exported successfully');
      return response.data;
    } else {
      addTestResult('Export Users', false, 'Invalid response');
      return null;
    }
  } catch (error) {
    addTestResult('Export Users', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testExportBookings() {
  try {
    const response = await axios.get(`${BASE_URL}/admin/export/bookings?format=json`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.status === 200 && response.data) {
      addTestResult('Export Bookings', true, 'Bookings exported successfully');
      return response.data;
    } else {
      addTestResult('Export Bookings', false, 'Invalid response');
      return null;
    }
  } catch (error) {
    addTestResult('Export Bookings', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testExportTransactions() {
  try {
    const response = await axios.get(`${BASE_URL}/admin/export/transactions?format=json`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.status === 200 && response.data) {
      addTestResult('Export Transactions', true, 'Transactions exported successfully');
      return response.data;
    } else {
      addTestResult('Export Transactions', false, 'Invalid response');
      return null;
    }
  } catch (error) {
    addTestResult('Export Transactions', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function setupAdminAndTest() {
  console.log('🔧 Setting up admin user and testing dashboard...\n');

  try {
    // Step 1: Try to login first to see if admin exists
    console.log('1️⃣ Attempting to login with existing admin credentials...');
    let loginResponse;
    try {
      loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      });
      console.log('✅ Admin login successful - admin user exists');
    } catch (loginError) {
      console.log('❌ Admin login failed - admin user does not exist');
      console.log('Creating admin user...');
      
      // Step 2: Create admin user
      const adminData = {
        name: 'Admin User',
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin',
        phone: '1234567890',
        gender: 'male',
        identificationType: 'cnic',
        identificationNumber: '1234567890123',
        countryCode: '+92'
      };

      try {
        const registerResponse = await axios.post(`${BASE_URL}/auth/register`, adminData);
        console.log('✅ Admin user created successfully');
        console.log('Admin ID:', registerResponse.data.user.id);
      } catch (registerError) {
        console.log('❌ Failed to create admin user:', registerError.response?.data || registerError.message);
        return;
      }

      // Step 3: Login with newly created admin
      loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      });
      console.log('✅ Login successful with new admin user');
    }

    const accessToken = loginResponse.data.access_token;
    console.log('Admin ID from token:', loginResponse.data.user.id);

    // Step 4: Test the dashboard endpoint
    console.log('\n2️⃣ Testing admin dashboard endpoint...');
    const dashboardResponse = await axios.get(`${BASE_URL}/admin/dashboard`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Dashboard endpoint working!');
    console.log('📊 Dashboard Response:');
    console.log(JSON.stringify(dashboardResponse.data, null, 2));

    // Step 5: Verify the stats are real data
    console.log('\n3️⃣ Verifying stats are real database data...');
    const stats = dashboardResponse.data.stats;
    
    if (typeof stats.totalUsers === 'number' && 
        typeof stats.totalAccommodations === 'number' && 
        typeof stats.totalBookings === 'number' && 
        typeof stats.totalOrders === 'number') {
      console.log('✅ Stats are real numbers from database');
      console.log(`📈 Current Database Stats:`);
      console.log(`   - Total Users: ${stats.totalUsers}`);
      console.log(`   - Total Accommodations: ${stats.totalAccommodations}`);
      console.log(`   - Total Bookings: ${stats.totalBookings}`);
      console.log(`   - Total Orders: ${stats.totalOrders}`);
    } else {
      console.log('❌ Stats are not real numbers - check implementation');
    }

    console.log('\n🎉 Admin setup and dashboard test completed successfully!');
    console.log('The frontend should now be able to access the dashboard with real data.');

  } catch (error) {
    console.error('❌ Error during admin setup and test:', error.response?.data || error.message);
  }
}

// Run the setup
setupAdminAndTest(); 