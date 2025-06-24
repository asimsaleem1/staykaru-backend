import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';
import { Accommodation, AccommodationDocument } from '../src/modules/accommodation/schema/accommodation.schema';

@Injectable()
export class AccommodationSeeder {
  constructor(
    @InjectModel(Accommodation.name) private accommodationModel: Model<AccommodationDocument>,
  ) {}

  // Helper function to safely convert string to number
  private safeNumber(str: any, defaultValue = 0): number {
    if (typeof str === 'number') return str;
    if (typeof str === 'string') {
      const num = parseFloat(str.replace(/[^0-9.-]/g, ''));
      return isNaN(num) ? defaultValue : num;
    }
    return defaultValue;
  }

  // Helper function to safely convert string to integer
  private safeInt(str: any, defaultValue = 1): number {
    if (typeof str === 'number') return Math.round(str);
    if (typeof str === 'string') {
      const num = parseInt(str.replace(/[^0-9]/g, ''));
      return isNaN(num) ? defaultValue : num;
    }
    return defaultValue;
  }

  // Helper function to generate random amenities
  private generateRandomAmenities(): string[] {
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
  private generateRandomImages(): string[] {
    const imageCount = Math.floor(Math.random() * 6) + 3; // 3-8 images
    const images = [];
    
    for (let i = 0; i < imageCount; i++) {
      images.push(`https://picsum.photos/800/600?random=${Math.floor(Math.random() * 10000)}`);
    }
    
    return images;
  }

  // Helper function to determine accommodation type
  private determineAccommodationType(roomType: string, name: string): string {
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
  private async processCSV(filePath: string, city: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const accommodations = [];
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          try {
            // Extract and clean data
            const latitude = this.safeNumber(row['location/lat']);
            const longitude = this.safeNumber(row['location/lng']);
            const priceAmount = this.safeNumber(row['pricing/rate/amount'], 25);
            const guests = this.safeInt(row['numberOfGuests'], 2);
            
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
              accommodationType: this.determineAccommodationType(row.roomType || '', row.name || ''),
              amenities: this.generateRandomAmenities(),
              images: this.generateRandomImages(),
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

  async seedAccommodations() {
    try {
      console.log('🚀 Starting accommodation data seeding...');
      
      // Clear existing accommodations
      console.log('🧹 Clearing existing accommodation data...');
      await this.accommodationModel.deleteMany({});
      
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
          
          const accommodations = await this.processCSV(filePath, city);
          
          if (accommodations.length > 0) {
            await this.accommodationModel.insertMany(accommodations);
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
      const finalCount = await this.accommodationModel.countDocuments();
      console.log(`\n🎉 ACCOMMODATION SEEDING COMPLETED!`);
      console.log(`📊 Total accommodations in database: ${finalCount}`);
      console.log(`🏨 New accommodations added: ${totalAccommodations}`);
      
      // Show breakdown by city
      console.log('\n📍 Accommodations by city:');
      const cities = await this.accommodationModel.aggregate([
        { $group: { _id: '$city', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);
      
      cities.forEach(city => {
        console.log(`   ${city._id}: ${city.count} accommodations`);
      });
      
      // Show breakdown by type
      console.log('\n🏠 Accommodations by type:');
      const types = await this.accommodationModel.aggregate([
        { $group: { _id: '$accommodationType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      types.forEach(type => {
        console.log(`   ${type._id}: ${type.count} accommodations`);
      });
      
      console.log('\n✨ All accommodation data has been successfully seeded!');
      
    } catch (error) {
      console.error('❌ Error seeding accommodation data:', error);
      throw error;
    }
  }
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(AccommodationSeeder);
  
  try {
    await seeder.seedAccommodations();
    console.log('🎯 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
