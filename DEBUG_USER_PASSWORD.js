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

async function debugUserPassword() {
  try {
    console.log('🔍 Debugging user password...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const User = mongoose.model('User', userSchema);
    
    // Find the student user
    const student = await User.findOne({ email: 'student@staykaru.com' });
    
    if (student) {
      console.log('\n👤 Student user found:');
      console.log(`   Name: ${student.name}`);
      console.log(`   Email: ${student.email}`);
      console.log(`   Role: ${student.role}`);
      console.log(`   Verified: ${student.isVerified}`);
      console.log(`   Password Hash: ${student.password}`);
      
      // Test current password
      const currentMatch = await bcrypt.compare('password123', student.password);
      console.log(`   Current password match: ${currentMatch ? '✅' : '❌'}`);
      
      if (!currentMatch) {
        console.log('\n🔄 Creating new password hash...');
        const newHash = await bcrypt.hash('password123', 10);
        console.log(`   New hash: ${newHash}`);
        
        // Update the user
        student.password = newHash;
        await student.save();
        console.log('✅ Password updated in database');
        
        // Verify the update
        const updatedUser = await User.findOne({ email: 'student@staykaru.com' });
        const newMatch = await bcrypt.compare('password123', updatedUser.password);
        console.log(`   Updated password match: ${newMatch ? '✅' : '❌'}`);
      }
    } else {
      console.log('❌ Student user not found');
    }
    
    // Also check admin user
    const admin = await User.findOne({ email: 'admin@staykaru.com' });
    
    if (admin) {
      console.log('\n👤 Admin user found:');
      console.log(`   Name: ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Verified: ${admin.isVerified}`);
      
      // Test admin password
      const adminMatch = await bcrypt.compare('admin123', admin.password);
      console.log(`   Admin password match: ${adminMatch ? '✅' : '❌'}`);
      
      if (!adminMatch) {
        console.log('\n🔄 Creating new admin password hash...');
        const newAdminHash = await bcrypt.hash('admin123', 10);
        console.log(`   New admin hash: ${newAdminHash}`);
        
        // Update the admin
        admin.password = newAdminHash;
        await admin.save();
        console.log('✅ Admin password updated in database');
        
        // Verify the update
        const updatedAdmin = await User.findOne({ email: 'admin@staykaru.com' });
        const newAdminMatch = await bcrypt.compare('admin123', updatedAdmin.password);
        console.log(`   Updated admin password match: ${newAdminMatch ? '✅' : '❌'}`);
      }
    }
    
    console.log('\n✅ Password debugging completed!');
    
  } catch (error) {
    console.error('❌ Error debugging passwords:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔒 Database connection closed');
  }
}

// Run the function
if (require.main === module) {
  debugUserPassword()
    .then(() => {
      console.log('🎯 Password debugging completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Debugging failed:', error);
      process.exit(1);
    });
}

module.exports = { debugUserPassword };
