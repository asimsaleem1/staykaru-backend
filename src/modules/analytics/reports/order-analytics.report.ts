import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { AnalyticsReport, AnalyticsTimeRange } from '../interfaces/analytics-report.interface';

export class OrderAnalyticsReport implements AnalyticsReport {
  private supabase;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('supabase.url'),
      this.configService.get<string>('supabase.key'),
    );
  }

  async generate(timeRange?: AnalyticsTimeRange) {
    const query = this.supabase
      .from('order_analytics')
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
      total_orders: data.length,
      total_revenue: data.reduce((sum, order) => sum + order.total_amount, 0),
      average_items_per_order: data.reduce((sum, order) => sum + order.item_count, 0) / data.length,
      status_distribution: this.calculateStatusDistribution(data),
      data,
    };
  }

  private calculateStatusDistribution(data: any[]) {
    return data.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
  }
}