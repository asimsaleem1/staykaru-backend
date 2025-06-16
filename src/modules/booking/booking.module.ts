import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingController } from './controller/booking.controller';
import { BookingService } from './services/booking.service';
import { Booking, BookingSchema } from './schema/booking.schema';
import { AccommodationModule } from '../accommodation/accommodation.module';
import { UserModule } from '../user/user.module';
import { RealtimeService } from './services/realtime.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }]),
    AccommodationModule,
    UserModule,
  ],
  controllers: [BookingController],
  providers: [BookingService, RealtimeService],
  exports: [BookingService],
})
export class BookingModule {}
