import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { OrderStatus } from '../schema/order.schema';

export class LocationUpdateDto {
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

export class UpdateOrderLocationDto {
  @ApiProperty({
    description: 'Order ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  orderId: string;

  @ApiProperty({
    description: 'Current location coordinates',
    type: LocationUpdateDto,
  })
  location: LocationUpdateDto;

  @ApiPropertyOptional({
    description: 'Order status',
    enum: OrderStatus,
    example: OrderStatus.OUT_FOR_DELIVERY,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Driver is 5 minutes away',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class SetDeliveryLocationDto {
  @ApiProperty({
    description: 'Order ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  orderId: string;

  @ApiProperty({
    description: 'Delivery location coordinates',
    type: LocationUpdateDto,
  })
  coordinates: LocationUpdateDto;

  @ApiProperty({
    description: 'Delivery address',
    example: 'House #123, Block A, Gulshan-e-Iqbal, Karachi',
  })
  @IsString()
  address: string;

  @ApiPropertyOptional({
    description: 'Landmark for easier location',
    example: 'Near Cafe Coffee Day',
  })
  @IsOptional()
  @IsString()
  landmark?: string;
}

export class OptimizeRouteDto {
  @ApiProperty({
    description: 'Starting location',
    type: LocationUpdateDto,
  })
  startLocation: LocationUpdateDto;

  @ApiProperty({
    description: 'Array of delivery locations',
    type: [LocationUpdateDto],
  })
  deliveryLocations: LocationUpdateDto[];
}
