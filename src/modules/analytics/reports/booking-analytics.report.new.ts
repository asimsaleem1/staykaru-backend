import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import {
  AnalyticsReport,
  AnalyticsTimeRange,
} from '../interfaces/analytics-report.interface';

export class BookingAnalyticsReport implements AnalyticsReport {
  constructor(
    private configService: ConfigService,
    private bookingAnalyticsModel: Model<any>,
  ) {}

  async generate(timeRange?: AnalyticsTimeRange) {
    let query = this.bookingAnalyticsModel.find().sort({ createdAt: -1 });

    if (timeRange) {
      const filter = {
        createdAt: {
          $gte: timeRange.startDate,
          $lte: timeRange.endDate,
        },
      };
      query = this.bookingAnalyticsModel.find(filter).sort({ createdAt: -1 });
    }

    try {
      const data = await query.exec();

      return {
        summary: {
          totalBookings: data.length,
          avgDuration: this.calculateAverageDuration(data),
          statusDistribution: this.calculateStatusDistribution(data),
        },
        bookings: data,
        timeRange: timeRange || {
          startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
          endDate: new Date(),
        },
      };
    } catch (error) {
      console.error('Error generating booking analytics:', error);
      throw error;
    }
  }

  private calculateAverageDuration(data: any[]) {
    if (data.length === 0) return 0;

    const totalDuration = data.reduce((sum, booking) => {
      if (!booking.checkIn || !booking.checkOut) return sum;
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      const durationMs = checkOut.getTime() - checkIn.getTime();
      const durationDays = durationMs / (1000 * 60 * 60 * 24);
      return sum + durationDays;
    }, 0);

    return totalDuration / data.length;
  }

  private calculateStatusDistribution(data: any[]) {
    return data.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {});
  }
}
