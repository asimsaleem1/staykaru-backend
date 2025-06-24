import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../user/schema/user.schema';
import { FoodProvider } from '../../food_service/schema/food-provider.schema';
import { MenuItem } from '../../food_service/schema/menu-item.schema';

export enum OrderStatus {
  PLACED = 'placed',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY_FOR_PICKUP = 'ready_for_pickup',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CASH_ON_DELIVERY = 'cash_on_delivery',
  CARD = 'card',
  MOBILE_WALLET = 'mobile_wallet',
  BANK_TRANSFER = 'bank_transfer',
  JAZZCASH = 'jazzcash',
  EASYPAISA = 'easypaisa',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
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

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'FoodProvider',
    required: true,
  })
  food_provider: FoodProvider;

  @Prop([{ type: OrderItem, required: true }])
  items: OrderItem[];

  @Prop({ type: DeliveryLocation, required: true })
  delivery_location: DeliveryLocation;

  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.PLACED })
  status: OrderStatus;

  @Prop({ type: [TrackingHistory], default: [] })
  tracking_history: TrackingHistory[];

  @Prop({ type: LocationCoordinates })
  current_location?: LocationCoordinates;

  @Prop()
  estimated_delivery_time?: Date;

  @Prop({ required: true })
  total_amount: number;

  @Prop({ type: String, enum: PaymentMethod, default: PaymentMethod.CASH_ON_DELIVERY })
  payment_method: PaymentMethod;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING })
  payment_status: PaymentStatus;

  @Prop()
  payment_transaction_id?: string;

  @Prop()
  special_instructions?: string;

  @Prop()
  contact_phone?: string;

  @Prop({ default: false })
  is_pre_paid: boolean;

  @Prop()
  delivery_fee?: number;

  @Prop()
  discount_amount?: number;

  @Prop()
  tax_amount?: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
