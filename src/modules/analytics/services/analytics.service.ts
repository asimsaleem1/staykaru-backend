import { Injectable } from '@nestjs/common';
import { AnalyticsReportFactory } from '../factories/analytics-report.factory';
import { AnalyticsTimeRange } from '../interfaces/analytics-report.interface';

@Injectable()
export class AnalyticsService {
  constructor(private readonly reportFactory: AnalyticsReportFactory) {}

  async getAnalytics(type: string, days?: number) {
    const report = this.reportFactory.createReport(type);

    let timeRange: AnalyticsTimeRange | undefined;

    if (days) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      timeRange = { startDate, endDate };
    }

    return report.generate(timeRange);
  }
}
