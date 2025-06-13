import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { AnalyticsReport, AnalyticsTimeRange } from '../interfaces/analytics-report.interface';

export class BookingAnalyticsReport implements AnalyticsReport {
  private supabase;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('supabase.url'),
      this.configService.get<string>('supabase.key'),
    );
  }

  async generate(timeRange?: AnalyticsTimeRange) {
    const query = this.supabase
      .from('booking_analytics')
      .select('*')
      .order('created_at', { ascending: false });

    if (timeRange) {
      query.gte('created_at', timeRange.startDate.toISOString())
        .lte('created_at', timeRange.endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return {
      total_bookings: data.length,
      total_revenue: data.reduce((sum, booking) => sum + booking.total_price, 0),
      average_duration: data.reduce((sum, booking) => sum + booking.duration_days, 0) / data.length,
      status_distribution: this.calculateStatusDistribution(data),
      data,
    };
  }

  private calculateStatusDistribution(data: any[]) {
    return data.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {});
  }
}