import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserPreferencesService } from '../services/user-preferences.service';
import { RecommendationService } from '../services/recommendation.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('User Preferences & Recommendations')
@Controller('user-preferences')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UserPreferencesController {
  constructor(
    private readonly userPreferencesService: UserPreferencesService,
    private readonly recommendationService: RecommendationService,
  ) {}

  @Post('survey')
  @Roles('student')
  @ApiOperation({ summary: 'Complete user preference survey' })
  @ApiResponse({ status: 201, description: 'Survey completed successfully' })
  async completeSurvey(@Request() req, @Body() surveyData: any) {
    return await this.userPreferencesService.completeSurvey(req.user.id, surveyData);
  }

  @Get('survey-questions')
  @Roles('student')
  @ApiOperation({ summary: 'Get survey questions for new users' })
  @ApiResponse({ status: 200, description: 'Survey questions retrieved successfully' })
  async getSurveyQuestions() {
    return {
      questions: [
        {
          id: 'location',
          type: 'location',
          title: 'What city will you be studying in?',
          options: ['Islamabad', 'Lahore', 'Karachi', 'Other'],
          required: true
        },
        {
          id: 'institution',
          type: 'text',
          title: 'What is the name of your university/institution?',
          placeholder: 'e.g., NUST, LUMS, University of Punjab',
          required: true
        },
        {
          id: 'accommodation_type',
          type: 'single_choice',
          title: 'What type of accommodation do you prefer?',
          options: [
            { value: 'room', label: 'Single Room' },
            { value: 'shared_room', label: 'Shared Room' },
            { value: 'apartment', label: 'Full Apartment' },
            { value: 'hostel', label: 'Hostel' },
            { value: 'pg', label: 'Paying Guest (PG)' },
            { value: 'studio', label: 'Studio Apartment' }
          ],
          required: true
        },
        {
          id: 'budget_accommodation',
          type: 'range',
          title: 'What is your monthly accommodation budget?',
          min: 5000,
          max: 50000,
          step: 1000,
          currency: 'PKR',
          required: true
        },
        {
          id: 'amenities',
          type: 'multiple_choice',
          title: 'Which amenities are important to you?',
          options: [
            { value: 'wifi', label: 'WiFi Internet' },
            { value: 'ac', label: 'Air Conditioning' },
            { value: 'kitchen', label: 'Kitchen Access' },
            { value: 'laundry', label: 'Laundry Facilities' },
            { value: 'parking', label: 'Parking Space' },
            { value: 'security', label: 'Security' },
            { value: 'furnished', label: 'Furnished' },
            { value: 'gym', label: 'Gym Access' }
          ],
          required: false
        },
        {
          id: 'cuisine_preferences',
          type: 'multiple_choice',
          title: 'What types of cuisine do you enjoy?',
          options: [
            { value: 'Pakistani', label: 'Pakistani' },
            { value: 'Indian', label: 'Indian' },
            { value: 'Chinese', label: 'Chinese' },
            { value: 'Fast Food', label: 'Fast Food' },
            { value: 'Italian', label: 'Italian' },
            { value: 'Middle Eastern', label: 'Middle Eastern' },
            { value: 'Continental', label: 'Continental' },
            { value: 'Thai', label: 'Thai' },
            { value: 'Mexican', label: 'Mexican' },
            { value: 'Desi', label: 'Desi' }
          ],
          required: true
        },
        {
          id: 'dietary_restrictions',
          type: 'multiple_choice',
          title: 'Do you have any dietary restrictions?',
          options: [
            { value: 'none', label: 'No Restrictions' },
            { value: 'vegetarian', label: 'Vegetarian' },
            { value: 'vegan', label: 'Vegan' },
            { value: 'halal', label: 'Halal Only' },
            { value: 'no_pork', label: 'No Pork' },
            { value: 'no_beef', label: 'No Beef' },
            { value: 'gluten_free', label: 'Gluten Free' },
            { value: 'dairy_free', label: 'Dairy Free' }
          ],
          required: false
        },
        {
          id: 'food_budget',
          type: 'range',
          title: 'What is your daily food budget?',
          min: 200,
          max: 2000,
          step: 50,
          currency: 'PKR',
          required: true
        },
        {
          id: 'lifestyle',
          type: 'single_choice',
          title: 'What describes your lifestyle best?',
          options: [
            { value: 'early_bird', label: 'Early Bird (Early to bed, early to rise)' },
            { value: 'night_owl', label: 'Night Owl (Late nights, late mornings)' },
            { value: 'flexible', label: 'Flexible Schedule' }
          ],
          required: true
        },
        {
          id: 'social_level',
          type: 'single_choice',
          title: 'How social are you?',
          options: [
            { value: 'very_social', label: 'Very Social (Love meeting new people)' },
            { value: 'moderately_social', label: 'Moderately Social (Comfortable with roommates)' },
            { value: 'prefer_quiet', label: 'Prefer Quiet (Like privacy and quiet spaces)' }
          ],
          required: true
        },
        {
          id: 'location_tracking',
          type: 'boolean',
          title: 'Enable location-based recommendations?',
          description: 'This helps us show you nearby accommodations and restaurants',
          required: true
        }
      ]
    };
  }

  @Get('preferences')
  @Roles('student')
  @ApiOperation({ summary: 'Get user preferences' })
  @ApiResponse({ status: 200, description: 'User preferences retrieved successfully' })
  async getUserPreferences(@Request() req) {
    return await this.userPreferencesService.getUserPreferences(req.user.id);
  }

  @Put('preferences')
  @Roles('student')
  @ApiOperation({ summary: 'Update user preferences' })
  @ApiResponse({ status: 200, description: 'User preferences updated successfully' })
  async updateUserPreferences(@Request() req, @Body() preferences: any) {
    return await this.userPreferencesService.updateUserPreferences(req.user.id, preferences);
  }

  @Post('location')
  @Roles('student')
  @ApiOperation({ summary: 'Update user location' })
  @ApiResponse({ status: 200, description: 'Location updated successfully' })
  async updateLocation(@Request() req, @Body() locationData: { latitude: number; longitude: number }) {
    return await this.recommendationService.updateUserLocation(
      req.user.id,
      locationData.latitude,
      locationData.longitude
    );
  }

  @Get('recommendations')
  @Roles('student')
  @ApiOperation({ summary: 'Get personalized recommendations' })
  @ApiResponse({ status: 200, description: 'Recommendations retrieved successfully' })
  async getRecommendations(@Request() req) {
    return await this.recommendationService.getPersonalizedRecommendations(req.user.id);
  }

  @Get('recommendations/accommodations')
  @Roles('student')
  @ApiOperation({ summary: 'Get accommodation recommendations' })
  @ApiResponse({ status: 200, description: 'Accommodation recommendations retrieved successfully' })
  async getAccommodationRecommendations(@Request() req, @Query('limit') limit: string = '20') {
    return await this.recommendationService.getLocationBasedAccommodations(req.user.id, parseInt(limit));
  }

  @Get('recommendations/food')
  @Roles('student')
  @ApiOperation({ summary: 'Get food provider recommendations' })
  @ApiResponse({ status: 200, description: 'Food recommendations retrieved successfully' })
  async getFoodRecommendations(@Request() req, @Query('limit') limit: string = '20') {
    return await this.recommendationService.getLocationBasedFoodProviders(req.user.id, parseInt(limit));
  }

  @Get('recommendations/menu')
  @Roles('student')
  @ApiOperation({ summary: 'Get menu item recommendations' })
  @ApiResponse({ status: 200, description: 'Menu recommendations retrieved successfully' })
  async getMenuRecommendations(@Request() req, @Query('limit') limit: string = '30') {
    return await this.recommendationService.getRecommendedMenuItems(req.user.id, parseInt(limit));
  }

  @Get('search/city/:cityName')
  @Roles('student')
  @ApiOperation({ summary: 'Search accommodations and food by city' })
  @ApiResponse({ status: 200, description: 'City search results retrieved successfully' })
  async searchByCity(
    @Request() req,
    @Param('cityName') cityName: string,
    @Query('type') type: 'accommodation' | 'food' = 'accommodation'
  ) {
    return await this.recommendationService.searchNearbyByCity(cityName, req.user.id, type);
  }

  @Get('recommendation-stats')
  @Roles('student')
  @ApiOperation({ summary: 'Get recommendation statistics' })
  @ApiResponse({ status: 200, description: 'Recommendation stats retrieved successfully' })
  async getRecommendationStats(@Request() req) {
    return await this.recommendationService.getRecommendationStats(req.user.id);
  }
}

