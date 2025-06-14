import { Schema } from 'mongoose';

export const AnalyticsSchema = new Schema({
  // Define a flexible schema that can handle various analytics data
  // This schema is intentionally loose to allow different analytics types
  _id: Schema.Types.ObjectId,
  userId: String,
  metadata: Schema.Types.Mixed,
  // Add any common fields here
}, {
  timestamps: true,
  strict: false, // Allow any fields to be stored
  collection: 'analytics' // Default collection, will be overridden
});
