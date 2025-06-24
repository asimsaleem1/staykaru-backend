import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../user/schema/user.schema';
import { City } from '../../location/schema/city.schema';

@Schema({ timestamps: true })
export class Accommodation extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'City', required: true })
  city: City;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  })
  coordinates: {
    type: string;
    coordinates: number[];
  };

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ 
    type: String, 
    enum: ['room', 'shared_room', 'apartment', 'hostel', 'pg', 'studio', 'house', 'flat', 'villa', 'townhouse', 'penthouse', 'loft'], 
    default: 'room' 
  })
  accommodationType: string;

  @Prop({ type: [String], default: [] })
  amenities: string[];

  @Prop({ min: 0, default: 1 })
  bedrooms: number;

  @Prop({ min: 0, default: 1 })
  bathrooms: number;

  @Prop({ min: 0 })
  area: number; // in square feet

  @Prop({ min: 0, default: 1 })
  maxOccupancy: number;

  @Prop({ default: false })
  furnished: boolean;

  @Prop()
  address: string;

  @Prop({ type: [Date], default: [] })
  availability: Date[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  landlord: User;

  @Prop({ default: false })
  isActive: boolean;

  @Prop({
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  approvalStatus: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  approvedBy?: User;

  @Prop()
  approvedAt?: Date;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop()
  rejectionReason?: string;
}

export const AccommodationSchema = SchemaFactory.createForClass(Accommodation);
AccommodationSchema.index({ coordinates: '2dsphere' });
