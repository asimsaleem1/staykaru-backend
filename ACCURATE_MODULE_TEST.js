const http = require('http');

class AccurateModuleTester {
  constructor() {
    this.baseUrl = 'localhost';
    this.port = 3000;
    this.adminToken = null;
    this.studentToken = null;
    this.testResults = {
      admin: [],
      student: [],
      landlord: [],
      foodProvider: [],
      general: []
    };
  }

  async runAllTests() {
    console.log('🚀 Starting Accurate Module Testing...');
    console.log('='.repeat(60));

    try {
      // Step 1: Get Admin Token
      await this.getAdminToken();
      
      // Step 2: Create Student and Get Token
      await this.createAndGetStudentToken();

      // Step 3: Test Admin Module (using real routes)
      console.log('\n📋 Testing Admin Module...');
      await this.testAdminModule();

      // Step 4: Test Student Module
      console.log('\n🎓 Testing Student Module...');
      await this.testStudentModule();

      // Step 5: Test Landlord Module
      console.log('\n🏠 Testing Landlord Module...');
      await this.testLandlordModule();

      // Step 6: Test Food Provider Module
      console.log('\n🍽️ Testing Food Provider Module...');
      await this.testFoodProviderModule();

      // Step 7: Test General Endpoints
      console.log('\n🔍 Testing General/Public Endpoints...');
      await this.testGeneralEndpoints();

      // Generate Final Report
      this.generateTestReport();

    } catch (error) {
      console.error('❌ Testing failed:', error);
    }
  }

  async getAdminToken() {
    console.log('🔐 Getting admin token...');
    const response = await this.makeRequest('POST', '/api/auth/login', {
      email: 'assaleemofficial@gmail.com',
      password: 'Kaassa1007443@'
    });

    if (response.status === 200) {
      this.adminToken = response.data.access_token;
      console.log('✅ Admin token acquired');
    } else {
      throw new Error('Failed to get admin token');
    }
  }

  async createAndGetStudentToken() {
    console.log('👨‍🎓 Creating test student and getting token...');
    
    // Try to register student
    const studentData = {
      name: 'Test Student',
      email: 'teststudent@example.com',
      password: 'TestStudent123',
      phone: '+923001234567',
      role: 'student',
      gender: 'male',
      countryCode: '+92'
    };

    const registerResponse = await this.makeRequest('POST', '/api/auth/register', studentData);
    console.log(`Registration response: ${registerResponse.status}`);

    // Login as student
    const loginResponse = await this.makeRequest('POST', '/api/auth/login', {
      email: studentData.email,
      password: studentData.password
    });

    if (loginResponse.status === 200) {
      this.studentToken = loginResponse.data.access_token;
      console.log('✅ Student token acquired');
    } else {
      console.log('⚠️ Student login failed, will test without student token');
    }
  }

  async testAdminModule() {
    const tests = [
      {
        name: 'Get All Users',
        method: 'GET',
        path: '/api/admin/users',
        token: this.adminToken
      },
      {
        name: 'Get User Statistics',
        method: 'GET',
        path: '/api/admin/users/statistics',
        token: this.adminToken
      },
      {
        name: 'Get All Accommodations',
        method: 'GET',
        path: '/api/admin/accommodations',
        token: this.adminToken
      },
      {
        name: 'Get Accommodation Statistics',
        method: 'GET',
        path: '/api/admin/accommodations/statistics',
        token: this.adminToken
      },
      {
        name: 'Get All Food Providers',
        method: 'GET',
        path: '/api/admin/food-providers',
        token: this.adminToken
      },
      {
        name: 'Get Food Provider Analytics',
        method: 'GET',
        path: '/api/admin/food-providers/analytics',
        token: this.adminToken
      },
      {
        name: 'Get All Bookings',
        method: 'GET',
        path: '/api/admin/bookings',
        token: this.adminToken
      },
      {
        name: 'Get All Orders',
        method: 'GET',
        path: '/api/admin/orders',
        token: this.adminToken
      },
      {
        name: 'Get Dashboard Analytics',
        method: 'GET',
        path: '/api/admin/analytics/dashboard',
        token: this.adminToken
      },
      {
        name: 'Get Revenue Analytics',
        method: 'GET',
        path: '/api/admin/analytics/revenue',
        token: this.adminToken
      }
    ];

    for (const test of tests) {
      const result = await this.runTest(test);
      this.testResults.admin.push(result);
    }
  }

