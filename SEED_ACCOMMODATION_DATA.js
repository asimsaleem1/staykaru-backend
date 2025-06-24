const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { MongoClient } = require('mongodb');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/staykaru';

// Helper function to safely convert string to number
function safeNumber(str, defaultValue = 0) {
  if (typeof str === 'number') return str;
  if (typeof str === 'string') {
    const num = parseFloat(str.replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? defaultValue : num;
  }
  return defaultValue;
}

// Helper function to safely convert string to integer
function safeInt(str, defaultValue = 1) {
  if (typeof str === 'number') return Math.round(str);
  if (typeof str === 'string') {
    const num = parseInt(str.replace(/[^0-9]/g, ''));
    return isNaN(num) ? defaultValue : num;
  }
  return defaultValue;
}

// Helper function to generate random amenities
function generateRandomAmenities() {
  const allAmenities = [
    'WiFi', 'Air Conditioning', 'Heating', 'Kitchen', 'Washer', 'Dryer', 
    'Free Parking', 'Pool', 'Hot Tub', 'Gym', 'BBQ Grill', 'Garden',
    'Balcony', 'Terrace', 'Fireplace', 'TV', 'Cable TV', 'Netflix',
    'Workspace', 'Breakfast', 'Pets Allowed', '24/7 Security', 'Elevator',
    'Wheelchair Accessible', 'Smoking Allowed', 'Events Allowed'
  ];
  
  const numAmenities = Math.floor(Math.random() * 8) + 3; // 3-10 amenities
  const selectedAmenities = [];
  
  for (let i = 0; i < numAmenities; i++) {
    const randomAmenity = allAmenities[Math.floor(Math.random() * allAmenities.length)];
    if (!selectedAmenities.includes(randomAmenity)) {
      selectedAmenities.push(randomAmenity);
    }
  }
  
  return selectedAmenities;
}

// Helper function to generate random images
function generateRandomImages() {
  const imageCount = Math.floor(Math.random() * 6) + 3; // 3-8 images
  const images = [];
  
  for (let i = 0; i < imageCount; i++) {
    images.push(`https://picsum.photos/800/600?random=${Math.floor(Math.random() * 10000)}`);
  }
  
  return images;
}

// Helper function to determine accommodation type
function determineAccommodationType(roomType, name) {
  const nameAndType = `${name} ${roomType}`.toLowerCase();
  
  if (nameAndType.includes('hotel') || nameAndType.includes('guest house') || nameAndType.includes('hostel')) {
    return 'Hotel';
  } else if (nameAndType.includes('apartment') || nameAndType.includes('flat')) {
    return 'Apartment';
  } else if (nameAndType.includes('house') || nameAndType.includes('villa')) {
    return 'House';
  } else if (nameAndType.includes('room') || nameAndType.includes('private')) {
    return 'Room';
  } else if (nameAndType.includes('studio')) {
    return 'Studio';
  } else {
    return 'Other';
  }
}

// Function to process CSV and convert to accommodation format
async function processCSV(filePath, city) {
  return new Promise((resolve, reject) => {
    const accommodations = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          // Extract and clean data
          const latitude = safeNumber(row['location/lat']);
          const longitude = safeNumber(row['location/lng']);
          const priceAmount = safeNumber(row['pricing/rate/amount'], 25);
          const guests = safeInt(row['numberOfGuests'], 2);
          
          // Skip if essential data is missing
          if (!row.name || !row.address || latitude === 0 || longitude === 0) {
            return;
          }
          
          const accommodation = {
            title: row.name.trim(),
            description: row['primaryHost/about'] || `Beautiful ${row.roomType || 'accommodation'} in ${city}. Perfect for students and travelers looking for comfortable stay.`,
            address: row.address.trim(),
            city: city,
            location: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            pricePerNight: Math.round(priceAmount * 280), // Convert USD to PKR (approximate)
            maxGuests: Math.max(1, guests),
            bedrooms: Math.max(1, Math.floor(guests / 2)),
            bathrooms: Math.max(1, Math.floor(guests / 3) + 1),
            accommodationType: determineAccommodationType(row.roomType || '', row.name || ''),
            amenities: generateRandomAmenities(),
            images: generateRandomImages(),
            availability: {
              startDate: new Date(),
              endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
            },
            host: {
              name: row['primaryHost/firstName'] || 'Host',
              email: `${(row['primaryHost/firstName'] || 'host').toLowerCase().replace(/\s+/g, '')}@example.com`,
              phone: `+92-300-${Math.floor(Math.random() * 9000000) + 1000000}`,
              profilePicture: row['primaryHost/pictureUrl'] || 'https://via.placeholder.com/150',
              joinedDate: new Date(row['primaryHost/memberSince'] || '2020-01-01'),
              isVerified: row['primaryHost/badges/0'] === 'Identity verified' || Math.random() > 0.3
            },
            rating: {
              average: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 to 5.0
              count: Math.floor(Math.random() * 100) + 5
            },
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          accommodations.push(accommodation);
        } catch (error) {
          console.log(`Error processing row: ${error.message}`);
        }
      })
      .on('end', () => {
        console.log(`✅ Processed ${accommodations.length} accommodations from ${city}`);
        resolve(accommodations);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

// Main seeding function
async function seedAccommodationData() {
  let client;
  
  try {
    console.log('🚀 Starting accommodation data seeding...');
    
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('staykaru');
    const accommodationsCollection = db.collection('accommodations');
    
    // Clear existing accommodations (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing accommodation data...');
    await accommodationsCollection.deleteMany({});
    
    const csvFiles = [
      { file: 'Islamabad.csv', city: 'Islamabad' },
      { file: 'Lahore.csv', city: 'Lahore' },
      { file: 'Karachi.csv', city: 'Karachi' } // If you have this file
    ];
    
    let totalAccommodations = 0;
    
    for (const { file, city } of csvFiles) {
      const filePath = path.join(__dirname, file);
      
      if (fs.existsSync(filePath)) {
        console.log(`📁 Processing ${file}...`);
        
        const accommodations = await processCSV(filePath, city);
        
        if (accommodations.length > 0) {
          await accommodationsCollection.insertMany(accommodations);
          console.log(`✅ Successfully inserted ${accommodations.length} accommodations for ${city}`);
          totalAccommodations += accommodations.length;
        } else {
          console.log(`⚠️ No valid accommodations found in ${file}`);
        }
      } else {
        console.log(`⚠️ File ${file} not found, skipping...`);
      }
    }
    
    // Create indexes for better performance
    console.log('🔍 Creating database indexes...');
    await accommodationsCollection.createIndex({ city: 1 });
    await accommodationsCollection.createIndex({ pricePerNight: 1 });
    await accommodationsCollection.createIndex({ accommodationType: 1 });
    await accommodationsCollection.createIndex({ location: '2dsphere' });
    await accommodationsCollection.createIndex({ 'rating.average': -1 });
    await accommodationsCollection.createIndex({ isActive: 1 });
    
    console.log('✅ Database indexes created successfully');
    
    // Final statistics
    const finalCount = await accommodationsCollection.countDocuments();
    console.log(`\n🎉 ACCOMMODATION SEEDING COMPLETED!`);
    console.log(`📊 Total accommodations in database: ${finalCount}`);
    console.log(`🏨 New accommodations added: ${totalAccommodations}`);
    
    // Show breakdown by city
    console.log('\n📍 Accommodations by city:');
    const cities = await accommodationsCollection.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    
    cities.forEach(city => {
      console.log(`   ${city._id}: ${city.count} accommodations`);
    });
    
    // Show breakdown by type
    console.log('\n🏠 Accommodations by type:');
    const types = await accommodationsCollection.aggregate([
      { $group: { _id: '$accommodationType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    types.forEach(type => {
      console.log(`   ${type._id}: ${type.count} accommodations`);
    });
    
    console.log('\n✨ All accommodation data has been successfully seeded!');
    console.log('🔍 You can now test the accommodations endpoints in your API');
    
  } catch (error) {
    console.error('❌ Error seeding accommodation data:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔒 Database connection closed');
    }
  }
}

// Run the seeding
if (require.main === module) {
  seedAccommodationData();
}

module.exports = { seedAccommodationData };
