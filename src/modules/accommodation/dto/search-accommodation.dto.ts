import { IsNumber, IsOptional, IsMongoId, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchAccommodationDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'MongoDB ObjectId of the city to filter accommodations by',
    required: false,
  })
  @IsMongoId()
  @IsOptional()
  city?: string;

  @ApiProperty({ example: 0, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minPrice?: number;

  @ApiProperty({ example: 1000, required: false })
  @IsNumber()
  @Max(1000000)
  @IsOptional()
  maxPrice?: number;
}
