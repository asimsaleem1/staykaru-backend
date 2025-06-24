const http = require('http');

class ModuleTester {
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
    console.log('🚀 Starting Comprehensive Module Testing...');
    console.log('='.repeat(60));

    try {
      // Step 1: Get tokens
      await this.getAdminToken();
      await this.createAndGetStudentToken();

      // Step 2: Test Admin Module
      console.log('\n📋 Testing Admin Module...');
      await this.testAdminModule();

      // Step 3: Test Student Module  
      console.log('\n🎓 Testing Student Module...');
      await this.testStudentModule();

      // Step 4: Test Landlord Module
      console.log('\n🏠 Testing Landlord Module...');
      await this.testLandlordModule();

      // Step 5: Test Food Provider Module
      console.log('\n🍽️ Testing Food Provider Module...');
      await this.testFoodProviderModule();

      // Step 6: Test General Endpoints
      console.log('\n🔍 Testing General Endpoints...');
      await this.testGeneralEndpoints();

      // Generate Final Report
      this.generateTestReport();

    } catch (error) {
      console.error('❌ Testing failed:', error);
    }
  }

  async getAdminToken() {
    console.log('🔐 Getting admin token...');
    const loginData = {
      email: 'assaleemofficial@gmail.com',
      password: 'Kaassa1007443@'
    };

    const response = await this.makeRequest('POST', '/api/auth/login', loginData);
    if (response.status === 200) {
      this.adminToken = response.data.access_token;
      console.log('✅ Admin token acquired');
    } else {
      throw new Error('Failed to get admin token');
    }
  }

  async createAndGetStudentToken() {
    console.log('👨‍🎓 Creating test student and getting token...');
    
    // Create student
    const studentData = {
      name: 'Test Student',
      email: 'test.student@example.com',
      password: 'TestPassword123',
      phone: '+923001234567',
      role: 'student',
      gender: 'male'
    };

    const createResponse = await this.makeRequest('POST', '/api/auth/register', studentData);
    if (createResponse.status === 201 || createResponse.status === 409) {
      // Login as student
      const loginResponse = await this.makeRequest('POST', '/api/auth/login', {
        email: studentData.email,
        password: studentData.password
      });
      
      if (loginResponse.status === 200) {
        this.studentToken = loginResponse.data.access_token;
        console.log('✅ Student token acquired');
      }
    }
  }

  async testAdminModule() {
    const tests = [
      {
        name: 'Get Admin Dashboard Stats',
        method: 'GET',
        path: '/api/admin/dashboard/stats',
        token: this.adminToken
      },
      {
        name: 'Get All Users',
        method: 'GET', 
        path: '/api/admin/users',
        token: this.adminToken
      },
      {
        name: 'Get All Accommodations for Approval',
        method: 'GET',
        path: '/api/admin/accommodations',
        token: this.adminToken
      },
      {
        name: 'Get All Food Providers for Approval',
        method: 'GET',
        path: '/api/admin/food-providers',
        token: this.adminToken
      },
      {
        name: 'Get System Analytics',
        method: 'GET',
        path: '/api/admin/analytics',
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
        name: 'Search Accommodations',
        method: 'GET',
        path: '/api/accommodations?city=Karachi&limit=10',
        token: this.studentToken
      },
      {
        name: 'Search Food Providers',
        method: 'GET',
        path: '/api/food-providers?city=Karachi&limit=10',
        token: this.studentToken
      },
      {
        name: 'Get Menu Items',
        method: 'GET',
        path: '/api/menu-items?limit=10',
        token: this.studentToken
      },
      {
        name: 'Create Booking',
        method: 'POST',
        path: '/api/bookings',
        token: this.studentToken,
        data: {
          accommodation: null, // Will be set dynamically
          checkInDate: '2025-07-01',
          checkOutDate: '2025-07-07',
          guests: 1,
          specialRequests: 'Test booking from automated test'
        }
      },
      {
        name: 'Get Student Bookings',
        method: 'GET',
        path: '/api/bookings/my-bookings',
        token: this.studentToken
      },
      {
        name: 'Create Food Order',
        method: 'POST',
        path: '/api/orders',
        token: this.studentToken,
        data: {
          food_provider: null, // Will be set dynamically
          items: [{
            menu_item: null, // Will be set dynamically
            quantity: 2,
            special_instructions: 'Test order from automated test'
          }],
          delivery_location: {
            coordinates: { latitude: 24.8607, longitude: 67.0011 },
            address: '123 Test Address, Karachi',
            landmark: 'Near Test Landmark'
          }
        }
      },
      {
        name: 'Get Student Orders',
        method: 'GET',
        path: '/api/orders/my-orders',
        token: this.studentToken
      }
    ];

    // Get accommodation ID for booking test
    const accommodations = await this.makeRequest('GET', '/api/accommodations?limit=1', null, this.studentToken);
    if (accommodations.status === 200 && accommodations.data.length > 0) {
      const bookingTest = tests.find(t => t.name === 'Create Booking');
      if (bookingTest) bookingTest.data.accommodation = accommodations.data[0]._id;
    }

    // Get food provider and menu item for order test
    const foodProviders = await this.makeRequest('GET', '/api/food-providers?limit=1', null, this.studentToken);
    const menuItems = await this.makeRequest('GET', '/api/menu-items?limit=1', null, this.studentToken);
    
    if (foodProviders.status === 200 && foodProviders.data.length > 0) {
      const orderTest = tests.find(t => t.name === 'Create Food Order');
      if (orderTest) {
        orderTest.data.food_provider = foodProviders.data[0]._id;
        if (menuItems.status === 200 && menuItems.data.length > 0) {
          orderTest.data.items[0].menu_item = menuItems.data[0]._id;
        }
      }
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
          email: 'test.landlord@example.com',
          password: 'TestPassword123',
          phone: '+923001234568',
          role: 'landlord',
          gender: 'male'
        }
      },
      {
        name: 'Landlord Login',
        method: 'POST',
        path: '/api/auth/login',
        data: {
          email: 'test.landlord@example.com',
          password: 'TestPassword123'
        }
      }
    ];

    // Run registration and login
    let landlordToken = null;
    for (const test of tests) {
      const result = await this.runTest(test);
      this.testResults.landlord.push(result);
      
      if (test.name === 'Landlord Login' && result.success) {
        landlordToken = result.response.access_token;
      }
    }

    // Test landlord-specific endpoints if login successful
    if (landlordToken) {
      const landlordTests = [
        {
          name: 'Create Accommodation',
          method: 'POST',
          path: '/api/accommodations',
          token: landlordToken,
          data: {
            title: 'Test Accommodation by Landlord',
            description: 'A test accommodation created by automated testing',
            address: '123 Test Street, Karachi, Pakistan',
            city: 'Karachi',
            propertyType: 'apartment',
            pricePerNight: 1000,
            amenities: ['WiFi', 'AC', 'Kitchen'],
            capacity: 2,
            location: {
              coordinates: { latitude: 24.8607, longitude: 67.0011 }
            }
          }
        },
        {
          name: 'Get Landlord Properties',
          method: 'GET',
          path: '/api/accommodations/my-properties',
          token: landlordToken
        },
        {
          name: 'Get Booking Requests',
          method: 'GET',
          path: '/api/bookings/property-bookings',
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
          name: 'Test Food Provider',
          email: 'test.foodprovider@example.com',
          password: 'TestPassword123',
          phone: '+923001234569',
          role: 'food_provider',
          gender: 'male'
        }
      },
      {
        name: 'Food Provider Login',
        method: 'POST',
        path: '/api/auth/login',
        data: {
          email: 'test.foodprovider@example.com',
          password: 'TestPassword123'
        }
      }
    ];

    // Run registration and login
    let providerToken = null;
    for (const test of tests) {
      const result = await this.runTest(test);
      this.testResults.foodProvider.push(result);
      
      if (test.name === 'Food Provider Login' && result.success) {
        providerToken = result.response.access_token;
      }
    }

    // Test food provider-specific endpoints if login successful
    if (providerToken) {
      const providerTests = [
        {
          name: 'Create Food Provider Business',
          method: 'POST',
          path: '/api/food-providers',
          token: providerToken,
          data: {
            businessName: 'Test Restaurant by Provider',
            description: 'A test restaurant created by automated testing',
            address: '456 Food Street, Karachi, Pakistan',
            phone: '+923001234570',
            cuisineTypes: ['Pakistani', 'Fast Food'],
            operatingHours: {
              monday: { open: '09:00', close: '22:00' },
              tuesday: { open: '09:00', close: '22:00' }
            }
          }
        },
        {
          name: 'Get Provider Business',
          method: 'GET',
          path: '/api/food-providers/my-business',
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
        name: 'Health Check',
        method: 'GET',
        path: '/api/health'
      },
      {
        name: 'Get Cities',
        method: 'GET',
        path: '/api/locations/cities'
      },
      {
        name: 'Search Public Accommodations',
        method: 'GET',
        path: '/api/accommodations/search?city=Karachi'
      },
      {
        name: 'Get Popular Food Providers',
        method: 'GET',
        path: '/api/food-providers/popular'
      },
      {
        name: 'Get App Statistics',
        method: 'GET',
        path: '/api/analytics/public-stats'
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
      
      return {
        name: test.name,
        method: test.method,
        path: test.path,
        status: response.status,
        success: success,
        response: response.data,
        error: !success ? response.data : null
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

    // Save detailed report to file
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
    fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
    console.log('📄 Detailed report saved to test-report.json');
  }
}

// Run the comprehensive test suite
const tester = new ModuleTester();
tester.runAllTests().catch(console.error);
