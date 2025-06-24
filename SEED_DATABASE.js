const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { MongoClient } = require('mongodb');

// MongoDB connection
const DB_URI = 'mongodb+srv://assaleemofficial:Sarim786.@cluster0.9l5dppu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

class DataSeeder {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      this.client = new MongoClient(DB_URI);
      await this.client.connect();
      this.db = this.client.db('staykaru');
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }

  async seedRestaurants() {
    console.log('🍽️ Starting restaurant data seeding...');
    
    const restaurants = [];
    const menuItems = [];
    const csvPath = path.join(__dirname, 'restaurants_data_analysis.csv');
    
    return new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          // Filter for Pakistani restaurants only
          if (row.country === 'Pakistan' && row.vertical === 'restaurants') {
            const restaurant = this.createRestaurantFromCSV(row);
            restaurants.push(restaurant);
            
            // Create sample menu items for each restaurant
            const menuItemsForRestaurant = this.createSampleMenuItems(restaurant);
            menuItems.push(...menuItemsForRestaurant);
          }
        })
        .on('end', async () => {
          try {
            console.log(`📊 Found ${restaurants.length} Pakistani restaurants`);
            
            if (restaurants.length > 0) {
              // Insert restaurants
              const restaurantCollection = this.db.collection('foodproviders');
              await restaurantCollection.deleteMany({}); // Clear existing data
              const restaurantResult = await restaurantCollection.insertMany(restaurants);
              console.log(`✅ Inserted ${restaurantResult.insertedCount} restaurants`);
              
              // Insert menu items
              const menuCollection = this.db.collection('menuitems');
              await menuCollection.deleteMany({}); // Clear existing data
              const menuResult = await menuCollection.insertMany(menuItems);
              console.log(`✅ Inserted ${menuResult.insertedCount} menu items`);
            }
            
            resolve({ restaurants: restaurants.length, menuItems: menuItems.length });
          } catch (error) {
            console.error('❌ Error inserting restaurant data:', error);
            reject(error);
          }
        })
        .on('error', reject);
    });
  }

  createRestaurantFromCSV(row) {
    const cuisineTypes = this.mapCuisineType(row.main_cuisine);
    
    return {
      name: row.name.trim(),
      description: `Delicious ${row.main_cuisine || 'Pakistani'} cuisine in ${row.city}`,
      address: `${row.post_code}, ${row.city}, Pakistan`,
      phone: this.generatePakistaniPhone(),
      email: this.generateRestaurantEmail(row.name),
      location: {
        type: 'Point',
        coordinates: [parseFloat(row.longitude), parseFloat(row.latitude)]
      },
      city: row.city,
      cuisineTypes: cuisineTypes,
      rating: parseFloat(row.rating) || 0,
      totalReviews: parseInt(row.review_number) || 0,
      isActive: row.is_active === 'TRUE',
      deliveryAvailable: true,
      minimumOrderAmount: parseInt(row.minimum_order_amount) || 0,
      deliveryTime: `${parseInt(row.minimum_delivery_time) || 30}-${parseInt(row.minimum_delivery_time) + 15 || 45} mins`,
      operatingHours: this.generateOperatingHours(),
      approvalStatus: 'approved',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  createSampleMenuItems(restaurant) {
    const menuItems = [];
    const itemTemplates = this.getMenuItemTemplates(restaurant.cuisineTypes[0]);
    
    // Create 8-12 menu items per restaurant
    const itemCount = Math.floor(Math.random() * 5) + 8;
    
    for (let i = 0; i < itemCount && i < itemTemplates.length; i++) {
      const template = itemTemplates[i];
      menuItems.push({
        name: template.name,
        description: template.description,
        price: template.basePrice + Math.floor(Math.random() * 100),
        category: template.category,
        provider: restaurant._id || null, // Will be updated after restaurant insertion
        isActive: true,
        approvalStatus: 'approved',
        ingredients: template.ingredients,
        isVegetarian: template.isVegetarian || false,
        isSpicy: template.isSpicy || false,
        preparationTime: Math.floor(Math.random() * 20) + 10,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return menuItems;
  }

  getMenuItemTemplates(cuisineType) {
    const templates = {
      Pakistani: [
        { name: 'Chicken Biryani', description: 'Aromatic basmati rice with tender chicken', basePrice: 350, category: 'Main Course', ingredients: ['Basmati Rice', 'Chicken', 'Yogurt', 'Spices'], isSpicy: true },
        { name: 'Beef Karahi', description: 'Spicy beef curry cooked in wok', basePrice: 450, category: 'Main Course', ingredients: ['Beef', 'Tomatoes', 'Onions', 'Spices'], isSpicy: true },
        { name: 'Chicken Tikka', description: 'Grilled marinated chicken pieces', basePrice: 300, category: 'Appetizer', ingredients: ['Chicken', 'Yogurt', 'Spices'], isSpicy: true },
        { name: 'Seekh Kebab', description: 'Minced meat grilled on skewers', basePrice: 250, category: 'Appetizer', ingredients: ['Minced Meat', 'Spices', 'Onions'] },
        { name: 'Dal Makhani', description: 'Creamy black lentil curry', basePrice: 200, category: 'Main Course', ingredients: ['Black Lentils', 'Butter', 'Cream'], isVegetarian: true },
        { name: 'Naan', description: 'Fresh baked bread', basePrice: 50, category: 'Bread', ingredients: ['Flour', 'Yogurt'], isVegetarian: true },
        { name: 'Chicken Qorma', description: 'Mild chicken curry in yogurt sauce', basePrice: 380, category: 'Main Course', ingredients: ['Chicken', 'Yogurt', 'Onions'] },
        { name: 'Mutton Pulao', description: 'Fragrant rice with tender mutton', basePrice: 420, category: 'Main Course', ingredients: ['Basmati Rice', 'Mutton', 'Spices'] },
        { name: 'Lassi', description: 'Traditional yogurt drink', basePrice: 80, category: 'Beverage', ingredients: ['Yogurt', 'Sugar'], isVegetarian: true },
        { name: 'Gulab Jamun', description: 'Sweet milk dumplings in syrup', basePrice: 120, category: 'Dessert', ingredients: ['Milk', 'Sugar', 'Rose Water'], isVegetarian: true }
      ],
      'Fast Food': [
        { name: 'Chicken Burger', description: 'Crispy chicken burger with fries', basePrice: 280, category: 'Main Course', ingredients: ['Chicken', 'Bun', 'Lettuce', 'Mayo'] },
        { name: 'Beef Burger', description: 'Juicy beef patty burger', basePrice: 320, category: 'Main Course', ingredients: ['Beef Patty', 'Bun', 'Cheese', 'Onions'] },
        { name: 'Chicken Roll', description: 'Spiced chicken wrapped in paratha', basePrice: 180, category: 'Snack', ingredients: ['Chicken', 'Paratha', 'Chutney'], isSpicy: true },
        { name: 'French Fries', description: 'Crispy golden fries', basePrice: 150, category: 'Side', ingredients: ['Potatoes', 'Salt'], isVegetarian: true },
        { name: 'Chicken Wings', description: 'Spicy grilled chicken wings', basePrice: 250, category: 'Appetizer', ingredients: ['Chicken Wings', 'Hot Sauce'], isSpicy: true },
        { name: 'Fish Burger', description: 'Crispy fish fillet burger', basePrice: 300, category: 'Main Course', ingredients: ['Fish', 'Bun', 'Tartar Sauce'] },
        { name: 'Soft Drink', description: 'Chilled carbonated drink', basePrice: 60, category: 'Beverage', ingredients: ['Cola'], isVegetarian: true },
        { name: 'Chicken Nuggets', description: 'Bite-sized crispy chicken', basePrice: 220, category: 'Snack', ingredients: ['Chicken', 'Breadcrumbs'] }
      ],
      Pizza: [
        { name: 'Margherita Pizza', description: 'Classic tomato and mozzarella pizza', basePrice: 450, category: 'Main Course', ingredients: ['Dough', 'Tomato Sauce', 'Mozzarella'], isVegetarian: true },
        { name: 'Chicken Tikka Pizza', description: 'Pizza topped with chicken tikka', basePrice: 550, category: 'Main Course', ingredients: ['Dough', 'Chicken Tikka', 'Cheese'], isSpicy: true },
        { name: 'Beef Pepperoni Pizza', description: 'Spicy pepperoni pizza', basePrice: 580, category: 'Main Course', ingredients: ['Dough', 'Pepperoni', 'Cheese'], isSpicy: true },
        { name: 'Vegetable Supreme', description: 'Pizza loaded with fresh vegetables', basePrice: 480, category: 'Main Course', ingredients: ['Dough', 'Mixed Vegetables', 'Cheese'], isVegetarian: true },
        { name: 'Garlic Bread', description: 'Toasted bread with garlic butter', basePrice: 180, category: 'Side', ingredients: ['Bread', 'Garlic', 'Butter'], isVegetarian: true }
      ],
      Chinese: [
        { name: 'Chicken Fried Rice', description: 'Wok-fried rice with chicken', basePrice: 320, category: 'Main Course', ingredients: ['Rice', 'Chicken', 'Vegetables', 'Soy Sauce'] },
        { name: 'Sweet & Sour Chicken', description: 'Crispy chicken in sweet sauce', basePrice: 380, category: 'Main Course', ingredients: ['Chicken', 'Pineapple', 'Bell Peppers'] },
        { name: 'Spring Rolls', description: 'Crispy vegetable rolls', basePrice: 200, category: 'Appetizer', ingredients: ['Vegetables', 'Wrapper'], isVegetarian: true },
        { name: 'Beef Chow Mein', description: 'Stir-fried noodles with beef', basePrice: 350, category: 'Main Course', ingredients: ['Noodles', 'Beef', 'Vegetables'] },
        { name: 'Hot & Sour Soup', description: 'Spicy and tangy soup', basePrice: 150, category: 'Soup', ingredients: ['Tofu', 'Mushrooms', 'Vinegar'], isSpicy: true, isVegetarian: true }
      ]
    };

    return templates[cuisineType] || templates.Pakistani;
  }

  mapCuisineType(mainCuisine) {
    const mapping = {
      'Pakistani': ['Pakistani', 'Desi'],
      'Fast Food': ['Fast Food', 'American'],
      'Pizza': ['Italian', 'Pizza'],
      'Chinese': ['Chinese', 'Asian'],
      'Asian': ['Asian', 'Pakistani'],
      'Beverages': ['Beverages', 'Drinks'],
      'Cambodian': ['Pakistani'], // Map to Pakistani for our use case
    };
    
    return mapping[mainCuisine] || ['Pakistani', 'Desi'];
  }

  generatePakistaniPhone() {
    const prefixes = ['+9230', '+9231', '+9332', '+9333', '+9334', '+9335'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(Math.random() * 90000000) + 10000000;
    return `${prefix}${number.toString().substring(0, 7)}`;
  }

  generateRestaurantEmail(name) {
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${cleanName.substring(0, 10)}@restaurant.com`;
  }

  generateOperatingHours() {
    return {
      monday: { open: '09:00', close: '23:00' },
      tuesday: { open: '09:00', close: '23:00' },
      wednesday: { open: '09:00', close: '23:00' },
      thursday: { open: '09:00', close: '23:00' },
      friday: { open: '09:00', close: '23:00' },
      saturday: { open: '09:00', close: '23:00' },
      sunday: { open: '10:00', close: '22:00' }
    };
  }

  async seedAccommodations() {
    console.log('🏠 Starting accommodation data seeding...');
    
    const accommodations = [
      // Karachi accommodations
      {
        title: 'Student Hostel - University Road',
        description: 'Comfortable accommodation near major universities',
        address: 'University Road, Karachi, Pakistan',
        city: 'Karachi',
        propertyType: 'hostel',
        pricePerNight: 800,
        amenities: ['WiFi', 'AC', 'Mess', 'Security', 'Study Room'],
        location: { type: 'Point', coordinates: [67.0011, 24.8607] },
        capacity: 2,
        isActive: true,
        rating: 4.2,
        totalReviews: 45
      },
      {
        title: 'Boys Hostel - Gulshan',
        description: 'Modern boys hostel in Gulshan area',
        address: 'Gulshan-e-Iqbal, Karachi, Pakistan',
        city: 'Karachi',
        propertyType: 'hostel',
        pricePerNight: 1000,
        amenities: ['WiFi', 'AC', 'Gym', 'Laundry', 'Parking'],
        location: { type: 'Point', coordinates: [67.0857, 24.9265] },
        capacity: 2,
        isActive: true,
        rating: 4.0,
        totalReviews: 28
      },
      {
        title: 'Girls Hostel - Defence',
        description: 'Safe and secure accommodation for female students',
        address: 'Defence Housing Authority, Karachi, Pakistan',
        city: 'Karachi',
        propertyType: 'hostel',
        pricePerNight: 1200,
        amenities: ['WiFi', 'AC', 'Security', 'Mess', 'Common Room'],
        location: { type: 'Point', coordinates: [67.0648, 24.8059] },
        capacity: 1,
        isActive: true,
        rating: 4.5,
        totalReviews: 67
      },
      // Lahore accommodations
      {
        title: 'Student Lodge - Johar Town',
        description: 'Affordable student accommodation in Johar Town',
        address: 'Johar Town, Lahore, Pakistan',
        city: 'Lahore',
        propertyType: 'lodge',
        pricePerNight: 700,
        amenities: ['WiFi', 'Fan', 'Kitchen', 'Study Area'],
        location: { type: 'Point', coordinates: [74.2707, 31.4697] },
        capacity: 3,
        isActive: true,
        rating: 3.8,
        totalReviews: 34
      },
      {
        title: 'University Hostel - Model Town',
        description: 'Premium hostel near universities',
        address: 'Model Town, Lahore, Pakistan',
        city: 'Lahore',
        propertyType: 'hostel',
        pricePerNight: 1100,
        amenities: ['WiFi', 'AC', 'Mess', 'Library', 'Sports'],
        location: { type: 'Point', coordinates: [74.3274, 31.4734] },
        capacity: 2,
        isActive: true,
        rating: 4.3,
        totalReviews: 89
      },
      // Islamabad accommodations
      {
        title: 'Capital Student House - F-7',
        description: 'Modern accommodation in the heart of Islamabad',
        address: 'F-7 Markaz, Islamabad, Pakistan',
        city: 'Islamabad',
        propertyType: 'apartment',
        pricePerNight: 1500,
        amenities: ['WiFi', 'AC', 'Kitchen', 'Parking', 'Security'],
        location: { type: 'Point', coordinates: [73.0479, 33.7077] },
        capacity: 2,
        isActive: true,
        rating: 4.6,
        totalReviews: 78
      },
      {
        title: 'Student Residence - G-9',
        description: 'Budget-friendly student accommodation',
        address: 'G-9 Markaz, Islamabad, Pakistan',
        city: 'Islamabad',
        propertyType: 'hostel',
        pricePerNight: 900,
        amenities: ['WiFi', 'Fan', 'Common Kitchen', 'Study Room'],
        location: { type: 'Point', coordinates: [73.0169, 33.6938] },
        capacity: 4,
        isActive: true,
        rating: 4.1,
        totalReviews: 52
      }
    ];

    // Add more accommodations with variations
    const moreAccommodations = this.generateMoreAccommodations();
    accommodations.push(...moreAccommodations);

    try {
      const accommodationCollection = this.db.collection('accommodations');
      await accommodationCollection.deleteMany({}); // Clear existing data
      const result = await accommodationCollection.insertMany(accommodations);
      console.log(`✅ Inserted ${result.insertedCount} accommodations`);
      return accommodations.length;
    } catch (error) {
      console.error('❌ Error inserting accommodation data:', error);
      throw error;
    }
  }

  generateMoreAccommodations() {
    const cities = ['Karachi', 'Lahore', 'Islamabad'];
    const propertyTypes = ['hostel', 'apartment', 'lodge', 'pg'];
    const areas = {
      'Karachi': ['Gulshan', 'Defence', 'Clifton', 'North Nazimabad', 'Korangi', 'Malir'],
      'Lahore': ['Johar Town', 'Model Town', 'DHA', 'Gulberg', 'Cantt', 'Faisal Town'],
      'Islamabad': ['F-7', 'F-8', 'G-9', 'G-10', 'I-8', 'Blue Area']
    };
    
    const accommodations = [];
    
    for (let i = 0; i < 50; i++) {
      const city = cities[Math.floor(Math.random() * cities.length)];
      const area = areas[city][Math.floor(Math.random() * areas[city].length)];
      const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
      
      accommodations.push({
        title: `${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} - ${area}`,
        description: `Quality ${propertyType} accommodation in ${area}, ${city}`,
        address: `${area}, ${city}, Pakistan`,
        city: city,
        propertyType: propertyType,
        pricePerNight: Math.floor(Math.random() * 1000) + 500,
        amenities: this.getRandomAmenities(),
        location: this.generateLocationForCity(city),
        capacity: Math.floor(Math.random() * 4) + 1,
        isActive: true,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        totalReviews: Math.floor(Math.random() * 100) + 10,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return accommodations;
  }

  getRandomAmenities() {
    const allAmenities = ['WiFi', 'AC', 'Fan', 'Kitchen', 'Mess', 'Laundry', 'Parking', 'Security', 'Gym', 'Study Room', 'Common Room', 'Library', 'Sports', 'CCTV'];
    const count = Math.floor(Math.random() * 6) + 3;
    const shuffled = allAmenities.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  generateLocationForCity(city) {
    const cityCoords = {
      'Karachi': [67.0011, 24.8607],
      'Lahore': [74.3587, 31.5204],
      'Islamabad': [73.0479, 33.6844]
    };
    
    const base = cityCoords[city];
    return {
      type: 'Point',
      coordinates: [
        base[0] + (Math.random() - 0.5) * 0.1,
        base[1] + (Math.random() - 0.5) * 0.1
      ]
    };
  }

  async close() {
    if (this.client) {
      await this.client.close();
      console.log('✅ MongoDB connection closed');
    }
  }
}

async function main() {
  const seeder = new DataSeeder();
  
  try {
    await seeder.connect();
    
    console.log('🚀 Starting data seeding process...');
    
    // Seed restaurants and menu items
    const restaurantResult = await seeder.seedRestaurants();
    console.log(`📊 Restaurant seeding completed: ${restaurantResult.restaurants} restaurants, ${restaurantResult.menuItems} menu items`);
    
    // Seed accommodations
    const accommodationCount = await seeder.seedAccommodations();
    console.log(`🏠 Accommodation seeding completed: ${accommodationCount} accommodations`);
    
    console.log('✅ Data seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Data seeding failed:', error);
  } finally {
    await seeder.close();
  }
}

// Run the seeder
if (require.main === module) {
  main();
}

module.exports = DataSeeder;
