import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../user/schema/user.schema';

export enum ReviewTargetType {
  ACCOMMODATION = 'accommodation',
  FOOD_PROVIDER = 'food_provider',
}

@Schema({ timestamps: true })
export class Review extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ type: String, enum: ReviewTargetType, required: true })
  target_type: ReviewTargetType;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  target_id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true })
  comment: string;

  @Prop({ default: false })
  verified: boolean;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
