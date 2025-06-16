import {
  IsString,
  IsEnum,
  IsNumber,
  IsMongoId,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReviewTargetType } from '../schema/review.schema';

export class CreateReviewDto {
  @ApiProperty({ enum: ReviewTargetType })
  @IsEnum(ReviewTargetType)
  target_type: ReviewTargetType;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  target_id: string;

  @ApiProperty({ example: 4 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Great service and friendly staff!' })
  @IsString()
  comment: string;
}
