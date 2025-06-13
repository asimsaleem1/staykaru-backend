import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../user/schema/user.schema';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum PaymentMethod {
  JAZZCASH = 'jazzcash',
  CREDIT_CARD = 'credit_card'
}

@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Prop({ type: String, enum: PaymentMethod, required: true })
  method: PaymentMethod;

  @Prop({ required: true })
  transaction_id: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  gateway_response: Record<string, any>;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata: Record<string, any>;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);