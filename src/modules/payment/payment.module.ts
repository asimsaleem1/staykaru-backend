import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentController } from './controller/payment.controller';
import { PaymentService } from './services/payment.service';
import { Payment, PaymentSchema } from './schema/payment.schema';
import { JazzcashPaymentAdapter } from './adapters/jazzcash.adapter';
import { CreditCardPaymentAdapter } from './adapters/credit-card.adapter';
import { PaymentAnalyticsService } from './services/payment-analytics.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
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