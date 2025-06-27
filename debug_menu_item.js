const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function debugMenuItemCreation() {
  try {
    // 1. Register a food provider
    console.log('1. Registering food provider...');
    const registrationData = {
      email: `debug_${Date.now()}@test.com`,
      password: 'TestPassword123!',
      name: 'Debug Food Provider',
      phone: '+1234567890',
      address: '123 Debug Street',
      role: 'food_provider',
      countryCode: '+92',
      gender: 'male'
    };
    
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registrationData);
    console.log('Registration successful:', registerResponse.data);
    
    const userId = registerResponse.data.user.id;
    const token = registerResponse.data.access_token;
    
    // 2. Login to get fresh token
    console.log('\n2. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: registrationData.email,
      password: registrationData.password
    });
    console.log('Login successful:', loginResponse.data);
    
    const authToken = loginResponse.data.access_token;
    
    // 3. Get cities to create food provider
    console.log('\n3. Getting cities...');
    const citiesResponse = await axios.get(`${BASE_URL}/location/cities`);
    console.log('Cities found:', citiesResponse.data.length);
    
    const cityId = citiesResponse.data[0]._id;
    
    // 4. Create food provider entity
    console.log('\n4. Creating food provider entity...');
    const foodProviderData = {
      name: 'Debug Food Provider Business',
      description: 'A debug food provider business',
      location: cityId,
      cuisine_type: 'Italian',
      operating_hours: {
        open: '09:00',
        close: '22:00'
      },
      contact_info: {
        phone: '+1234567890',
        email: registrationData.email
      },
      is_active: true
    };
    
    const foodProviderResponse = await axios.post(`${BASE_URL}/food-providers`, foodProviderData, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    console.log('Food provider created:', foodProviderResponse.data);
    
    const foodProviderId = foodProviderResponse.data._id;
    
    // 5. Create menu item
    console.log('\n5. Creating menu item...');
    const menuItemData = {
      name: 'Debug Menu Item',
      price: 100,
      description: 'A debug menu item',
      category: 'Main Course',
      preparation_time: 20,
      is_available: true,
      dietary_info: {
        is_vegetarian: false,
        is_vegan: false,
        is_gluten_free: false,
        allergens: ['nuts']
      }
    };
    
    const menuItemResponse = await axios.post(`${BASE_URL}/food-providers/owner/menu-items/${foodProviderId}`, menuItemData, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    console.log('\n=== MENU ITEM CREATION RESPONSE ===');
    console.log('Status:', menuItemResponse.status);
    console.log('Headers:', menuItemResponse.headers);
    console.log('Data:', JSON.stringify(menuItemResponse.data, null, 2));
    console.log('Data type:', typeof menuItemResponse.data);
    console.log('Data keys:', Object.keys(menuItemResponse.data));
    
    if (Array.isArray(menuItemResponse.data)) {
      console.log('Is array with length:', menuItemResponse.data.length);
      if (menuItemResponse.data.length > 0) {
        console.log('First item keys:', Object.keys(menuItemResponse.data[0]));
        console.log('First item ID:', menuItemResponse.data[0]._id || menuItemResponse.data[0].id);
      }
    }
    
    // 6. Get menu items to verify
    console.log('\n6. Getting menu items...');
    const getMenuItemsResponse = await axios.get(`${BASE_URL}/food-providers/owner/menu-items/${foodProviderId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    console.log('Menu items found:', getMenuItemsResponse.data.length);
    if (getMenuItemsResponse.data.length > 0) {
      console.log('First menu item:', getMenuItemsResponse.data[0]);
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

debugMenuItemCreation(); 