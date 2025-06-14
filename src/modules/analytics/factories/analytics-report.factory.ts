import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BookingAnalyticsReport } from '../reports/booking-analytics.report';
import { OrderAnalyticsReport } from '../reports/order-analytics.report';
import { PaymentAnalyticsReport } from '../reports/payment-analytics.report';
import { AnalyticsReport } from '../interfaces/analytics-report.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AnalyticsReportFactory {
  constructor(
    private configService: ConfigService,
    @InjectModel('BookingAnalytics') private readonly bookingAnalyticsModel: Model<any>,
    @InjectModel('OrderAnalytics') private readonly orderAnalyticsModel: Model<any>,
    @InjectModel('PaymentAnalytics') private readonly paymentAnalyticsModel: Model<any>
  ) {}

  createReport(type: string): AnalyticsReport {
    switch (type) {
      case 'booking':
        return new BookingAnalyticsReport(this.configService, this.bookingAnalyticsModel);
      case 'order':
        return new OrderAnalyticsReport(this.configService, this.orderAnalyticsModel);
      case 'payment':
        return new PaymentAnalyticsReport(this.configService, this.paymentAnalyticsModel);
      default:
        throw new Error(`Unsupported report type: ${type}`);
    }
  }
}