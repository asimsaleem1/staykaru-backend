import { IsString, IsNumber, IsArray, IsMongoId, Min, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccommodationDto {
  @ApiProperty({ example: 'Cozy Studio Apartment' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'A beautiful studio apartment in the heart of the city' })
  @IsString()
  description: string;

  @ApiProperty({ 
    example: '507f1f77bcf86cd799439011',
    description: 'MongoDB ObjectId of the city where this accommodation is located'
  })
  @IsMongoId()
  city: string;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: ['WiFi', 'Air Conditioning', 'Kitchen'] })
  @IsArray()
  @IsString({ each: true })
  amenities: string[];

  @ApiProperty({ example: ['2024-03-01', '2024-03-02'] })
  @IsArray()
  @IsDateString({}, { each: true })
  availability: string[];
}