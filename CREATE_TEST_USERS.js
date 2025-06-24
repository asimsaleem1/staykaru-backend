const mongoose = require('mongoose');

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

async function createTestUsers() {
  try {
    console.log('🚀 Creating test users for production...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const User = mongoose.model('User', userSchema);
    
    // Create test users
    const testUsers = [
      {
        name: 'Test Student',
        email: 'student@staykaru.com',
        phone: '+92-300-1111111',
        role: 'student',
        isVerified: true,
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // password123
      },
      {
        name: 'Test Admin',
        email: 'admin@staykaru.com',
        phone: '+92-300-0000000',
        role: 'admin',
        isVerified: true,
        password: '$2b$10$eQW8JqCELJM.JFCvbOZIcOkDdJ5Gm/oK2V.G6qRfS2wUhKLO2.2Gu' // admin123
      },
      {
        name: 'Test Landlord',
        email: 'landlord@staykaru.com',
        phone: '+92-300-2222222',
        role: 'landlord',
        isVerified: true,
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // password123
      },
      {
        name: 'Test Food Provider',
        email: 'foodprovider@staykaru.com',
        phone: '+92-300-3333333',
        role: 'food_provider',
        isVerified: true,
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // password123
      }
    ];
    
    for (const userData of testUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`✅ User ${userData.email} already exists`);
        
        // Update password if needed
        if (existingUser.password !== userData.password) {
          existingUser.password = userData.password;
          await existingUser.save();
          console.log(`🔄 Updated password for ${userData.email}`);
        }
      } else {
        const newUser = new User(userData);
        await newUser.save();
        console.log(`✅ Created user: ${userData.email} (${userData.role})`);
      }
    }
    
    // Show all users
    console.log('\n📋 All users in database:');
    const allUsers = await User.find({}, 'name email role isVerified');
    allUsers.forEach(user => {
      console.log(`   ${user.email} - ${user.name} (${user.role}) - Verified: ${user.isVerified}`);
    });
    
    console.log('\n✅ Test users created/updated successfully!');
    console.log('\n🔐 Login credentials:');
    console.log('Student: student@staykaru.com / password123');
    console.log('Admin: admin@staykaru.com / admin123');
    console.log('Landlord: landlord@staykaru.com / password123');
    console.log('Food Provider: foodprovider@staykaru.com / password123');
    
  } catch (error) {
    console.error('❌ Error creating test users:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔒 Database connection closed');
  }
}

// Run the function
if (require.main === module) {
  createTestUsers()
    .then(() => {
      console.log('🎯 Test users setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { createTestUsers };
