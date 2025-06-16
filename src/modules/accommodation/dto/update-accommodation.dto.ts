import {
  IsString,
  IsNumber,
  IsArray,
  IsMongoId,
  Min,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAccommodationDto {
  @ApiProperty({ example: 'Cozy Studio Apartment', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    example: 'A beautiful studio apartment in the heart of the city',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description:
      'MongoDB ObjectId of the city where this accommodation is located',
    required: false,
  })
  @IsMongoId()
  @IsOptional()
  city?: string;

  @ApiProperty({ example: 1000, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiProperty({
    example: ['WiFi', 'Air Conditioning', 'Kitchen'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];

  @ApiProperty({ example: ['2024-03-01', '2024-03-02'], required: false })
  @IsArray()
  @IsDateString({}, { each: true })
  @IsOptional()
  availability?: string[];
}
