import { 
  IsMongoId, 
  IsDateString, 
  IsNumber, 
  IsString, 
  IsOptional, 
  Min,
  IsNotEmpty
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateBookingDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Accommodation ID' })
  @IsNotEmpty()
  @IsMongoId()
  accommodation: string;

  @ApiProperty({ example: '2024-03-20T00:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  @Transform(({ value }) => new Date(value).toISOString())
  checkInDate: string;

  @ApiProperty({ example: '2024-03-25T00:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  @Transform(({ value }) => new Date(value).toISOString())
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
  total_amount?: number;

  @ApiPropertyOptional({ example: 'card' })
  @IsOptional()
  @IsString()
  payment_method?: string;

  @ApiPropertyOptional({ example: 'Late check-in preferred after 6 PM' })
  @IsOptional()
  @IsString()
  special_requests?: string;
  start_date: string | number | Date;
  end_date: string | number | Date;
}
