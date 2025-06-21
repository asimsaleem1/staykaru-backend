import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { FoodProvider } from './food-provider.schema';

@Schema({ timestamps: true })
export class MenuItem extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true })
  description: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'FoodProvider',
    required: true,
  })
  provider: FoodProvider;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  })
  approvalStatus: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  approvedBy?: User;

  @Prop()
  approvedAt?: Date;

  @Prop()
  rejectionReason?: string;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);
