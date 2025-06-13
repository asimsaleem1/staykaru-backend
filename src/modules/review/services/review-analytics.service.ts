import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { Review } from '../schema/review.schema';

@Injectable()
export class ReviewAnalyticsService {
  private supabase;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('supabase.url'),
      this.configService.get<string>('supabase.key'),
    );
  }

  async logReviewEvent(review: Review): Promise<void> {
    await this.supabase.from('review_analytics').insert({
      review_id: review._id.toString(),
      user_id: review.user.toString(),
      target_type: review.target_type,
      target_id: review.target_id.toString(),
      rating: review.rating,
      verified: review.verified,
      timestamp: new Date().toISOString(),
    });
  }
}