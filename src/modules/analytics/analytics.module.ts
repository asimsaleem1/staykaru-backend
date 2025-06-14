import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './controller/analytics.controller';
import { AnalyticsService } from './services/analytics.service';
import { AnalyticsReportFactory } from './factories/analytics-report.factory';
import { AuthModule } from '../auth/auth.module';
import { AnalyticsSchema } from './schema/analytics.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: 'BookingAnalytics', schema: AnalyticsSchema, collection: 'booking_analytics' },
      { name: 'OrderAnalytics', schema: AnalyticsSchema, collection: 'order_analytics' },
      { name: 'PaymentAnalytics', schema: AnalyticsSchema, collection: 'payment_analytics' },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsReportFactory],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}