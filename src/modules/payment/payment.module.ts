import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentController } from './controller/payment.controller';
import { PaymentService } from './services/payment.service';
import { Payment, PaymentSchema } from './schema/payment.schema';
import { JazzcashPaymentAdapter } from './adapters/jazzcash.adapter';
import { CreditCardPaymentAdapter } from './adapters/credit-card.adapter';
import { PaymentAnalyticsService } from './services/payment-analytics.service';
import {
  PaymentAnalytics,
  PaymentAnalyticsSchema,
} from './schema/payment-analytics.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: PaymentAnalytics.name, schema: PaymentAnalyticsSchema },
    ]),
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    JazzcashPaymentAdapter,
    CreditCardPaymentAdapter,
    PaymentAnalyticsService,
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
