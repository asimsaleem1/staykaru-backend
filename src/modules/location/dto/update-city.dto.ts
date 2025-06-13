import { IsString, IsMongoId, IsNotEmpty, MinLength, MaxLength, IsOptional, IsArray, IsNumber, ValidateNested } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class LocationDto {
  @ApiPropertyOptional({
    example: 'Point',
    description: 'GeoJSON type (always "Point" for cities)',
    enum: ['Point']
  })
  @IsOptional()
  @IsString()
  type?: 'Point';

  @ApiPropertyOptional({
    example: [72.8777, 19.0760],
    description: 'Geographic coordinates [longitude, latitude]',
    type: [Number],
    minItems: 2,
    maxItems: 2
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  coordinates?: [number, number];
}

export class UpdateCityDto {
  @ApiPropertyOptional({ 
    example: 'Mumbai',
    description: 'Updated name of the city',
    minLength: 2,
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'City name must be at least 2 characters long' })
  @MaxLength(100, { message: 'City name must not exceed 100 characters' })
  name?: string;

  @ApiPropertyOptional({ 
    example: '507f1f77bcf86cd799439011',
    description: 'Updated MongoDB ObjectId of the country this city belongs to'
  })
  @IsOptional()
  @IsMongoId()
  country?: string;

  @ApiPropertyOptional({
    description: 'Updated geographic location of the city',
    type: LocationDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;
}
