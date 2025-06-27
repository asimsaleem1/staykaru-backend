const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function debugBooking() {
  try {
    // First, register and login a student
    const studentEmail = `debug_student_${Date.now()}@test.com`;
    const studentPassword = 'student123';
    
    console.log('1. Registering student...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Debug Student',
      email: studentEmail,
      password: studentPassword,
      role: 'student',
      phone: '1234567890',
      countryCode: '+1',
      gender: 'male'
    });
    
    const token = registerResponse.data.access_token;
    const studentId = registerResponse.data.user.id;
    console.log('Student registered with ID:', studentId);
    
    // Get an accommodation
    console.log('2. Getting accommodations...');
    const accommodationsResponse = await axios.get(`${BASE_URL}/accommodations`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const accommodationId = accommodationsResponse.data[0]._id;
    console.log('Found accommodation:', accommodationId);
    
    // Create a booking
    console.log('3. Creating booking...');
    const bookingResponse = await axios.post(`${BASE_URL}/bookings`, {
      accommodation: accommodationId,
      checkInDate: '2025-07-01T00:00:00.000Z',
      checkOutDate: '2025-07-05T00:00:00.000Z',
      guests: 1,
      special_requests: 'Debug booking'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const bookingId = bookingResponse.data._id;
    console.log('Booking created with ID:', bookingId);
    
    // Now try to get the booking by ID (this should trigger the debug logs)
    console.log('4. Getting booking by ID...');
    const getBookingResponse = await axios.get(`${BASE_URL}/bookings/${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Booking retrieved successfully:', getBookingResponse.data);
    
  } catch (error) {
    console.error('Error:', error.response?.status, error.response?.data);
  }
}

debugBooking(); 