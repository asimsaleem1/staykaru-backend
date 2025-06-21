import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  IsEnum,
} from 'class-validator';

export class LocationDto {
  @ApiProperty({
    description: 'Latitude coordinate',
    example: 24.8607,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: 67.0011,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}

export class MapSearchDto {
  @ApiProperty({
    description: 'Search location coordinates',
    type: LocationDto,
  })
  location: LocationDto;

  @ApiPropertyOptional({
    description: 'Search radius in meters',
    example: 5000,
    default: 5000,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50000)
  radius?: number;

  @ApiPropertyOptional({
    description: 'Type of place to search for',
    example: 'lodging',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'Search keyword',
    example: 'hotel',
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({
    description: 'Minimum price level (0-4)',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum price level (0-4)',
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  maxPrice?: number;
}

export class RouteDto {
  @ApiProperty({
    description: 'Origin location',
    type: LocationDto,
  })
  origin: LocationDto;

  @ApiProperty({
    description: 'Destination location',
    type: LocationDto,
  })
  destination: LocationDto;

  @ApiPropertyOptional({
    description: 'Travel mode',
    example: 'driving',
    enum: ['driving', 'walking', 'transit'],
  })
  @IsOptional()
  @IsEnum(['driving', 'walking', 'transit'])
  mode?: 'driving' | 'walking' | 'transit';
}

export class GeocodeDto {
  @ApiProperty({
    description: 'Address to geocode',
    example: 'Karachi, Pakistan',
  })
  @IsString()
  address: string;
}

export class ReverseGeocodeDto {
  @ApiProperty({
    description: 'Location to reverse geocode',
    type: LocationDto,
  })
  location: LocationDto;
}

export class PlaceSearchDto {
  @ApiProperty({
    description: 'Search query',
    example: 'restaurants near me',
  })
  @IsString()
  query: string;

  @ApiPropertyOptional({
    description: 'Location to search near',
    type: LocationDto,
  })
  @IsOptional()
  location?: LocationDto;

  @ApiPropertyOptional({
    description: 'Search radius in meters',
    example: 5000,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50000)
  radius?: number;
}

export class TrackOrderDto {
  @ApiProperty({
    description: 'Order ID to track',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  orderId: string;

  @ApiProperty({
    description: 'Current location of the order',
    type: LocationDto,
  })
  location: LocationDto;
}
