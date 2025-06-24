const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function createSimpleAdminUser() {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect('mongodb+srv://assaleemofficial:Sarim786.@cluster0.9l5dppu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB');

    // Define User schema
    const userSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.model('User', userSchema);

    // Delete existing admin user first
    await User.deleteOne({ email: 'assaleemofficial@gmail.com' });
    console.log('Deleted existing admin user');

    // Create fresh admin user with simple unencrypted data
    const hashedPassword = await bcrypt.hash('Kaassa1007443@', 12);
    
    const adminUser = new User({
      name: 'Super Admin',
      email: 'assaleemofficial@gmail.com',
      password: hashedPassword,
      role: 'admin',
      phone: '+92123456789', // Simple unencrypted phone
      countryCode: '+92',
      gender: 'male',
      isActive: true,
      emailVerified: true,
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await adminUser.save();
    console.log('Created fresh admin user');
    
    // Test the login immediately
    const testUser = await User.findOne({ email: 'assaleemofficial@gmail.com' });
    console.log('Verification - found user:', {
      name: testUser.name,
      email: testUser.email,
      role: testUser.role,
      isActive: testUser.isActive,
      phone: testUser.phone
    });
    
    const isPasswordCorrect = await bcrypt.compare('Kaassa1007443@', testUser.password);
    console.log('Password verification:', isPasswordCorrect);
    
    if (isPasswordCorrect) {
      console.log('\n✅ Admin user created successfully!');
      console.log('Login credentials:');
      console.log('Email: assaleemofficial@gmail.com');
      console.log('Password: Kaassa1007443@');
    } else {
      console.log('❌ Password verification failed');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

createSimpleAdminUser();
