import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AnalyticsController } from './controller/analytics.controller';
import { AnalyticsService } from './services/analytics.service';
import { AnalyticsReportFactory } from './factories/analytics-report.factory';
import { AuthModule } from '../auth/auth.module';
import { AnalyticsSchema } from './schema/analytics.schema';

@Module({
  imports: [
    AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: { expiresIn: configService.get('jwt.expiresIn') },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      {
        name: 'BookingAnalytics',
        schema: AnalyticsSchema,
        collection: 'booking_analytics',
      },
      {
        name: 'OrderAnalytics',
        schema: AnalyticsSchema,
        collection: 'order_analytics',
      },
      {
        name: 'PaymentAnalytics',
        schema: AnalyticsSchema,
        collection: 'payment_analytics',
      },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsReportFactory],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
