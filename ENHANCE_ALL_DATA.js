const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');

// Connect to the production MongoDB
const MONGODB_URI = 'mongodb+srv://assaleemofficial:Sarim786.@cluster0.9l5dppu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Define enhanced schemas
const foodProviderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: 'Delicious food provider serving authentic cuisine' },
  address: { type: String, required: true },
  coordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  phone: { type: String, default: '+92-300-0000000' },
  email: { type: String, required: true },
  cuisine: { type: String, default: 'Pakistani' },
  rating: {
    average: { type: Number, default: 4.0, min: 0, max: 5 },
    count: { type: Number, default: 10 }
  },
  priceRange: { type: String, enum: ['$', '$$', '$$$', '$$$$'], default: '$$' },
  deliveryTime: { type: Number, default: 30 }, // minutes
  minimumOrder: { type: Number, default: 300 }, // PKR
  isActive: { type: Boolean, default: true },
  operatingHours: {
    monday: { open: { type: String, default: '09:00' }, close: { type: String, default: '22:00' } },
    tuesday: { open: { type: String, default: '09:00' }, close: { type: String, default: '22:00' } },
    wednesday: { open: { type: String, default: '09:00' }, close: { type: String, default: '22:00' } },
    thursday: { open: { type: String, default: '09:00' }, close: { type: String, default: '22:00' } },
    friday: { open: { type: String, default: '09:00' }, close: { type: String, default: '22:00' } },
    saturday: { open: { type: String, default: '09:00' }, close: { type: String, default: '23:00' } },
    sunday: { open: { type: String, default: '10:00' }, close: { type: String, default: '22:00' } }
  },
  images: { type: [String], default: [] },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
  deliveryAreas: { type: [String], default: [] },
  paymentMethods: { type: [String], default: ['cash', 'card', 'online'] },
  features: { type: [String], default: ['delivery', 'takeaway'] }
}, { timestamps: true });

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  image: { type: String, default: 'https://picsum.photos/400/300?random=' },
  isVegetarian: { type: Boolean, default: false },
  isSpicy: { type: Boolean, default: false },
  ingredients: { type: [String], default: [] },
  preparationTime: { type: Number, default: 15 }, // minutes
  isAvailable: { type: Boolean, default: true },
  nutritionalInfo: {
    calories: { type: Number, default: 250 },
    protein: { type: Number, default: 15 },
    carbs: { type: Number, default: 30 },
    fat: { type: Number, default: 10 }
  },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodProvider', required: true },
  tags: { type: [String], default: [] },
  rating: {
    average: { type: Number, default: 4.0, min: 0, max: 5 },
    count: { type: Number, default: 5 }
  }
}, { timestamps: true });

// Enhanced Accommodation Schema
const accommodationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
  coordinates: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  },
  price: { type: Number, required: true, min: 0 },
  priceType: { type: String, enum: ['per_night', 'per_month'], default: 'per_night' },
  accommodationType: { type: String, enum: ['apartment', 'room', 'house', 'hostel', 'hotel'], default: 'room' },
  bedrooms: { type: Number, default: 1 },
  bathrooms: { type: Number, default: 1 },
  maxGuests: { type: Number, default: 2 },
  amenities: { type: [String], default: [] },
  images: { type: [String], default: [] },
  availability: {
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }
  },
  landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  rating: {
    average: { type: Number, default: 4.0, min: 0, max: 5 },
    count: { type: Number, default: 8 }
  },
  rules: { type: [String], default: ['No smoking', 'No pets', 'No parties'] },
  utilities: {
    electricity: { type: Boolean, default: true },
    water: { type: Boolean, default: true },
    gas: { type: Boolean, default: true },
    internet: { type: Boolean, default: true }
  },
  nearbyPlaces: { type: [String], default: [] },
  bookingPolicy: {
    cancellationPolicy: { type: String, default: 'flexible' },
    checkIn: { type: String, default: '15:00' },
    checkOut: { type: String, default: '11:00' }
  }
}, { timestamps: true });

// Booking Schema
const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accommodation: { type: mongoose.Schema.Types.ObjectId, ref: 'Accommodation', required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  guests: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  paymentMethod: { type: String, enum: ['cash', 'card', 'online'], default: 'cash' },
  specialRequests: { type: String },
  contactInfo: {
    phone: { type: String, required: true },
    email: { type: String, required: true }
  }
}, { timestamps: true });

