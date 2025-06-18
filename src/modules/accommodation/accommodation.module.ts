import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { AccommodationController } from './controller/accommodation.controller';
import { AccommodationService } from './services/accommodation.service';
import {
  Accommodation,
  AccommodationSchema,
} from './schema/accommodation.schema';
import { LocationModule } from '../location/location.module';
import { UserModule } from '../user/user.module';
import { Booking, BookingSchema } from '../booking/schema/booking.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Accommodation.name, schema: AccommodationSchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
    CacheModule.register(),
    LocationModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AccommodationController],
  providers: [AccommodationService],
  exports: [AccommodationService],
})
export class AccommodationModule {}
