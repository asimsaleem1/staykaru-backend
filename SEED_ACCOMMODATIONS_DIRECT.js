const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Connect to the production MongoDB
const MONGODB_URI = 'mongodb+srv://assaleemofficial:Sarim786.@cluster0.9l5dppu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Define schemas manually
const citySchema = new mongoose.Schema({
  name: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  coordinates: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['student', 'landlord', 'food_provider', 'admin'], required: true },
  isVerified: { type: Boolean, default: false },
  password: { type: String, required: true }
}, { timestamps: true });

const accommodationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
  coordinates: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  },
  price: { type: Number, required: true, min: 0 },
  amenities: { type: [String], default: [] },
  availability: { type: [Date], default: [] },
  landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: false },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  images: { type: [String], default: [] },
  rejectionReason: { type: String }
}, { timestamps: true });

// Create indexes
accommodationSchema.index({ coordinates: '2dsphere' });
citySchema.index({ coordinates: '2dsphere' });

// Helper function to safely convert string to number
function safeNumber(str, defaultValue = 0) {
  if (typeof str === 'number') return str;
  if (typeof str === 'string') {
    const num = parseFloat(str.replace(/[^0-9.-]/g, ''));
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

// Function to process CSV and convert to accommodation format
async function processCSV(filePath, cityName) {
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
          
          // Skip if essential data is missing
          if (!row.name || !row.address || latitude === 0 || longitude === 0) {
            return;
          }
          
          const accommodation = {
            title: row.name.trim(),
            description: row['primaryHost/about'] || `Beautiful accommodation in ${cityName}. Perfect for students and travelers looking for comfortable stay.`,
            coordinates: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            price: Math.round(priceAmount * 280), // Convert USD to PKR (approximate)
            amenities: generateRandomAmenities(),
            availability: [
              new Date(),
              new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
            ],
            isActive: true,
            approvalStatus: 'approved',
            images: generateRandomImages(),
            cityName: cityName,
            address: row.address || `${cityName}, Pakistan`
          };
          
          accommodations.push(accommodation);
        } catch (error) {
          console.log(`Error processing row: ${error.message}`);
        }
      })
      .on('end', () => {
        console.log(`✅ Processed ${accommodations.length} accommodations from ${cityName}`);
        resolve(accommodations);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

async function seedAccommodations() {
  try {
    console.log('🚀 Starting accommodation data seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get models
    const City = mongoose.model('City', citySchema);
    const User = mongoose.model('User', userSchema);
    const Accommodation = mongoose.model('Accommodation', accommodationSchema);
    
    // Clear existing accommodations
    console.log('🧹 Clearing existing accommodation data...');
    await Accommodation.deleteMany({});
    
    // Ensure cities exist
    const cities = ['Islamabad', 'Lahore', 'Karachi'];
    const cityDocs = {};
    
    for (const cityName of cities) {
      let city = await City.findOne({ name: cityName });
      if (!city) {
        city = new City({
          name: cityName,
          state: cityName === 'Islamabad' ? 'Islamabad Capital Territory' : (cityName === 'Lahore' ? 'Punjab' : 'Sindh'),
          country: 'Pakistan',
          coordinates: {
            type: 'Point',
            coordinates: cityName === 'Islamabad' ? [73.0479, 33.6844] : (cityName === 'Lahore' ? [74.3587, 31.5204] : [67.0011, 24.8607])
          }
        });
        await city.save();
        console.log(`✅ Created city: ${cityName}`);
      }
      cityDocs[cityName] = city;
    }
    
    // Create default landlord user if needed
    let landlord = await User.findOne({ email: 'landlord@staykaru.com' });
    if (!landlord) {
      landlord = new User({
        name: 'Default Landlord',
        email: 'landlord@staykaru.com',
        phone: '+92-300-1234567',
        role: 'landlord',
        isVerified: true,
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // password
      });
      await landlord.save();
      console.log('✅ Created default landlord user');
    }
    
    const csvFiles = [
      { file: 'Islamabad.csv', city: 'Islamabad' },
      { file: 'Lahore.csv', city: 'Lahore' },
      { file: 'Karachi.csv', city: 'Karachi' }
    ];
    
    let totalAccommodations = 0;
    
    for (const { file, city } of csvFiles) {
      const filePath = path.join(process.cwd(), file);
      
      if (fs.existsSync(filePath)) {
        console.log(`📁 Processing ${file}...`);
        
        const accommodations = await processCSV(filePath, city);
        
        if (accommodations.length > 0) {
          // Map accommodations to proper format
          const mappedAccommodations = accommodations.map(accommodation => ({
            ...accommodation,
            city: cityDocs[city]._id,
            landlord: landlord._id
          }));
          
          await Accommodation.insertMany(mappedAccommodations);
          console.log(`✅ Successfully inserted ${accommodations.length} accommodations for ${city}`);
          totalAccommodations += accommodations.length;
        } else {
          console.log(`⚠️ No valid accommodations found in ${file}`);
        }
      } else {
        console.log(`⚠️ File ${file} not found, skipping...`);
      }
    }
    
    // Final statistics
    const finalCount = await Accommodation.countDocuments();
    console.log(`\n🎉 ACCOMMODATION SEEDING COMPLETED!`);
    console.log(`📊 Total accommodations in database: ${finalCount}`);
    console.log(`🏨 New accommodations added: ${totalAccommodations}`);
    
    // Show breakdown by city
    console.log('\n📍 Accommodations by city:');
    const cityStats = await Accommodation.aggregate([
      {
        $lookup: {
          from: 'cities',
          localField: 'city',
          foreignField: '_id',
          as: 'cityInfo'
        }
      },
      {
        $group: {
          _id: { $arrayElemAt: ['$cityInfo.name', 0] },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    cityStats.forEach(city => {
      console.log(`   ${city._id}: ${city.count} accommodations`);
    });
    
    console.log('\n✨ All accommodation data has been successfully seeded!');
    console.log('🔍 You can now test the accommodations endpoints in your API');
    
  } catch (error) {
    console.error('❌ Error seeding accommodation data:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔒 Database connection closed');
  }
}

// Run the seeding
if (require.main === module) {
  seedAccommodations()
    .then(() => {
      console.log('🎯 Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedAccommodations };
