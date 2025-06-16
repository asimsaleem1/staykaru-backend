import {
  IsString,
  IsMongoId,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsArray,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class LocationDto {
  @ApiProperty({
    example: 'Point',
    description: 'GeoJSON type (always "Point" for cities)',
    enum: ['Point'],
  })
  @IsString()
  type: 'Point';

  @ApiProperty({
    example: [72.8777, 19.076],
    description: 'Geographic coordinates [longitude, latitude]',
    type: [Number],
    minItems: 2,
    maxItems: 2,
  })
  @IsArray()
  @IsNumber({}, { each: true })
  coordinates: [number, number];
}

export class CreateCityDto {
  @ApiProperty({
    example: 'Mumbai',
    description: 'Name of the city',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'City name must be at least 2 characters long' })
  @MaxLength(100, { message: 'City name must not exceed 100 characters' })
  name: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'MongoDB ObjectId of the country this city belongs to',
  })
  @IsMongoId()
  country: string;

  @ApiPropertyOptional({
    description: 'Geographic location of the city',
    type: LocationDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;
}
