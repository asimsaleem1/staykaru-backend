const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function debugAdminUser() {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect('mongodb+srv://assaleemofficial:Sarim786.@cluster0.9l5dppu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB');

    // Define User schema
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
      phone: String,
      countryCode: String,
      gender: String,
      isActive: Boolean,
      emailVerified: Boolean,
      createdAt: Date,
      updatedAt: Date
    });

    const User = mongoose.model('User', userSchema);

    // Find and debug admin user
    const adminEmail = 'assaleemofficial@gmail.com';
    const testPassword = 'Kaassa1007443@';
    
    const admin = await User.findOne({ email: adminEmail });
    
    if (admin) {
      console.log('Admin user found:', {
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
        hasPassword: !!admin.password,
        passwordLength: admin.password ? admin.password.length : 0
      });
      
      // Test password comparison
      console.log('\nTesting password...');
      const isPasswordCorrect = await bcrypt.compare(testPassword, admin.password);
      console.log('Password test result:', isPasswordCorrect);
      
      if (!isPasswordCorrect) {
        console.log('\nPassword mismatch! Updating password again...');
        const hashedPassword = await bcrypt.hash(testPassword, 12);
        
        await User.updateOne(
          { email: adminEmail },
          { 
            password: hashedPassword,
            isActive: true,
            updatedAt: new Date()
          }
        );
        
        console.log('Password updated successfully');
        
        // Test again
        const updatedAdmin = await User.findOne({ email: adminEmail });
        const isNewPasswordCorrect = await bcrypt.compare(testPassword, updatedAdmin.password);
        console.log('New password test result:', isNewPasswordCorrect);
      }
      
    } else {
      console.log('Admin user not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

debugAdminUser();
