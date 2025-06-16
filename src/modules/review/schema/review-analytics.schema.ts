import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'review_analytics' })
export class ReviewAnalytics extends Document {
  @Prop({ required: true })
  review_id: string;

  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  target_type: string;

  @Prop({ required: true })
  target_id: string;

  @Prop({ required: true })
  rating: number;

  @Prop({ default: false })
  verified: boolean;

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const ReviewAnalyticsSchema =
  SchemaFactory.createForClass(ReviewAnalytics);