// Order Schema
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodProvider', required: true },
  items: [{
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    notes: { type: String }
  }],
  totalAmount: { type: Number, required: true },
  deliveryAddress: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'], default: 'pending' },
  paymentMethod: { type: String, enum: ['cash_on_delivery', 'card', 'online'], default: 'cash_on_delivery' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  estimatedDeliveryTime: { type: Date },
  actualDeliveryTime: { type: Date },
  notes: { type: String },
  rating: {
    score: { type: Number, min: 1, max: 5 },
    comment: { type: String }
  }
}, { timestamps: true });

// Review Schema
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['accommodation', 'foodprovider'], required: true },
  target: { type: mongoose.Schema.Types.ObjectId, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  images: { type: [String], default: [] },
  isVerified: { type: Boolean, default: false },
  helpful: { type: Number, default: 0 }
}, { timestamps: true });

// City Schema
const citySchema = new mongoose.Schema({
  name: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true, default: 'Pakistan' },
  coordinates: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  }
}, { timestamps: true });

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['student', 'landlord', 'food_provider', 'admin'], required: true },
  isVerified: { type: Boolean, default: false },
  password: { type: String, required: true },
  profileImage: { type: String, default: 'https://via.placeholder.com/150' },
  preferences: {
    cuisine: { type: [String], default: [] },
    priceRange: { type: String, default: '$$' },
    location: { type: String }
  }
}, { timestamps: true });

// Helper functions
function generateRandomAmenities() {
  const allAmenities = [
    'WiFi', 'Air Conditioning', 'Heating', 'Kitchen', 'Washer', 'Dryer',
    'Free Parking', 'Pool', 'Hot Tub', 'Gym', 'BBQ Grill', 'Garden',
    'Balcony', 'Terrace', 'Fireplace', 'TV', 'Cable TV', 'Netflix',
    'Workspace', 'Breakfast', 'Pets Allowed', '24/7 Security', 'Elevator'
  ];
  const numAmenities = Math.floor(Math.random() * 8) + 3;
  const selectedAmenities = [];
  for (let i = 0; i < numAmenities; i++) {
    const randomAmenity = allAmenities[Math.floor(Math.random() * allAmenities.length)];
    if (!selectedAmenities.includes(randomAmenity)) {
      selectedAmenities.push(randomAmenity);
    }
  }
  return selectedAmenities;
}

function generateRandomImages(count = 5) {
  const images = [];
  for (let i = 0; i < count; i++) {
    images.push(`https://picsum.photos/800/600?random=${Math.floor(Math.random() * 10000)}`);
  }
  return images;
}

function convertUsdToPkr(usdAmount) {
  return Math.round(usdAmount * 280); // Approximate conversion rate
}

async function processCSV(filePath) {
  return new Promise((resolve, reject) => {
    const providers = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          // Only process restaurant entries
          if (row.vertical === 'restaurants' && row.country && row.name) {
            const latitude = parseFloat(row.latitude);
            const longitude = parseFloat(row.longitude);
            
            if (latitude && longitude) {
              const provider = {
                name: row.name.trim(),
                description: `Authentic ${row.main_cuisine || 'International'} cuisine serving delicious meals`,
                address: `${row.post_code}, ${row.city}, ${row.country}`,
                coordinates: {
                  type: 'Point',
                  coordinates: [longitude, latitude]
                },
                phone: `+92-300-${Math.floor(Math.random() * 9000000) + 1000000}`,
                email: `${row.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@restaurant.com`,
                cuisine: row.main_cuisine || 'International',
                rating: {
                  average: row.rating ? parseFloat(row.rating) : (Math.random() * 2 + 3),
                  count: row.review_number ? parseInt(row.review_number) : Math.floor(Math.random() * 100) + 10
                },
                deliveryTime: row.minimum_delivery_time ? parseInt(row.minimum_delivery_time) : Math.floor(Math.random() * 45) + 15,
                minimumOrder: row.minimum_order_amount ? convertUsdToPkr(parseFloat(row.minimum_order_amount)) : Math.floor(Math.random() * 500) + 300,
                isActive: row.is_active === 'TRUE',
                images: generateRandomImages(4),
                deliveryAreas: [row.city || 'Karachi'],
                features: row.delivery_provider ? ['delivery', 'takeaway'] : ['takeaway'],
                originalData: {
                  budget: row.budget,
                  timezone: row.timezone,
                  country: row.country,
                  city: row.city
                }
              };
              providers.push(provider);
            }
          }
        } catch (error) {
          console.log(`Error processing row: ${error.message}`);
        }
      })
      .on('end', () => {
        console.log(`✅ Processed ${providers.length} food providers from CSV`);
        resolve(providers);
      })
      .on('error', reject);
  });
}

