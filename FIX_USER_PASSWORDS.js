const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Connect to the production MongoDB
const MONGODB_URI = 'mongodb+srv://assaleemofficial:Sarim786.@cluster0.9l5dppu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Define user schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['student', 'landlord', 'food_provider', 'admin'], required: true },
  isVerified: { type: Boolean, default: false },
  password: { type: String, required: true }
}, { timestamps: true });

async function fixUserPasswords() {
  try {
    console.log('🔐 Fixing user passwords...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const User = mongoose.model('User', userSchema);
    
    // Generate correct password hashes
    const studentPasswordHash = await bcrypt.hash('password123', 10);
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    
    console.log('🔑 Generated new password hashes');
    
    // Update users with correct passwords
    const updates = [
      { email: 'student@staykaru.com', password: studentPasswordHash },
      { email: 'admin@staykaru.com', password: adminPasswordHash },
      { email: 'landlord@staykaru.com', password: studentPasswordHash },
      { email: 'foodprovider@staykaru.com', password: studentPasswordHash }
    ];
    
    for (const update of updates) {
      const user = await User.findOneAndUpdate(
        { email: update.email },
        { password: update.password, isVerified: true },
        { new: true }
      );
      
      if (user) {
        console.log(`✅ Updated password for ${update.email}`);
      } else {
        console.log(`⚠️ User ${update.email} not found`);
      }
    }
    
    // Verify passwords work
    console.log('\n🧪 Verifying passwords...');
    const testStudent = await User.findOne({ email: 'student@staykaru.com' });
    const testAdmin = await User.findOne({ email: 'admin@staykaru.com' });
    
    if (testStudent) {
      const studentMatch = await bcrypt.compare('password123', testStudent.password);
      console.log(`Student password verification: ${studentMatch ? '✅' : '❌'}`);
    }
    
    if (testAdmin) {
      const adminMatch = await bcrypt.compare('admin123', testAdmin.password);
      console.log(`Admin password verification: ${adminMatch ? '✅' : '❌'}`);
    }
    
    console.log('\n✅ Password fixes completed!');
    console.log('\n🔐 Updated credentials:');
    console.log('Student: student@staykaru.com / password123');
    console.log('Admin: admin@staykaru.com / admin123');
    console.log('Landlord: landlord@staykaru.com / password123');
    console.log('Food Provider: foodprovider@staykaru.com / password123');
    
  } catch (error) {
    console.error('❌ Error fixing passwords:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔒 Database connection closed');
  }
}

// Run the function
if (require.main === module) {
  fixUserPasswords()
    .then(() => {
      console.log('🎯 Password fixes completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Password fix failed:', error);
      process.exit(1);
    });
}

module.exports = { fixUserPasswords };
