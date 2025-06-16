import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true, collection: 'payment_analytics' })
export class PaymentAnalytics extends Document {
  @Prop({ required: true })
  payment_id: string;

  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  method: string;

  @Prop()
  transaction_id: string;

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const PaymentAnalyticsSchema =
  SchemaFactory.createForClass(PaymentAnalytics);
