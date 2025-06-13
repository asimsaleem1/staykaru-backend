import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../user/schema/user.schema';
import { FoodProvider } from '../../food_service/schema/food-provider.schema';
import { MenuItem } from '../../food_service/schema/menu-item.schema';

export enum OrderStatus {
  PLACED = 'placed',
  PREPARING = 'preparing',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export class OrderItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'MenuItem', required: true })
  menu_item: MenuItem;

  @Prop({ required: true, min: 1 })
  quantity: number;
}

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'FoodProvider', required: true })
  food_provider: FoodProvider;

  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[];

  @Prop({ required: true, min: 0 })
  total_price: number;

  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.PLACED })
  status: OrderStatus;
}

export const OrderSchema = SchemaFactory.createForClass(Order);