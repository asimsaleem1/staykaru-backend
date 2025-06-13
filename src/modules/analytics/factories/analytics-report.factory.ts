import { Injectable } from '@nestjs/common';
import { BookingAnalyticsReport } from '../reports/booking-analytics.report';
import { OrderAnalyticsReport } from '../reports/order-analytics.report';
import { PaymentAnalyticsReport } from '../reports/payment-analytics.report';
import { AnalyticsReport } from '../interfaces/analytics-report.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AnalyticsReportFactory {
  constructor(private configService: ConfigService) {}

  createReport(type: string): AnalyticsReport {
    switch (type) {
      case 'booking':
        return new BookingAnalyticsReport(this.configService);
      case 'order':
        return new OrderAnalyticsReport(this.configService);
      case 'payment':
        return new PaymentAnalyticsReport(this.configService);
      default:
        throw new Error(`Unsupported report type: ${type}`);
    }
  }
}