import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from '../../user/schema/user.schema';
import { Accommodation } from '../../accommodation/schema/accommodation.schema';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Accommodation',
    required: true,
  })
  accommodation: Accommodation;

  @Prop({ required: true })
  checkInDate: Date;

  @Prop({ required: true })
  checkOutDate: Date;

  @Prop({ type: String, enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Prop({ required: true })
  total_amount: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
export type BookingDocument = Booking & Document;

export interface IBooking extends Document {
  user: User;
  accommodation: Accommodation;
  start_date: Date;
  end_date: Date;
  status: BookingStatus;
  total_amount: number;
  createdAt: Date;
  updatedAt: Date;
  readonly _id: Types.ObjectId;
}
