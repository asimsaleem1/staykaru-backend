const axios = require('axios');

const BASE_URL = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api';

async function testFoodProviderModule() {
  console.log('🚀 Testing Food Provider Module...');
  
  try {
    // 1. Test admin login
    console.log('1. Testing admin login...');
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@staykaru.com',
      password: 'admin123'
    });
    console.log('✅ Admin login successful');
    const adminToken = adminLogin.data.token;

    // 2. Test food provider registration with unique email
    console.log('2. Testing food provider registration...');
    const uniqueEmail = `foodprovider${Date.now()}@test.com`;
    const userReg = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test Food Provider',
      email: uniqueEmail,
      password: 'test123',
      role: 'food_provider',
      phone: '1234567890',
      countryCode: '+1',
      gender: 'male'
    });
    console.log('✅ Food provider registration successful');

    // 3. Test food provider login
    console.log('3. Testing food provider login...');
    const foodProviderLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: uniqueEmail,
      password: 'test123'
    });
    console.log('✅ Food provider login successful');
    const foodProviderToken = foodProviderLogin.data.token;

    // 4. Test create food provider
    console.log('4. Testing create food provider...');
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
      headers: { 'Authorization': `Bearer ${foodProviderToken}` }
    });
    console.log('✅ Food provider created successfully');
    const providerId = createProvider.data.id || createProvider.data._id;

    // 5. Test get all food providers
    console.log('5. Testing get all food providers...');
    const getAllProviders = await axios.get(`${BASE_URL}/food-providers`);
    console.log('✅ Get all food providers successful');

    // 6. Test get my providers
    console.log('6. Testing get my providers...');
    const getMyProviders = await axios.get(`${BASE_URL}/food-providers/owner/my-providers`, {
      headers: { 'Authorization': `Bearer ${foodProviderToken}` }
    });
    console.log('✅ Get my providers successful');

    // 7. Test get provider dashboard
    console.log('7. Testing get provider dashboard...');
    const getDashboard = await axios.get(`${BASE_URL}/food-providers/owner/dashboard`, {
      headers: { 'Authorization': `Bearer ${foodProviderToken}` }
    });
    console.log('✅ Get provider dashboard successful');

    // 8. Test admin endpoints
    console.log('8. Testing admin endpoints...');
    const getPendingProviders = await axios.get(`${BASE_URL}/food-providers/admin/pending`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log('✅ Get pending providers successful');

    const getAllProvidersAdmin = await axios.get(`${BASE_URL}/food-providers/admin/all`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log('✅ Get all providers admin successful');

    // 9. Test menu items
    console.log('9. Testing menu items...');
    const testMenuItem = {
      name: 'Test Pizza',
      description: 'A delicious test pizza',
      price: 15.99,
      currency: 'USD',
      category: 'Pizza',
      ingredients: ['Dough', 'Tomato sauce', 'Cheese'],
      dietary_info: ['Vegetarian'],
      availability: true,
      preparation_time: 20,
      food_provider_id: providerId
    };

    const createMenuItem = await axios.post(`${BASE_URL}/menu-items`, testMenuItem, {
      headers: { 'Authorization': `Bearer ${foodProviderToken}` }
    });
    console.log('✅ Menu item created successfully');

    const getAllMenuItems = await axios.get(`${BASE_URL}/menu-items`);
    console.log('✅ Get all menu items successful');

    // 10. Test analytics
    console.log('10. Testing analytics...');
    const getAnalytics = await axios.get(`${BASE_URL}/food-providers/owner/analytics?days=30`, {
      headers: { 'Authorization': `Bearer ${foodProviderToken}` }
    });
    console.log('✅ Get analytics successful');

    // 11. Test provider orders
    console.log('11. Testing provider orders...');
    const getOrders = await axios.get(`${BASE_URL}/food-providers/owner/orders/${providerId}`, {
      headers: { 'Authorization': `Bearer ${foodProviderToken}` }
    });
    console.log('✅ Get provider orders successful');

    console.log('🎉 All Food Provider Module tests passed!');
    return { success: true, message: 'All tests passed' };

  } catch (error) {
    console.log('❌ Test failed:', error.response?.status, error.response?.data?.message || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

testFoodProviderModule(); 