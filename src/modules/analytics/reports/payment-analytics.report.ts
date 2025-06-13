import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { AnalyticsReport, AnalyticsTimeRange } from '../interfaces/analytics-report.interface';

export class PaymentAnalyticsReport implements AnalyticsReport {
  private supabase;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('supabase.url'),
      this.configService.get<string>('supabase.key'),
    );
  }

  async generate(timeRange?: AnalyticsTimeRange) {
    const query = this.supabase
      .from('payment_analytics')
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
      total_payments: data.length,
      total_amount: data.reduce((sum, payment) => sum + payment.amount, 0),
      payment_methods: this.calculatePaymentMethodDistribution(data),
      status_distribution: this.calculateStatusDistribution(data),
      data,
    };
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