  async testStudentModule() {
    const tests = [
      {
        name: 'Get Student Profile',
        method: 'GET',
        path: '/api/users/profile',
        token: this.studentToken
      },
      {
        name: 'Get Accommodations (Public)',
        method: 'GET',
        path: '/api/accommodations',
        token: null
      },
      {
        name: 'Get Food Providers (Public)',
        method: 'GET',
        path: '/api/food-providers',
        token: null
      },
      {
        name: 'Get Menu Items (Public)',
        method: 'GET',
        path: '/api/menu-items',
        token: null
      }
    ];

    // Add authenticated tests if student token is available
    if (this.studentToken) {
      tests.push(
        {
          name: 'Update Student Profile',
          method: 'PUT',
          path: '/api/users/profile',
          token: this.studentToken,
          data: {
            name: 'Updated Test Student',
            phone: '+923001234567'
          }
        },
        {
          name: 'Get My Bookings',
          method: 'GET',
          path: '/api/bookings/my-bookings',
          token: this.studentToken
        },
        {
          name: 'Get My Orders',
          method: 'GET',
          path: '/api/orders/my-orders',
          token: this.studentToken
        },
        {
          name: 'Get Notifications',
          method: 'GET',
          path: '/api/notifications',
          token: this.studentToken
        }
      );
    }

    for (const test of tests) {
      const result = await this.runTest(test);
      this.testResults.student.push(result);
    }
  }

  async testLandlordModule() {
    const tests = [
      {
        name: 'Register as Landlord',
        method: 'POST',
        path: '/api/auth/register',
        data: {
          name: 'Test Landlord',
          email: 'testlandlord@example.com',
          password: 'TestLandlord123',
          phone: '+923001234568',
          role: 'landlord',
          gender: 'male',
          countryCode: '+92'
        }
      }
    ];

    // Run registration
    const regResult = await this.runTest(tests[0]);
    this.testResults.landlord.push(regResult);

    // Try to login as landlord
    const loginTest = {
      name: 'Landlord Login',
      method: 'POST',
      path: '/api/auth/login',
      data: {
        email: 'testlandlord@example.com',
        password: 'TestLandlord123'
      }
    };

    const loginResult = await this.runTest(loginTest);
    this.testResults.landlord.push(loginResult);

    // Test landlord-specific endpoints if login successful
    if (loginResult.success) {
      const landlordToken = loginResult.response.access_token;
      const landlordTests = [
        {
          name: 'Get Landlord Profile',
          method: 'GET',
          path: '/api/users/landlord/profile',
          token: landlordToken
        },
        {
          name: 'Get Landlord Bookings',
          method: 'GET',
          path: '/api/users/landlord/bookings',
          token: landlordToken
        },
        {
          name: 'Get Landlord Statistics',
          method: 'GET',
          path: '/api/users/landlord/statistics',
          token: landlordToken
        },
        {
          name: 'Get Landlord Revenue',
          method: 'GET',
          path: '/api/users/landlord/revenue',
          token: landlordToken
        }
      ];

      for (const test of landlordTests) {
        const result = await this.runTest(test);
        this.testResults.landlord.push(result);
      }
    }
  }

  async testFoodProviderModule() {
    const tests = [
      {
        name: 'Register as Food Provider',
        method: 'POST',
        path: '/api/auth/register',
        data: {
          name: 'Test Restaurant Owner',
          email: 'testrestaurant@example.com',
          password: 'TestRestaurant123',
          phone: '+923001234569',
          role: 'food_provider',
          gender: 'male',
          countryCode: '+92'
        }
      }
    ];

    // Run registration
    const regResult = await this.runTest(tests[0]);
    this.testResults.foodProvider.push(regResult);

    // Try to login as food provider
    const loginTest = {
      name: 'Food Provider Login',
      method: 'POST',
      path: '/api/auth/login',
      data: {
        email: 'testrestaurant@example.com',
        password: 'TestRestaurant123'
      }
    };

    const loginResult = await this.runTest(loginTest);
    this.testResults.foodProvider.push(loginResult);

    // Test food provider-specific endpoints if login successful
    if (loginResult.success) {
      const providerToken = loginResult.response.access_token;
      const providerTests = [
        {
          name: 'Get Food Provider Profile',
          method: 'GET',
          path: '/api/users/food-provider/profile',
          token: providerToken
        },
        {
          name: 'Get Provider Orders',
          method: 'GET',
          path: '/api/orders/provider-orders',
          token: providerToken
        }
      ];

      for (const test of providerTests) {
        const result = await this.runTest(test);
        this.testResults.foodProvider.push(result);
      }
    }
  }

