const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function testDirectDbLogin() {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect('mongodb+srv://assaleemofficial:Sarim786.@cluster0.9l5dppu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB');

    // Define User schema exactly as in the backend
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
      phone: String,
      countryCode: String,
      gender: String,
      isActive: { type: Boolean, default: true },
      emailVerified: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    const User = mongoose.model('User', userSchema);

    // Test the exact login process
    const email = 'assaleemofficial@gmail.com';
    const password = 'Kaassa1007443@';
    
    console.log('Testing login process...');
    console.log('Email:', email);
    console.log('Password:', password);
    
    // Step 1: Find user by email
    const user = await User.findOne({ email }).exec();
    console.log('\nStep 1 - Find user by email:');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', {
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      hasPassword: !!user.password
    });
    
    // Step 2: Check if user is active
    console.log('\nStep 2 - Check if user is active:');
    if (!user.isActive) {
      console.log('❌ User is not active');
      return;
    }
    console.log('✅ User is active');
    
    // Step 3: Validate password
    console.log('\nStep 3 - Validate password:');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password validation result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Password is invalid');
      
      // Let's check what the stored password hash looks like
      console.log('Stored password hash (first 20 chars):', user.password.substring(0, 20));
      console.log('Stored password hash length:', user.password.length);
      
      // Let's try hashing the password and comparing
      const newHash = await bcrypt.hash(password, 12);
      console.log('New hash (first 20 chars):', newHash.substring(0, 20));
      console.log('New hash length:', newHash.length);
      
      const testNewHash = await bcrypt.compare(password, newHash);
      console.log('New hash test:', testNewHash);
      
    } else {
      console.log('✅ Password is valid - login should work!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testDirectDbLogin();
