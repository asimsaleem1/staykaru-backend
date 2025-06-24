const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const https = require('https');
const http = require('http');

async function testLogin() {
  const loginData = {
    email: 'assaleemofficial@gmail.com',
    password: 'Kaassa1007443@'
  };

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(loginData);
    
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

    console.log('Testing login with:', loginData);
    
    const req = http.request(options, (res) => {
      console.log('Response status:', res.statusCode);
      console.log('Response headers:', res.headers);
      
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        console.log('Response body:', responseBody);
        
        try {
          const data = JSON.parse(responseBody);
          if (res.statusCode === 200 || res.statusCode === 201) {
            console.log('Login successful!');
            console.log('User data:', data.user);
            console.log('Access token received:', !!data.access_token);
          } else {
            console.log('Login failed');
            console.log('Error details:', data);
          }
        } catch (e) {
          console.log('Could not parse response:', e.message);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('Network error:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

testLogin();
