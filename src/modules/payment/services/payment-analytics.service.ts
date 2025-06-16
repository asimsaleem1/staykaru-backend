import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment } from '../schema/payment.schema';
import { PaymentAnalytics } from '../schema/payment-analytics.schema';

@Injectable()
export class PaymentAnalyticsService {
  constructor(
    private configService: ConfigService,
    @InjectModel(PaymentAnalytics.name)
    private readonly paymentAnalyticsModel: Model<PaymentAnalytics>,
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
