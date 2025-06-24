const { MongoClient } = require('mongodb');

// MongoDB connection
const DB_URI = 'mongodb+srv://assaleemofficial:Sarim786.@cluster0.9l5dppu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function checkDatabaseContent() {
  console.log('🔍 Checking StayKaru Database Content...');
  console.log('='.repeat(60));

  const client = new MongoClient(DB_URI);
  
  try {
    await client.connect();
    const db = client.db('staykaru');
    
    // Check food providers (restaurants)
    console.log('🍽️ RESTAURANTS (Food Providers):');
    const restaurantCount = await db.collection('foodproviders').countDocuments();
    console.log(`Total restaurants: ${restaurantCount}`);
    
    if (restaurantCount > 0) {
      const sampleRestaurants = await db.collection('foodproviders').find({}).limit(5).toArray();
      console.log('\n📊 Sample restaurants:');
      sampleRestaurants.forEach((restaurant, index) => {
        console.log(`${index + 1}. ${restaurant.name || restaurant.businessName}`);
        console.log(`   City: ${restaurant.city || 'Not specified'}`);
        console.log(`   Cuisine: ${restaurant.cuisineTypes || restaurant.cuisine_type || 'Not specified'}`);
        console.log(`   Rating: ${restaurant.rating || 0}`);
        console.log('');
      });
    }

    // Check menu items
    console.log('🍔 MENU ITEMS:');
    const menuCount = await db.collection('menuitems').countDocuments();
    console.log(`Total menu items: ${menuCount}`);
    
    if (menuCount > 0) {
      const sampleMenuItems = await db.collection('menuitems').find({}).limit(5).toArray();
      console.log('\n📊 Sample menu items:');
      sampleMenuItems.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name} - PKR ${item.price}`);
        console.log(`   Description: ${item.description}`);
        console.log('');
      });
    }

    // Check accommodations
    console.log('🏠 ACCOMMODATIONS:');
    const accommodationCount = await db.collection('accommodations').countDocuments();
    console.log(`Total accommodations: ${accommodationCount}`);
    
    if (accommodationCount > 0) {
      const sampleAccommodations = await db.collection('accommodations').find({}).limit(5).toArray();
      console.log('\n📊 Sample accommodations:');
      sampleAccommodations.forEach((accommodation, index) => {
        console.log(`${index + 1}. ${accommodation.title}`);
        console.log(`   City: ${accommodation.city}`);
        console.log(`   Price: PKR ${accommodation.pricePerNight}/night`);
        console.log(`   Type: ${accommodation.propertyType}`);
        console.log('');
      });
    }

    // Check users
    console.log('👥 USERS:');
    const userCount = await db.collection('users').countDocuments();
    console.log(`Total users: ${userCount}`);
    
    // Group by role
    const usersByRole = await db.collection('users').aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]).toArray();
    
    console.log('\n📊 Users by role:');
    usersByRole.forEach(role => {
      console.log(`   ${role._id}: ${role.count}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ Database content check completed!');
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await client.close();
  }
}

checkDatabaseContent();