  async testGeneralEndpoints() {
    const tests = [
      {
        name: 'Get All Accommodations (Public)',
        method: 'GET',
        path: '/api/accommodations'
      },
      {
        name: 'Get Accommodations with Filters',
        method: 'GET',
        path: '/api/accommodations?city=Karachi&limit=5'
      },
      {
        name: 'Get All Food Providers (Public)',  
        method: 'GET',
        path: '/api/food-providers'
      },
      {
        name: 'Get Food Providers with Filters',
        method: 'GET',
        path: '/api/food-providers?city=Karachi&limit=5'
      },
      {
        name: 'Get All Menu Items (Public)',
        method: 'GET',
        path: '/api/menu-items'
      },
      {
        name: 'Get Menu Items with Limit',
        method: 'GET',  
        path: '/api/menu-items?limit=10'
      },
      {
        name: 'Get All Reviews (Public)',
        method: 'GET',
        path: '/api/reviews'
      }
    ];

    for (const test of tests) {
      const result = await this.runTest(test);
      this.testResults.general.push(result);
    }
  }

  async runTest(test) {
    try {
      console.log(`  ⏳ ${test.name}...`);
      const response = await this.makeRequest(test.method, test.path, test.data, test.token);
      
      const success = response.status >= 200 && response.status < 400;
      const status = success ? '✅' : '❌';
      
      console.log(`  ${status} ${test.name} - Status: ${response.status}`);
      
      // Log data count for successful GET requests
      if (success && test.method === 'GET' && Array.isArray(response.data)) {
        console.log(`    📊 Returned ${response.data.length} items`);
      }
      
      return {
        name: test.name,
        method: test.method,
        path: test.path,
        status: response.status,
        success: success,
        response: response.data,
        error: !success ? response.data : null,
        dataCount: Array.isArray(response.data) ? response.data.length : null
      };
    } catch (error) {
      console.log(`  ❌ ${test.name} - Error: ${error.message}`);
      return {
        name: test.name,
        method: test.method,
        path: test.path,
        status: 0,
        success: false,
        error: error.message
      };
    }
  }

  async makeRequest(method, path, data = null, token = null) {
    return new Promise((resolve, reject) => {
      const postData = data ? JSON.stringify(data) : null;
      
      const options = {
        hostname: this.baseUrl,
        port: this.port,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...(postData && { 'Content-Length': Buffer.byteLength(postData) })
        }
      };

      const req = http.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => {
          responseBody += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsedData = responseBody ? JSON.parse(responseBody) : {};
            resolve({
              status: res.statusCode,
              data: parsedData
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              data: responseBody
            });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  }

  generateTestReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPREHENSIVE TEST REPORT');
    console.log('='.repeat(60));

    const modules = ['admin', 'student', 'landlord', 'foodProvider', 'general'];
    let totalTests = 0;
    let totalPassed = 0;

    modules.forEach(module => {
      const results = this.testResults[module];
      const passed = results.filter(r => r.success).length;
      const failed = results.length - passed;
      
      totalTests += results.length;
      totalPassed += passed;

      console.log(`\n${module.toUpperCase()} MODULE:`);
      console.log(`  Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
      
      // Show successful data retrievals  
      const dataRetrievals = results.filter(r => r.success && r.dataCount !== null);
      if (dataRetrievals.length > 0) {
        console.log('  Data Retrieved:');
        dataRetrievals.forEach(test => {
          console.log(`    📊 ${test.name}: ${test.dataCount} items`);
        });
      }
      
      if (failed > 0) {
        console.log('  Failed Tests:');
        results.filter(r => !r.success).forEach(test => {
          console.log(`    ❌ ${test.name} (${test.status})`);
        });
      }
    });

    console.log('\n' + '='.repeat(60));
    console.log(`OVERALL SUMMARY:`);
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${totalPassed} (${Math.round(totalPassed/totalTests*100)}%)`);
    console.log(`Failed: ${totalTests - totalPassed} (${Math.round((totalTests-totalPassed)/totalTests*100)}%)`);
    console.log('='.repeat(60));

    // Save detailed report
    this.saveDetailedReport();
  }

  saveDetailedReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: Object.values(this.testResults).flat().length,
        totalPassed: Object.values(this.testResults).flat().filter(r => r.success).length,
        totalFailed: Object.values(this.testResults).flat().filter(r => !r.success).length
      },
      results: this.testResults
    };

    const fs = require('fs');
    fs.writeFileSync('accurate-test-report.json', JSON.stringify(report, null, 2));
    console.log('📄 Detailed report saved to accurate-test-report.json');
  }
}

// Run the comprehensive test suite
const tester = new AccurateModuleTester();
tester.runAllTests().catch(console.error);
