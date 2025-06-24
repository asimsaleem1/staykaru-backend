const mongoose = require('mongoose');

const userPreferencesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Location preferences
  preferredCity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City'
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  maxDistanceKm: {
    type: Number,
    default: 10 // 10 km radius
  },
  
  // Accommodation preferences
  accommodationPreferences: {
    type: {
      type: String,
      enum: ['apartment', 'room', 'hostel', 'pg', 'shared_room', 'studio', 'house'],
      default: 'room'
    },
    budgetRange: {
      min: { type: Number, default: 5000 },
      max: { type: Number, default: 25000 }
    },
    amenities: [{
      type: String,
      enum: ['wifi', 'parking', 'ac', 'kitchen', 'laundry', 'security', 'gym', 'pool', 'furnished']
    }],
    preferredAreas: [String] // Area names within city
  },
  
  // Food preferences
  foodPreferences: {
    cuisineTypes: [{
      type: String,
      default: ['Pakistani', 'Indian', 'Chinese', 'Fast Food']
    }],
    dietaryRestrictions: [{
      type: String,
      enum: ['vegetarian', 'vegan', 'halal', 'no_pork', 'no_beef', 'gluten_free', 'dairy_free']
    }],
    budgetRange: {
      min: { type: Number, default: 100 },
      max: { type: Number, default: 1000 }
    },
    mealTypes: [{
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snacks', 'beverages'],
      default: ['lunch', 'dinner']
    }]
  },
  
  // University/Institution info
  institution: {
    name: String,
    address: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number]
    }
  },
  
  // Behavioral preferences
  lifestyle: {
    studyHours: {
      type: String,
      enum: ['early_bird', 'night_owl', 'flexible'],
      default: 'flexible'
    },
    socialLevel: {
      type: String,
      enum: ['very_social', 'moderately_social', 'prefer_quiet'],
      default: 'moderately_social'
    },
    cleanlinessLevel: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    }
  },
  
  // Recommendation settings
  enableLocationTracking: {
    type: Boolean,
    default: true
  },
  receiveRecommendations: {
    type: Boolean,
    default: true
  },
  lastLocationUpdate: {
    type: Date,
    default: Date.now
  },
  
  // Survey completion
  surveyCompleted: {
    type: Boolean,
    default: false
  },
  surveyCompletedAt: Date,
  
  // Recommendation history
  lastRecommendationDate: Date,
  recommendationCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for geospatial queries
userPreferencesSchema.index({ currentLocation: '2dsphere' });
userPreferencesSchema.index({ user: 1 });

const UserPreferences = mongoose.model('UserPreferences', userPreferencesSchema);

module.exports = UserPreferences;
