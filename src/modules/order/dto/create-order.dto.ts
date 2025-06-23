import {
  IsMongoId,
  IsArray,
  IsNumber,
  IsString,
  IsOptional,
  Min,
  ValidateNested,
  ArrayMinSize,
  IsNotEmpty,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class LocationCoordinatesDto {
  @ApiProperty({ example: 12.9716 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 77.5946 })
  @IsNumber()
  longitude: number;
}

class DeliveryLocationDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => LocationCoordinatesDto)
  coordinates: LocationCoordinatesDto;

  @ApiProperty({ example: '123 Main St, Room 405' })
  @IsString()
  address: string;

  @ApiPropertyOptional({ example: 'Near Coffee Shop' })
  @IsOptional()
  @IsString()
  landmark?: string;
}

class OrderItemDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsNotEmpty()
  @IsMongoId()
  menu_item: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ example: 'Extra spicy, no onions' })
  @IsOptional()
  @IsString()
  special_instructions?: string;
}

export class CreateOrderDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsNotEmpty()
  @IsMongoId()
  food_provider: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => DeliveryLocationDto)
  delivery_location: DeliveryLocationDto;

  @ApiPropertyOptional({ example: 'Please deliver before 7 PM' })
  @IsOptional()
  @IsString()
  delivery_instructions?: string;
}
