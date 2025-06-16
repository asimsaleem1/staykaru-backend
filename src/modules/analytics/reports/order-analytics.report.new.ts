import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import {
  AnalyticsReport,
  AnalyticsTimeRange,
} from '../interfaces/analytics-report.interface';

export class OrderAnalyticsReport implements AnalyticsReport {
  constructor(
    private configService: ConfigService,
    private orderAnalyticsModel: Model<any>,
  ) {}

  async generate(timeRange?: AnalyticsTimeRange) {
    let query = this.orderAnalyticsModel.find().sort({ createdAt: -1 });

    if (timeRange) {
      const filter = {
        createdAt: {
          $gte: timeRange.startDate,
          $lte: timeRange.endDate,
        },
      };
      query = this.orderAnalyticsModel.find(filter).sort({ createdAt: -1 });
    }

    try {
      const data = await query.exec();

      return {
        summary: {
          totalOrders: data.length,
          totalRevenue: data.reduce(
            (sum, order) => sum + (order.totalAmount || 0),
            0,
          ),
          averageItemsPerOrder:
            data.length > 0
              ? data.reduce((sum, order) => sum + (order.itemCount || 0), 0) /
                data.length
              : 0,
          statusDistribution: this.calculateStatusDistribution(data),
        },
        orders: data,
        timeRange: timeRange || {
          startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
          endDate: new Date(),
        },
      };
    } catch (error) {
      console.error('Error generating order analytics:', error);
      throw error;
    }
  }

  private calculateStatusDistribution(data: any[]) {
    return data.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
  }
}
