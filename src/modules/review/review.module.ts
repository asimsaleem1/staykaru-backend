import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewController } from './controller/review.controller';
import { ReviewService } from './services/review.service';
import { Review, ReviewSchema } from './schema/review.schema';
import { ReviewAnalyticsService } from './services/review-analytics.service';
import {
  ReviewAnalytics,
  ReviewAnalyticsSchema,
} from './schema/review-analytics.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Review.name, schema: ReviewSchema },
      { name: ReviewAnalytics.name, schema: ReviewAnalyticsSchema },
    ]),
  ],
  controllers: [ReviewController],
  providers: [ReviewService, ReviewAnalyticsService],
  exports: [ReviewService],
})
export class ReviewModule {}
