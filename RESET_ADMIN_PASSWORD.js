const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function resetAdminPassword() {
  try {
    // Connect to MongoDB Atlas (using the same connection as the backend)
    await mongoose.connect('mongodb+srv://assaleemofficial:Sarim786.@cluster0.9l5dppu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB');

    // Define User schema (matching your existing schema)
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

    // Find admin user
    const adminEmail = 'assaleemofficial@gmail.com';
    const newPassword = 'Kaassa1007443@';
    
    const admin = await User.findOne({ email: adminEmail });
    
    if (admin) {
      console.log('Found admin user:', {
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive
      });
      
      // Hash the new password
      const saltRounds = 12; // Same as in your app
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      // Update the password
      const result = await User.updateOne(
        { email: adminEmail },
        { 
          password: hashedPassword,
          isActive: true,
          emailVerified: true,
          updatedAt: new Date()
        }
      );
      
      console.log('Password update result:', result);
      console.log('Admin password has been successfully updated!');
      console.log('You can now login with:');
      console.log('Email:', adminEmail);
      console.log('Password:', newPassword);
      
    } else {
      console.log('Admin user not found. Creating new admin user...');
      
      // Create new admin user
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      const newAdmin = new User({
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        phone: '1234567890',
        countryCode: '+92',
        gender: 'male',
        isActive: true,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await newAdmin.save();
      console.log('New admin user created successfully!');
      console.log('Login credentials:');
      console.log('Email:', adminEmail);
      console.log('Password:', newPassword);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

resetAdminPassword();
