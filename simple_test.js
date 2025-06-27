const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

const testData = {
  email: `fp_${Date.now()}@test.com`,
  password: 'TestPassword123!',
  name: 'Test Food Provider',
  phone: '+1234567890',
  address: '123 Test Street',
  role: 'food_provider',
  countryCode: '+92',
  gender: 'male',
  // Optional fields
  profileImage: 'https://example.com/profile.jpg',
  identificationType: 'cnic',
  identificationNumber: '12345-6789012-3',
  cuisine_type: 'Italian',
  delivery_radius: 5,
  opening_hours: {
    monday: { open: '09:00', close: '22:00' },
    tuesday: { open: '09:00', close: '22:00' },
    wednesday: { open: '09:00', close: '22:00' },
    thursday: { open: '09:00', close: '22:00' },
    friday: { open: '09:00', close: '23:00' },
    saturday: { open: '10:00', close: '23:00' },
    sunday: { open: '10:00', close: '22:00' }
  },
  location: {
    coordinates: {
      latitude: 33.6844,
      longitude: 73.0479
    },
    address: 'Test Address',
    landmark: 'Near Test Landmark'
  }
};

async function testRegistration() {
  console.log('🧪 Testing Food Provider Registration');
  console.log('Registration data:', testData);
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, testData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Registration successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.log('❌ Registration failed!');
    console.log('Error status:', error.response?.status);
    console.log('Error data:', JSON.stringify(error.response?.data, null, 2));
    console.log('Error message:', error.message);
    
    return null;
  }
}

async function testLogin(email, password) {
  console.log('\n🧪 Testing Food Provider Login');
  console.log('Login data:', { email, password });
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, { email, password }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Login successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.log('❌ Login failed!');
    console.log('Error status:', error.response?.status);
    console.log('Error data:', JSON.stringify(error.response?.data, null, 2));
    console.log('Error message:', error.message);
    
    return null;
  }
}

async function runSimpleTest() {
  console.log('🚀 Starting Simple Food Provider Test');
  console.log('=' .repeat(50));
  
  // Test registration
  const registrationResult = await testRegistration();
  
  if (registrationResult) {
    // Test login
    await testLogin(testData.email, testData.password);
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('✅ Simple test completed!');
}

runSimpleTest().catch(console.error); 