import {
  IsMongoId,
  IsArray,
  IsNumber,
  IsString,
  IsOptional,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class OrderItemDto {
  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011' })
  @IsOptional()
  @IsMongoId()
  menu_item?: string;

  @ApiProperty({ example: 'Chicken Biryani' })
  @IsString()
  name: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 15.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 'Extra spicy, no onions' })
  @IsOptional()
  @IsString()
  specialInstructions?: string;
}

export class CreateOrderDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  foodProvider: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiPropertyOptional({ example: '123 University Ave, Dorm Room 205, Test City' })
  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @ApiProperty({ example: 42.48 })
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiPropertyOptional({ example: 'card' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({ example: 'Call when you arrive, building entrance code is 1234' })
  @IsOptional()
  @IsString()
  deliveryInstructions?: string;
}
