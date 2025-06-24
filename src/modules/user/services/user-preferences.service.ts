import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserPreferences } from '../schema/user-preferences.schema';

@Injectable()
export class UserPreferencesService {
  constructor(
    @InjectModel('UserPreferences') private userPreferencesModel: Model<UserPreferences>,
  ) {}

  async completeSurvey(userId: string, surveyData: any) {
    try {
      const preferences = {
        user: userId,
        
        // Process location data
        preferredCity: surveyData.location === 'Other' ? null : await this.getCityId(surveyData.location),
        
        // Process accommodation preferences
        accommodationPreferences: {
          type: surveyData.accommodation_type,
          budgetRange: {
            min: surveyData.budget_accommodation?.min || 5000,
            max: surveyData.budget_accommodation?.max || 25000
          },
          amenities: surveyData.amenities || []
        },
        
        // Process food preferences
        foodPreferences: {
          cuisineTypes: surveyData.cuisine_preferences || ['Pakistani'],
          dietaryRestrictions: surveyData.dietary_restrictions?.filter(r => r !== 'none') || [],
          budgetRange: {
            min: surveyData.food_budget?.min || 200,
            max: surveyData.food_budget?.max || 1000
          },
          mealTypes: ['lunch', 'dinner'] // Default
        },
        
        // Process institution info
        institution: {
          name: surveyData.institution,
          address: '',
          coordinates: {
            type: 'Point',
            coordinates: [0, 0] // Will be updated later
          }
        },
        
        // Process lifestyle
        lifestyle: {
          studyHours: surveyData.lifestyle || 'flexible',
          socialLevel: surveyData.social_level || 'moderately_social',
          cleanlinessLevel: 3 // Default
        },
        
        // Process settings
        enableLocationTracking: surveyData.location_tracking !== false,
        receiveRecommendations: true,
        
        // Mark survey as completed
        surveyCompleted: true,
        surveyCompletedAt: new Date()
      };

      const result = await this.userPreferencesModel.findOneAndUpdate(
        { user: userId },
        preferences,
        { upsert: true, new: true }
      );

      return {
        success: true,
        message: 'Survey completed successfully',
        preferences: result
      };
    } catch (error) {
      console.error('Error completing survey:', error);
      throw error;
    }
  }

  async getUserPreferences(userId: string) {
    try {
      const preferences = await this.userPreferencesModel
        .findOne({ user: userId })
        .populate('preferredCity user');
      
      if (!preferences) {
        return {
          exists: false,
          surveyCompleted: false,
          message: 'Please complete the preference survey first'
        };
      }

      return {
        exists: true,
        preferences
      };
    } catch (error) {
      console.error('Error getting user preferences:', error);
      throw error;
    }
  }

  async updateUserPreferences(userId: string, updateData: any) {
    try {
      const result = await this.userPreferencesModel.findOneAndUpdate(
        { user: userId },
        { $set: updateData },
        { new: true, upsert: true }
      );

      return {
        success: true,
        message: 'Preferences updated successfully',
        preferences: result
      };
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  async checkSurveyStatus(userId: string) {
    try {
      const preferences = await this.userPreferencesModel.findOne(
        { user: userId },
        { surveyCompleted: 1, surveyCompletedAt: 1 }
      );

      return {
        surveyCompleted: preferences?.surveyCompleted || false,
        completedAt: preferences?.surveyCompletedAt || null
      };
    } catch (error) {
      console.error('Error checking survey status:', error);
      throw error;
    }
  }

  private async getCityId(cityName: string) {
    try {
      // This would typically query the City model
      // For now, we'll return null and let the recommendation service handle it
      const City = this.userPreferencesModel.db.model('City');
      const city = await City.findOne({ name: new RegExp(cityName, 'i') });
      return city?._id || null;
    } catch (error) {
      console.error('Error getting city ID:', error);
      return null;
    }
  }

  async toggleLocationTracking(userId: string, enabled: boolean) {
    try {
      const result = await this.userPreferencesModel.findOneAndUpdate(
        { user: userId },
        { enableLocationTracking: enabled },
        { new: true, upsert: true }
      );

      return {
        success: true,
        message: `Location tracking ${enabled ? 'enabled' : 'disabled'}`,
        locationEnabled: result.enableLocationTracking
      };
    } catch (error) {
      console.error('Error toggling location tracking:', error);
      throw error;
    }
  }

  async updateMaxDistance(userId: string, distanceKm: number) {
    try {
      const result = await this.userPreferencesModel.findOneAndUpdate(
        { user: userId },
        { maxDistanceKm: distanceKm },
        { new: true, upsert: true }
      );

      return {
        success: true,
        message: 'Search radius updated',
        maxDistance: result.maxDistanceKm
      };
    } catch (error) {
      console.error('Error updating max distance:', error);
      throw error;
    }
  }
}
