import { Module } from '@nestjs/common';
import { AnalyticsController } from './controller/analytics.controller';
import { AnalyticsService } from './services/analytics.service';
import { AnalyticsReportFactory } from './factories/analytics-report.factory';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsReportFactory],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}