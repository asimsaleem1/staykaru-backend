const axios = require('axios');

const BASE_URL = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api';

async function debugFoodProvider() {
  console.log('🔍 Debugging Food Provider Authentication...');
  
  try {
    // 1. Create a unique food provider user
    const uniqueEmail = `foodprovider${Date.now()}@test.com`;
    console.log('📧 Using email:', uniqueEmail);
    
    const userReg = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test Food Provider',
      email: uniqueEmail,
      password: 'test123',
      role: 'food_provider',
      phone: '1234567890',
      countryCode: '+1',
      gender: 'male'
    });
    console.log('✅ Registration successful:', userReg.status);
    console.log('👤 User data:', userReg.data);

    // 2. Login as food provider
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: uniqueEmail,
      password: 'test123'
    });
    console.log('✅ Login successful:', loginRes.status);
    console.log('🔑 Token received:', loginRes.data.access_token ? 'YES' : 'NO');
    console.log('👤 User role:', loginRes.data.user?.role);
    
    const token = loginRes.data.access_token;

    // 3. Test token by accessing a protected endpoint
    console.log('🔒 Testing token with protected endpoint...');
    const testEndpoint = await axios.get(`${BASE_URL}/food-providers/owner/my-providers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Protected endpoint access successful:', testEndpoint.status);

    // 4. Test create food provider
    console.log('🍕 Testing create food provider...');
    const testFoodProvider = {
      name: 'Test Restaurant',
      description: 'A test restaurant',
      location: '507f1f77bcf86cd799439011',
      cuisine_type: 'Italian',
      operating_hours: {
        open: '09:00',
        close: '22:00'
      },
      contact_info: {
        phone: '+1234567890',
        email: 'test@restaurant.com'
      },
      is_active: true
    };

    const createProvider = await axios.post(`${BASE_URL}/food-providers`, testFoodProvider, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Food provider created successfully:', createProvider.status);
    console.log('🏪 Provider ID:', createProvider.data.id || createProvider.data._id);

    // 5. Test get provider dashboard
    console.log('📊 Testing get provider dashboard...');
    const getDashboard = await axios.get(`${BASE_URL}/food-providers/owner/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Get provider dashboard successful:', getDashboard.status);

    // 6. Test analytics
    console.log('📈 Testing analytics...');
    const getAnalytics = await axios.get(`${BASE_URL}/food-providers/owner/analytics?days=30`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Get analytics successful:', getAnalytics.status);

    console.log('🎉 All tests passed! Food Provider module is working correctly.');

  } catch (error) {
    console.log('❌ Error occurred:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message);
    console.log('Full error:', error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('🔍 401 Unauthorized - This suggests an authentication issue');
      console.log('Possible causes:');
      console.log('1. Token not being sent correctly');
      console.log('2. Token format is wrong');
      console.log('3. User role is not correct');
      console.log('4. Guard is rejecting the request');
    }
  }
}

debugFoodProvider(); 