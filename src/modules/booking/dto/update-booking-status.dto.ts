import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '../schema/booking.schema';

export class UpdateBookingStatusDto {
  @ApiProperty({ enum: BookingStatus })
  @IsEnum(BookingStatus)
  status: BookingStatus;
}
