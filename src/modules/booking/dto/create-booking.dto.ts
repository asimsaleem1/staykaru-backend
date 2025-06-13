import { IsMongoId, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  accommodation: string;

  @ApiProperty({ example: '2024-03-20' })
  @IsDateString()
  start_date: string;

  @ApiProperty({ example: '2024-03-25' })
  @IsDateString()
  end_date: string;
}