import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review } from '../schema/review.schema';
import { ReviewAnalytics } from '../schema/review-analytics.schema';

@Injectable()
export class ReviewAnalyticsService {
  constructor(
    private configService: ConfigService,
    @InjectModel(ReviewAnalytics.name) private readonly reviewAnalyticsModel: Model<ReviewAnalytics>
  ) {}

  async logReviewEvent(review: Review): Promise<void> {
    await this.reviewAnalyticsModel.create({
      review_id: review._id.toString(),
      user_id: review.user.toString(),
      target_type: review.target_type,
      target_id: review.target_id.toString(),
      rating: review.rating,
      verified: review.verified,
      timestamp: new Date(),
    });
  }
}