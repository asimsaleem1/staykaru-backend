import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewController } from './controller/review.controller';
import { ReviewService } from './services/review.service';
import { Review, ReviewSchema } from './schema/review.schema';
import { ReviewAnalyticsService } from './services/review-analytics.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
  ],
  controllers: [ReviewController],
  providers: [ReviewService, ReviewAnalyticsService],
  exports: [ReviewService],
})
export class ReviewModule {}