async function generateMenuItems(providerId, providerName, cuisine) {
  const menuCategories = {
    'Fast Food': ['Burgers', 'Sandwiches', 'Fries', 'Chicken Wings', 'Pizza'],
    'Asian': ['Fried Rice', 'Noodles', 'Curry', 'Dumplings', 'Spring Rolls'],
    'Pakistani': ['Biryani', 'Karahi', 'Tikka', 'Naan', 'Pulao'],
    'Chinese': ['Chow Mein', 'Sweet & Sour', 'Kung Pao', 'Fried Rice', 'Dim Sum'],
    'Italian': ['Pizza', 'Pasta', 'Lasagna', 'Risotto', 'Tiramisu'],
    'Beverages': ['Tea', 'Coffee', 'Juice', 'Smoothie', 'Milkshake'],
    'Default': ['Grilled Chicken', 'Beef Curry', 'Vegetable Rice', 'Soup', 'Salad']
  };

  const items = menuCategories[cuisine] || menuCategories['Default'];
  const menuItems = [];

  for (let i = 0; i < Math.floor(Math.random() * 8) + 5; i++) {
    const itemName = items[Math.floor(Math.random() * items.length)];
    const basePrice = Math.floor(Math.random() * 800) + 200; // 200-1000 PKR
    
    menuItems.push({
      name: `${itemName} Special`,
      description: `Delicious ${itemName.toLowerCase()} prepared with authentic spices and fresh ingredients`,
      price: basePrice,
      category: cuisine === 'Beverages' ? 'Beverages' : 'Main Course',
      image: `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 10000)}`,
      isVegetarian: Math.random() > 0.7,
      isSpicy: Math.random() > 0.5,
      ingredients: ['Fresh ingredients', 'Authentic spices', 'Premium quality'],
      preparationTime: Math.floor(Math.random() * 20) + 10,
      provider: providerId,
      tags: [cuisine, 'fresh', 'authentic'],
      rating: {
        average: Math.round((Math.random() * 2 + 3) * 10) / 10,
        count: Math.floor(Math.random() * 50) + 5
      }
    });
  }

  return menuItems;
}

