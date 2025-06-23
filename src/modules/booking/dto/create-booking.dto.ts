import { 
  IsMongoId, 
  IsDateString, 
  IsNumber, 
  IsString, 
  IsOptional, 
  Min 
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  accommodation: string;

  @ApiProperty({ example: '2024-03-20' })
  @IsDateString()
  checkInDate: string;

  @ApiProperty({ example: '2024-03-25' })
  @IsDateString()
  checkOutDate: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  guests?: number;

  @ApiPropertyOptional({ example: 450.00 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @ApiPropertyOptional({ example: 'card' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({ example: 'Late check-in preferred after 6 PM' })
  @IsOptional()
  @IsString()
  specialRequests?: string;
}
