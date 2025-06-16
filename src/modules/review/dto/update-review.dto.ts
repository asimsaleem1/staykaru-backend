import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReviewDto {
  @ApiProperty({ example: 4, required: false })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @ApiProperty({
    example: 'Updated: Great service and friendly staff!',
    required: false,
  })
  @IsString()
  @IsOptional()
  comment?: string;
}
