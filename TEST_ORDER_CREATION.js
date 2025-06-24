const http = require('http');

async function testOrderCreation() {
  // First, get the admin token
  const adminLoginData = {
    email: 'assaleemofficial@gmail.com',
    password: 'Kaassa1007443@'
  };

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(adminLoginData);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log('🔐 Getting admin token...');
    
    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        try {
          const loginData = JSON.parse(responseBody);
          if (res.statusCode === 200) {
            console.log('✅ Admin login successful');
            const token = loginData.access_token;
            
            // Test getting food providers and menu items
            testFoodProviders(token).then(resolve).catch(reject);
          } else {
            console.log('❌ Admin login failed:', loginData);
            reject(new Error('Admin login failed'));
          }
        } catch (e) {
          console.log('❌ Could not parse response:', e.message);
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Network error:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testFoodProviders(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/food-providers',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    console.log('🍕 Getting food providers...');
    
    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        console.log('Food providers response status:', res.statusCode);
        console.log('Food providers response:', responseBody.substring(0, 500));
        
        try {
          const foodProviders = JSON.parse(responseBody);
          if (Array.isArray(foodProviders) && foodProviders.length > 0) {
            console.log(`✅ Found ${foodProviders.length} food providers`);
            console.log('First food provider:', {
              id: foodProviders[0]._id,
              businessName: foodProviders[0].businessName
            });
            
            // Test getting menu items
            testMenuItems(token, foodProviders[0]._id).then(resolve).catch(reject);
          } else {
            console.log('❌ No food providers found - creating test data first');
            createTestFoodProvider(token).then(() => {
              testFoodProviders(token).then(resolve).catch(reject);
            }).catch(reject);
          }
        } catch (e) {
          console.log('❌ Could not parse food providers response:', e.message);
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Network error:', error.message);
      reject(error);
    });

    req.end();
  });
}

async function testMenuItems(token, foodProviderId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/menu-items',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    console.log('🍔 Getting menu items...');
    
    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        console.log('Menu items response status:', res.statusCode);
        console.log('Menu items response:', responseBody.substring(0, 500));
        
        try {
          const menuItems = JSON.parse(responseBody);
          if (Array.isArray(menuItems) && menuItems.length > 0) {
            console.log(`✅ Found ${menuItems.length} menu items`);
            
            // Find any menu item to use for testing
            const testMenuItem = menuItems[0];
            console.log('Using menu item for test:', {
              id: testMenuItem._id,
              name: testMenuItem.name,
              price: testMenuItem.price,
              provider: testMenuItem.provider ? testMenuItem.provider._id || testMenuItem.provider : 'unknown'
            });
            
            // Get the provider ID from the menu item
            const providerIdFromItem = testMenuItem.provider._id || testMenuItem.provider;
            
            // Test order creation with this menu item
            testOrderCreationWithItems(token, providerIdFromItem, [testMenuItem]).then(resolve).catch(reject);
          } else {
            console.log('❌ No menu items found - cannot proceed with order test');
            reject(new Error('No menu items available for testing'));
          }
        } catch (e) {
          console.log('❌ Could not parse menu items response:', e.message);
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Network error:', error.message);
      reject(error);
    });

    req.end();
  });
}

async function createTestFoodProvider(token) {
  return new Promise((resolve, reject) => {
    const testProvider = {
      businessName: "Test Food Joint",
      description: "A test food provider for order testing",
      address: "456 Food Street, Karachi, Pakistan",
      phone: "+923001234567",
      cuisineTypes: ["Pakistani", "Fast Food"],
      operatingHours: {
        monday: { open: "09:00", close: "22:00" },
        tuesday: { open: "09:00", close: "22:00" }
      }
    };

    const postData = JSON.stringify(testProvider);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/food-providers',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log('🏪 Creating test food provider...');
    
    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        console.log('Create food provider response status:', res.statusCode);
        console.log('Create food provider response:', responseBody.substring(0, 300));
        
        if (res.statusCode === 201) {
          console.log('✅ Test food provider created');
          resolve();
        } else {
          console.log('❌ Failed to create test food provider');
          reject(new Error('Failed to create test food provider'));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Network error:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function createTestMenuItem(token, foodProviderId) {
  return new Promise((resolve, reject) => {
    const testMenuItem = {
      name: "Test Biryani",
      description: "Delicious test biryani",
      price: 350,
      provider: foodProviderId
    };

    const postData = JSON.stringify(testMenuItem);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/menu-items',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log('🍛 Creating test menu item...');
    
    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        console.log('Create menu item response status:', res.statusCode);
        console.log('Create menu item response:', responseBody.substring(0, 300));
        
        if (res.statusCode === 201) {
          console.log('✅ Test menu item created');
          resolve();
        } else {
          console.log('❌ Failed to create test menu item');
          reject(new Error('Failed to create test menu item'));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Network error:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testOrderCreationWithItems(token, foodProviderId, menuItems) {
  return new Promise((resolve, reject) => {
    const testOrder = {
      food_provider: foodProviderId,
      items: [
        {
          menu_item: menuItems[0]._id,
          quantity: 2,
          special_instructions: "Extra spicy please"
        }
      ],
      delivery_location: {
        coordinates: {
          latitude: 24.8607,
          longitude: 67.0011
        },
        address: "123 Student Hostel, University Road, Karachi",
        landmark: "Near Main Gate"
      },
      delivery_instructions: "Call when you arrive"
    };

    const postData = JSON.stringify(testOrder);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/orders',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log('🛒 Creating test order...');
    console.log('Order data:', testOrder);
    
    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        console.log('Order creation response status:', res.statusCode);
        console.log('Order creation response:', responseBody);
        
        if (res.statusCode === 201) {
          console.log('✅ Test order created successfully!');
        } else {
          console.log('❌ Failed to create test order');
          try {
            const errorData = JSON.parse(responseBody);
            console.log('Error details:', errorData);
          } catch (e) {
            console.log('Could not parse error response');
          }
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('❌ Network error:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

testOrderCreation().catch(console.error);
