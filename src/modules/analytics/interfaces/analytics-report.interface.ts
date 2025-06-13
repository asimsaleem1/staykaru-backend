export interface AnalyticsReport {
  generate(timeRange?: AnalyticsTimeRange): Promise<any>;
}

export interface AnalyticsTimeRange {
  startDate: Date;
  endDate: Date;
}