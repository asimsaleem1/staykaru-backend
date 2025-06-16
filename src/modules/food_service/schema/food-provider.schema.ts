import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../user/schema/user.schema';
import { City } from '../../location/schema/city.schema';

@Schema({ timestamps: true })
export class FoodProvider extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'City', required: true })
  location: City;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  owner: User;

  @Prop({ type: String })
  cuisine_type: string;

  @Prop({
    type: {
      open: { type: String },
      close: { type: String },
    },
  })
  operating_hours: {
    open: string;
    close: string;
  };

  @Prop({
    type: {
      phone: { type: String },
      email: { type: String },
    },
  })
  contact_info: {
    phone: string;
    email: string;
  };

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'MenuItem' }],
    default: [],
  })
  menu_items: string[];

  @Prop({ type: Number, default: 0 })
  rating: number;

  @Prop({ type: Number, default: 0 })
  total_reviews: number;

  @Prop({ type: Boolean, default: true })
  is_active: boolean;
}

export const FoodProviderSchema = SchemaFactory.createForClass(FoodProvider);
