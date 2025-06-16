import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import {
  AnalyticsReport,
  AnalyticsTimeRange,
} from '../interfaces/analytics-report.interface';

export class PaymentAnalyticsReport implements AnalyticsReport {
  constructor(
    private configService: ConfigService,
    private paymentAnalyticsModel: Model<any>,
  ) {}

  async generate(timeRange?: AnalyticsTimeRange) {
    let query = this.paymentAnalyticsModel.find().sort({ createdAt: -1 });

    if (timeRange) {
      const filter = {
        createdAt: {
          $gte: timeRange.startDate,
          $lte: timeRange.endDate,
        },
      };
      query = this.paymentAnalyticsModel.find(filter).sort({ createdAt: -1 });
    }

    try {
      const data = await query.exec();

      return {
        summary: {
          totalPayments: data.length,
          totalAmount: data.reduce(
            (sum, payment) => sum + (payment.amount || 0),
            0,
          ),
          paymentMethods: this.calculatePaymentMethodDistribution(data),
          statusDistribution: this.calculateStatusDistribution(data),
        },
        transactions: data,
        timeRange: timeRange || {
          startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
          endDate: new Date(),
        },
      };
    } catch (error) {
      console.error('Error generating payment analytics:', error);
      throw error;
    }
  }

  private calculatePaymentMethodDistribution(data: any[]) {
    return data.reduce((acc, payment) => {
      acc[payment.method] = (acc[payment.method] || 0) + 1;
      return acc;
    }, {});
  }

  private calculateStatusDistribution(data: any[]) {
    return data.reduce((acc, payment) => {
      acc[payment.status] = (acc[payment.status] || 0) + 1;
      return acc;
    }, {});
  }
}
