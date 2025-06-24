const http = require('http');

async function testBookingCreation() {
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
            
            // Test getting accommodations
            testAccommodations(token).then(resolve).catch(reject);
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

async function testAccommodations(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/accommodations',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    console.log('🏠 Getting accommodations...');
    
    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        console.log('Accommodations response status:', res.statusCode);
        console.log('Accommodations response:', responseBody.substring(0, 500));
        
        try {
          const accommodations = JSON.parse(responseBody);
          if (Array.isArray(accommodations) && accommodations.length > 0) {
            console.log(`✅ Found ${accommodations.length} accommodations`);
            console.log('First accommodation:', {
              id: accommodations[0]._id,
              title: accommodations[0].title,
              price: accommodations[0].price
            });
            
            // Test booking creation with first accommodation
            testBookingCreationWithAccommodation(token, accommodations[0]._id).then(resolve).catch(reject);
          } else {
            console.log('❌ No accommodations found - creating test accommodation first');
            createTestAccommodation(token).then(() => {
              testAccommodations(token).then(resolve).catch(reject);
            }).catch(reject);
          }
        } catch (e) {
          console.log('❌ Could not parse accommodations response:', e.message);
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

async function createTestAccommodation(token) {
  return new Promise((resolve, reject) => {
    const testAccommodation = {
      title: "Test Student Accommodation",
      description: "A test accommodation for booking testing",
      price: 1500,
      address: "123 Test Street, Lahore, Pakistan",
      amenities: ["WiFi", "AC", "Kitchen"],
      images: [],
      city: "675f1f77bcf86cd799439012" // dummy city ID
    };

    const postData = JSON.stringify(testAccommodation);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/accommodations',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log('🏗️ Creating test accommodation...');
    
    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        console.log('Create accommodation response status:', res.statusCode);
        console.log('Create accommodation response:', responseBody.substring(0, 300));
        
        if (res.statusCode === 201) {
          console.log('✅ Test accommodation created');
          resolve();
        } else {
          console.log('❌ Failed to create test accommodation');
          reject(new Error('Failed to create test accommodation'));
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

async function testBookingCreationWithAccommodation(token, accommodationId) {
  return new Promise((resolve, reject) => {
    const testBooking = {
      accommodation: accommodationId,
      checkInDate: "2025-07-01T00:00:00.000Z",
      checkOutDate: "2025-07-07T00:00:00.000Z",
      guests: 2,
      payment_method: "card",
      special_requests: "Early check-in preferred"
    };

    const postData = JSON.stringify(testBooking);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/bookings',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log('📅 Creating test booking...');
    console.log('Booking data:', testBooking);
    
    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        console.log('Booking creation response status:', res.statusCode);
        console.log('Booking creation response:', responseBody);
        
        if (res.statusCode === 201) {
          console.log('✅ Test booking created successfully!');
        } else {
          console.log('❌ Failed to create test booking');
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

testBookingCreation().catch(console.error);
