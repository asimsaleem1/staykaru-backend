import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserPreferencesDocument = UserPreferences & Document;

@Schema({ timestamps: true })
export class UserPreferences {
  @Prop({ 
    type: Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'City' })
  preferredCity: Types.ObjectId;

  @Prop({
    type: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }
    }
  })
  currentLocation: {
    type: string;
    coordinates: number[];
  };

  @Prop({ default: 10 })
  maxDistanceKm: number;

  @Prop({
    type: {
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
      preferredAreas: [String]
    }
  })
  accommodationPreferences: {
    type: string;
    budgetRange: { min: number; max: number; };
    amenities: string[];
    preferredAreas: string[];
  };

  @Prop({
    type: {
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
    }
  })
  foodPreferences: {
    cuisineTypes: string[];
    dietaryRestrictions: string[];
    budgetRange: { min: number; max: number; };
    mealTypes: string[];
  };

  @Prop({
    type: {
      name: String,
      address: String,
      coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: [Number]
      }
    }
  })
  institution: {
    name: string;
    address: string;
    coordinates: {
      type: string;
      coordinates: number[];
    };
  };

  @Prop({
    type: {
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
    }
  })
  lifestyle: {
    studyHours: string;
    socialLevel: string;
    cleanlinessLevel: number;
  };

  @Prop({ default: true })
  enableLocationTracking: boolean;

  @Prop({ default: true })
  receiveRecommendations: boolean;

  @Prop({ default: Date.now })
  lastLocationUpdate: Date;

  @Prop({ default: false })
  surveyCompleted: boolean;

  @Prop()
  surveyCompletedAt: Date;

  @Prop()
  lastRecommendationDate: Date;

  @Prop({ default: 0 })
  recommendationCount: number;
}

export const UserPreferencesSchema = SchemaFactory.createForClass(UserPreferences);

// Create indexes
UserPreferencesSchema.index({ currentLocation: '2dsphere' });
UserPreferencesSchema.index({ user: 1 });
