import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { Payment } from '../schema/payment.schema';

@Injectable()
export class PaymentAnalyticsService {
  private supabase;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('supabase.url'),
      this.configService.get<string>('supabase.key'),
    );
  }

  async logPaymentEvent(payment: Payment): Promise<void> {
    await this.supabase.from('payment_analytics').insert({
      payment_id: payment._id.toString(),
      user_id: payment.user.toString(),
      amount: payment.amount,
      status: payment.status,
      method: payment.method,
      transaction_id: payment.transaction_id,
      timestamp: new Date().toISOString(),
    });
  }
}