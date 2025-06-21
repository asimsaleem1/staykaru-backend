// @ts-nocheck
const axios = require('axios');

async function testRegistration() {
  try {
    console.log('Testing registration...');
    const response = await axios.post('http://localhost:3000/auth/register', {
      name: 'Test Student Dashboard',
      email: 'student.dashboard.test@university.edu',
      password: 'StudentPass123!',
      role: 'student',
      phone: '1234567890',
      countryCode: '+1',
      gender: 'male',
    });
    
    console.log('Success:', response.status, response.data);
  } catch (error) {
    console.log('Error:', error.response?.status, error.response?.data);
  }
}

testRegistration();
