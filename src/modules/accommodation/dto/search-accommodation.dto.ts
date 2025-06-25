import { IsNumber, IsOptional, IsMongoId, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
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

  @ApiProperty({ 
    example: 1, 
    description: 'Page number for pagination',
    required: false,
    default: 1
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ 
    example: 50, 
    description: 'Number of items per page (max 100)',
    required: false,
    default: 50
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 50;
}
