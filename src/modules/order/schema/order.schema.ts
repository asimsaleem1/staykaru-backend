import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../user/schema/user.schema';
import { FoodProvider } from '../../food_service/schema/food-provider.schema';
import { MenuItem } from '../../food_service/schema/menu-item.schema';

export enum OrderStatus {
  PLACED = 'placed',
  PREPARING = 'preparing',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export class OrderItem {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
  })
  menu_item: MenuItem;

  @Prop({ required: true, min: 1 })
  quantity: number;
}

export class LocationCoordinates {
  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;
}

export class DeliveryLocation {
  @Prop({ type: LocationCoordinates, required: true })
  coordinates: LocationCoordinates;

  @Prop({ required: true })
  address: string;

  @Prop()
  landmark?: string;
}

export class TrackingHistory {
  @Prop({ type: LocationCoordinates, required: true })
  location: LocationCoordinates;

  @Prop({ type: String, enum: OrderStatus, required: true })
  status: OrderStatus;

  @Prop({ default: Date.now })
  timestamp: Date;

  @Prop()
  notes?: string;
}

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'FoodProvider',
    required: true,
  })
  food_provider: FoodProvider;

  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[];

  @Prop({ required: true, min: 0 })
  total_price: number;

  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.PLACED })
  status: OrderStatus;

  @Prop({ type: DeliveryLocation })
  delivery_location?: DeliveryLocation;

  @Prop({ type: LocationCoordinates })
  current_location?: LocationCoordinates;

  @Prop({ type: [TrackingHistory], default: [] })
  tracking_history: TrackingHistory[];

  @Prop()
  estimated_delivery_time?: Date;

  @Prop()
  delivery_person_name?: string;

  @Prop()
  delivery_person_phone?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
