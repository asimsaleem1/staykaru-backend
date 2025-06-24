import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserPreferences } from '../schema/user-preferences.schema';
import { Accommodation } from '../../accommodation/schema/accommodation.schema';
import { FoodProvider } from '../../food_service/schema/food-provider.schema';
import { MenuItem } from '../../food_service/schema/menu-item.schema';

@Injectable()
export class RecommendationService {
  constructor(
    @InjectModel('UserPreferences') private userPreferencesModel: Model<UserPreferences>,
    @InjectModel('Accommodation') private accommodationModel: Model<Accommodation>,
    @InjectModel('FoodProvider') private foodProviderModel: Model<FoodProvider>,
    @InjectModel('MenuItem') private menuItemModel: Model<MenuItem>,
  ) {}

  async getLocationBasedAccommodations(userId: string, limit: number = 20) {
    try {
      const userPrefs = await this.userPreferencesModel.findOne({ user: userId });
      
      if (!userPrefs || !userPrefs.currentLocation) {
        // If no location preferences, return popular accommodations
        return await this.accommodationModel
          .find({ isActive: true })
          .populate('city landlord')
          .sort({ 'rating.average': -1 })
          .limit(limit);
      }

      const { coordinates } = userPrefs.currentLocation;
      const maxDistance = userPrefs.maxDistanceKm * 1000; // Convert to meters

      // Location-based query with user preferences
      const query: any = {
        isActive: true,
        coordinates: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: coordinates
            },
            $maxDistance: maxDistance
          }
        }
      };

      // Add accommodation type filter
      if (userPrefs.accommodationPreferences?.type) {
        query.accommodationType = userPrefs.accommodationPreferences.type;
      }

      // Add budget filter
      if (userPrefs.accommodationPreferences?.budgetRange) {
        query.price = {
          $gte: userPrefs.accommodationPreferences.budgetRange.min,
          $lte: userPrefs.accommodationPreferences.budgetRange.max
        };
      }

      const accommodations = await this.accommodationModel
        .find(query)
        .populate('city landlord')
        .sort({ 'rating.average': -1 })
        .limit(limit);

      // Update recommendation count
      await this.userPreferencesModel.updateOne(
        { user: userId },
        { 
          $inc: { recommendationCount: 1 },
          lastRecommendationDate: new Date()
        }
      );

      return accommodations;
    } catch (error) {
      console.error('Error getting location-based accommodations:', error);
      throw error;
    }
  }

  async getLocationBasedFoodProviders(userId: string, limit: number = 20) {
    try {
      const userPrefs = await this.userPreferencesModel.findOne({ user: userId });
      
      if (!userPrefs || !userPrefs.currentLocation) {
        // If no location preferences, return popular food providers
        return await this.foodProviderModel
          .find({ isActive: true })
          .populate('city')
          .sort({ 'rating.average': -1 })
          .limit(limit);
      }

      const { coordinates } = userPrefs.currentLocation;
      const maxDistance = userPrefs.maxDistanceKm * 1000; // Convert to meters

      // Location-based query with user preferences
      const query: any = {
        isActive: true,
        coordinates: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: coordinates
            },
            $maxDistance: maxDistance
          }
        }
      };

      // Add cuisine filter
      if (userPrefs.foodPreferences?.cuisineTypes?.length > 0) {
        query.cuisine = { $in: userPrefs.foodPreferences.cuisineTypes };
      }

      const foodProviders = await this.foodProviderModel
        .find(query)
        .populate('city')
        .sort({ 'rating.average': -1 })
        .limit(limit);

      return foodProviders;
    } catch (error) {
      console.error('Error getting location-based food providers:', error);
      throw error;
    }
  }

  async getRecommendedMenuItems(userId: string, limit: number = 30) {
    try {
      const userPrefs = await this.userPreferencesModel.findOne({ user: userId });
      
      if (!userPrefs) {
        // Return popular menu items
        return await this.menuItemModel
          .find({ isAvailable: true })
          .populate('provider')
          .sort({ popularity: -1 })
          .limit(limit);
      }

      const query: any = { isAvailable: true };

      // Add price filter
      if (userPrefs.foodPreferences?.budgetRange) {
        query.price = {
          $gte: userPrefs.foodPreferences.budgetRange.min,
          $lte: userPrefs.foodPreferences.budgetRange.max
        };
      }

      // Get food providers that match user's location and cuisine preferences
      const nearbyProviders = await this.getLocationBasedFoodProviders(userId, 50);
      const providerIds = nearbyProviders.map(provider => provider._id);

      if (providerIds.length > 0) {
        query.provider = { $in: providerIds };
      }

      const menuItems = await this.menuItemModel
        .find(query)
        .populate('provider')
        .sort({ popularity: -1 })
        .limit(limit);

      return menuItems;
    } catch (error) {
      console.error('Error getting recommended menu items:', error);
      throw error;
    }
  }

  async updateUserLocation(userId: string, latitude: number, longitude: number) {
    try {
      const updateData = {
        currentLocation: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        lastLocationUpdate: new Date()
      };

      const userPrefs = await this.userPreferencesModel.findOneAndUpdate(
        { user: userId },
        updateData,
        { upsert: true, new: true }
      );

      return userPrefs;
    } catch (error) {
      console.error('Error updating user location:', error);
      throw error;
    }
  }

  async getPersonalizedRecommendations(userId: string) {
    try {
      const [accommodations, foodProviders, menuItems] = await Promise.all([
        this.getLocationBasedAccommodations(userId, 10),
        this.getLocationBasedFoodProviders(userId, 10),
        this.getRecommendedMenuItems(userId, 15)
      ]);

      return {
        accommodations,
        foodProviders,
        menuItems,
        recommendedAt: new Date()
      };
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      throw error;
    }
  }

  async searchNearbyByCity(cityName: string, userId?: string, type: 'accommodation' | 'food' = 'accommodation') {
    try {
      // Find city coordinates
      const City = this.accommodationModel.db.model('City');
      const city = await City.findOne({ name: new RegExp(cityName, 'i') });
      
      if (!city) {
        throw new Error(`City ${cityName} not found`);
      }

      const coordinates = city.coordinates.coordinates;
      const maxDistance = 50000; // 50km radius for city search

      if (type === 'accommodation') {
        return await this.accommodationModel
          .find({
            isActive: true,
            coordinates: {
              $near: {
                $geometry: {
                  type: 'Point',
                  coordinates: coordinates
                },
                $maxDistance: maxDistance
              }
            }
          })
          .populate('city landlord')
          .sort({ 'rating.average': -1 })
          .limit(50);
      } else {
        return await this.foodProviderModel
          .find({
            isActive: true,
            coordinates: {
              $near: {
                $geometry: {
                  type: 'Point',
                  coordinates: coordinates
                },
                $maxDistance: maxDistance
              }
            }
          })
          .populate('city')
          .sort({ 'rating.average': -1 })
          .limit(50);
      }
    } catch (error) {
      console.error('Error searching nearby by city:', error);
      throw error;
    }
  }

  async getRecommendationStats(userId: string) {
    try {
      const userPrefs = await this.userPreferencesModel.findOne({ user: userId });
      
      if (!userPrefs) {
        return {
          surveyCompleted: false,
          locationEnabled: false,
          recommendationCount: 0,
          lastRecommendation: null
        };
      }

      return {
        surveyCompleted: userPrefs.surveyCompleted,
        locationEnabled: userPrefs.enableLocationTracking,
        recommendationCount: userPrefs.recommendationCount,
        lastRecommendation: userPrefs.lastRecommendationDate,
        preferredCity: userPrefs.preferredCity,
        currentLocation: userPrefs.currentLocation
      };
    } catch (error) {
      console.error('Error getting recommendation stats:', error);
      throw error;
    }
  }
}

export { RecommendationService };
