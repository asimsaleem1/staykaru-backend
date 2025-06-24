const axios = require('axios');

async function testLogin() {
  const BASE_URL = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com';
  
  console.log('🔐 Testing login endpoint...\n');
  
  try {
    // Test basic API health
    console.log('1. Testing API health...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ API health check passed');
  } catch (error) {
    console.log('❌ API health check failed:', error.response?.status, error.response?.data || error.message);
  }
  
  try {
    // Test login endpoint
    console.log('\n2. Testing login endpoint...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'student@staykaru.com',
      password: 'password123'
    });
    console.log('✅ Login successful');
    console.log('Token:', loginResponse.data.token?.substring(0, 20) + '...');
  } catch (error) {
    console.log('❌ Login failed:', error.response?.status, error.response?.data || error.message);
    
    // Try to get more details
    if (error.response?.status === 404) {
      console.log('⚠️ Endpoint not found. Let me check available routes...');
      
      try {
        const routesResponse = await axios.get(`${BASE_URL}/`);
        console.log('Root response:', routesResponse.data);
      } catch (rootError) {
        console.log('Root access failed:', rootError.response?.status, rootError.response?.data || rootError.message);
      }
    }
  }
  
  // Test with different endpoint paths
  const endpoints = [
    '/auth/login',
    '/api/auth/login',
    '/login'
  ];
  
  console.log('\n3. Testing different endpoint paths...');
  for (const endpoint of endpoints) {
    try {
      const response = await axios.post(`${BASE_URL}${endpoint}`, {
        email: 'student@staykaru.com',
        password: 'password123'
      });
      console.log(`✅ ${endpoint} - Success`);
      break;
    } catch (error) {
      console.log(`❌ ${endpoint} - Failed (${error.response?.status})`);
    }
  }
}

testLogin();
