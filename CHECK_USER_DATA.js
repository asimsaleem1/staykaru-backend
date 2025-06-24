const mongoose = require('mongoose');

async function checkUserData() {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect('mongodb+srv://assaleemofficial:Sarim786.@cluster0.9l5dppu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB');

    // Define User schema
    const userSchema = new mongoose.Schema({}, { strict: false }); // Allow any fields
    const User = mongoose.model('User', userSchema);

    // Find all users with email containing 'assaleem'
    const users = await User.find({ 
      email: { $regex: 'assaleem', $options: 'i' } 
    }).exec();
    
    console.log('Found users:', users.length);
    
    users.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log('  _id:', user._id);
      console.log('  name:', user.name);
      console.log('  email:', user.email);
      console.log('  role:', user.role);
      console.log('  isActive:', user.isActive);
      console.log('  emailVerified:', user.emailVerified);
      console.log('  phone:', user.phone);
      console.log('  password (exists):', !!user.password);
      console.log('  password (length):', user.password ? user.password.length : 0);
      console.log('  createdAt:', user.createdAt);
      console.log('  updatedAt:', user.updatedAt);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkUserData();
