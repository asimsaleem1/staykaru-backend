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

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'FoodProvider', required: true })
  provider: FoodProvider;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);