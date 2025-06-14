import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment } from '../schema/payment.schema';

// Define a simple analytics schema
interface PaymentAnalytics {
  payment_id: string;
  user_id: string;
  amount: number;
  status: string;
  method: string;
  transaction_id: string;
  timestamp: Date;
}

@Injectable()
export class PaymentAnalyticsService {
  constructor(
    private configService: ConfigService,
    @InjectModel('PaymentAnalytics') private readonly paymentAnalyticsModel: Model<PaymentAnalytics>
  ) {}

  async logPaymentEvent(payment: Payment): Promise<void> {
    await this.paymentAnalyticsModel.create({
      payment_id: payment._id.toString(),
      user_id: payment.user.toString(),
      amount: payment.amount,
      status: payment.status,
      method: payment.method,
      transaction_id: payment.transaction_id,
      timestamp: new Date(),
    });
  }
}