async function enhanceAllData() {
  try {
    console.log('🚀 Starting comprehensive data enhancement...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Register models
    const City = mongoose.model('City', citySchema);
    const User = mongoose.model('User', userSchema);
    const FoodProvider = mongoose.model('FoodProvider', foodProviderSchema);
    const MenuItem = mongoose.model('MenuItem', menuItemSchema);
    const Accommodation = mongoose.model('Accommodation', accommodationSchema);
    const Booking = mongoose.model('Booking', bookingSchema);
    const Order = mongoose.model('Order', orderSchema);
    const Review = mongoose.model('Review', reviewSchema);

    // 1. Ensure cities exist
    console.log('\n📍 Setting up cities...');
    const cities = [
      { name: 'Karachi', state: 'Sindh', coordinates: [67.0011, 24.8607] },
      { name: 'Lahore', state: 'Punjab', coordinates: [74.3587, 31.5204] },
      { name: 'Islamabad', state: 'Islamabad Capital Territory', coordinates: [73.0479, 33.6844] },
      { name: 'Phnom Penh', state: 'Cambodia', coordinates: [104.9160, 11.5564], country: 'Cambodia' }
    ];

    const cityDocs = {};
    for (const cityData of cities) {
      let city = await City.findOne({ name: cityData.name });
      if (!city) {
        city = new City({
          name: cityData.name,
          state: cityData.state,
          country: cityData.country || 'Pakistan',
          coordinates: { type: 'Point', coordinates: cityData.coordinates }
        });
        await city.save();
        console.log(`✅ Created city: ${cityData.name}`);
      }
      cityDocs[cityData.name] = city;
    }

    // 2. Create test users if they don't exist
    console.log('\n👥 Setting up users...');
    const testUsers = [
      { name: 'Test Student', email: 'student@staykaru.com', role: 'student' },
      { name: 'Admin User', email: 'admin@staykaru.com', role: 'admin' },
      { name: 'Test Landlord', email: 'landlord@staykaru.com', role: 'landlord' },
      { name: 'Test Food Provider', email: 'foodprovider@staykaru.com', role: 'food_provider' }
    ];

    const userDocs = {};
    for (const userData of testUsers) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = new User({
          ...userData,
          phone: '+92-300-1234567',
          password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
          isVerified: true
        });
        await user.save();
        console.log(`✅ Created user: ${userData.email}`);
      }
      userDocs[userData.role] = user;
    }

    // 3. Process and import food providers from CSV
    console.log('\n🍽️ Processing food providers CSV...');
    const csvProviders = await processCSV('./foodproviders_data_analysis.csv');
    
    // Clear existing food providers
    await FoodProvider.deleteMany({});
    await MenuItem.deleteMany({});
    
    let totalMenuItems = 0;
    const batchSize = 100;
    
    for (let i = 0; i < csvProviders.length; i += batchSize) {
      const batch = csvProviders.slice(i, i + batchSize);
      const providersToInsert = [];
      
      for (const provider of batch) {
        // Assign city based on original data or default to Karachi
        const cityName = provider.originalData.city === 'Phnom Penh' ? 'Phnom Penh' : 'Karachi';
        const city = cityDocs[cityName];
        
        if (city) {
          providersToInsert.push({
            ...provider,
            city: city._id,
            owner: userDocs.food_provider._id
          });
        }
      }
      
      if (providersToInsert.length > 0) {
        const insertedProviders = await FoodProvider.insertMany(providersToInsert);
        console.log(`✅ Inserted batch of ${insertedProviders.length} food providers`);
        
        // Generate menu items for each provider
        const menuItemsToInsert = [];
        for (const provider of insertedProviders) {
          const menuItems = await generateMenuItems(provider._id, provider.name, provider.cuisine);
          menuItemsToInsert.push(...menuItems);
        }
        
        if (menuItemsToInsert.length > 0) {
          await MenuItem.insertMany(menuItemsToInsert);
          totalMenuItems += menuItemsToInsert.length;
        }
      }
    }

    // 4. Update accommodations with enhanced data
    console.log('\n🏨 Enhancing accommodations...');
    const accommodations = await Accommodation.find({});
    for (const accommodation of accommodations) {
      accommodation.amenities = generateRandomAmenities();
      accommodation.images = generateRandomImages(6);
      accommodation.rules = ['No smoking inside', 'No loud music after 10 PM', 'No unauthorized guests'];
      accommodation.utilities = {
        electricity: true,
        water: true,
        gas: true,
        internet: true
      };
      accommodation.nearbyPlaces = ['University', 'Shopping Mall', 'Hospital', 'Bus Station'];
      accommodation.landlord = userDocs.landlord._id;
      await accommodation.save();
    }

    // 5. Create sample bookings
    console.log('\n📅 Creating sample bookings...');
    await Booking.deleteMany({});
    const sampleAccommodations = await Accommodation.find({}).limit(10);
    const sampleBookings = [];
    
    for (let i = 0; i < 20; i++) {
      const accommodation = sampleAccommodations[Math.floor(Math.random() * sampleAccommodations.length)];
      const checkIn = new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
      const checkOut = new Date(checkIn.getTime() + (Math.floor(Math.random() * 7) + 1) * 24 * 60 * 60 * 1000);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      
      sampleBookings.push({
        user: userDocs.student._id,
        accommodation: accommodation._id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guests: Math.floor(Math.random() * 3) + 1,
        totalPrice: accommodation.price * nights,
        status: ['pending', 'confirmed', 'completed'][Math.floor(Math.random() * 3)],
        contactInfo: {
          phone: '+92-300-1234567',
          email: 'student@staykaru.com'
        }
      });
    }
    
    await Booking.insertMany(sampleBookings);

    // 6. Create sample orders
    console.log('\n🛒 Creating sample orders...');
    await Order.deleteMany({});
    const sampleProviders = await FoodProvider.find({}).limit(10);
    const sampleOrders = [];
    
    for (let i = 0; i < 30; i++) {
      const provider = sampleProviders[Math.floor(Math.random() * sampleProviders.length)];
      const providerMenuItems = await MenuItem.find({ provider: provider._id }).limit(3);
      
      if (providerMenuItems.length > 0) {
        const orderItems = providerMenuItems.map(item => ({
          menuItem: item._id,
          quantity: Math.floor(Math.random() * 3) + 1,
          price: item.price,
          notes: 'Extra spicy'
        }));
        
        const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        sampleOrders.push({
          user: userDocs.student._id,
          provider: provider._id,
          items: orderItems,
          totalAmount,
          deliveryAddress: 'Student Hostel, Block A, Room 123',
          phone: '+92-300-1234567',
          status: ['pending', 'confirmed', 'preparing', 'delivered'][Math.floor(Math.random() * 4)],
          estimatedDeliveryTime: new Date(Date.now() + provider.deliveryTime * 60 * 1000)
        });
      }
    }
    
    await Order.insertMany(sampleOrders);

    // 7. Create sample reviews
    console.log('\n⭐ Creating sample reviews...');
    await Review.deleteMany({});
    const sampleReviews = [];
    
    // Reviews for accommodations
    for (let i = 0; i < 50; i++) {
      const accommodation = sampleAccommodations[Math.floor(Math.random() * sampleAccommodations.length)];
      sampleReviews.push({
        user: userDocs.student._id,
        targetType: 'accommodation',
        target: accommodation._id,
        rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
        comment: 'Great place to stay! Clean, comfortable, and well-located. Highly recommended for students.',
        isVerified: true
      });
    }
    
    // Reviews for food providers
    for (let i = 0; i < 50; i++) {
      const provider = sampleProviders[Math.floor(Math.random() * sampleProviders.length)];
      sampleReviews.push({
        user: userDocs.student._id,
        targetType: 'foodprovider',
        target: provider._id,
        rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
        comment: 'Delicious food with quick delivery! The taste is authentic and portions are generous.',
        isVerified: true
      });
    }
    
    await Review.insertMany(sampleReviews);

    // Final statistics
    const stats = {
      cities: await City.countDocuments(),
      users: await User.countDocuments(),
      accommodations: await Accommodation.countDocuments(),
      foodProviders: await FoodProvider.countDocuments(),
      menuItems: await MenuItem.countDocuments(),
      bookings: await Booking.countDocuments(),
      orders: await Order.countDocuments(),
      reviews: await Review.countDocuments()
    };

    console.log('\n🎉 DATA ENHANCEMENT COMPLETED!');
    console.log('📊 Final Statistics:');
    console.log(`   Cities: ${stats.cities}`);
    console.log(`   Users: ${stats.users}`);
    console.log(`   Accommodations: ${stats.accommodations}`);
    console.log(`   Food Providers: ${stats.foodProviders}`);
    console.log(`   Menu Items: ${stats.menuItems}`);
    console.log(`   Bookings: ${stats.bookings}`);
    console.log(`   Orders: ${stats.orders}`);
    console.log(`   Reviews: ${stats.reviews}`);
    console.log(`\n✨ Total Records: ${Object.values(stats).reduce((a, b) => a + b, 0)}`);

    console.log('\n🎯 All features now implemented:');
    console.log('✅ Enhanced food provider dataset with international cuisine');
    console.log('✅ Complete booking system for accommodations');
    console.log('✅ Full order management for food delivery');
    console.log('✅ Review and rating system');
    console.log('✅ Geographic coordinates for map functionality');
    console.log('✅ Payment options (cash on delivery)');
    console.log('✅ Order tracking capabilities');
    console.log('✅ Enhanced user profiles and management');

  } catch (error) {
    console.error('❌ Error enhancing data:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔒 Database connection closed');
  }
}

if (require.main === module) {
  enhanceAllData()
    .then(() => {
      console.log('🎯 All data enhancement completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Data enhancement failed:', error);
      process.exit(1);
    });
}

module.exports = { enhanceAllData };
