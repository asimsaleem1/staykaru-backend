import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BookingController } from './controller/booking.controller';
import { BookingService } from './services/booking.service';
import { Booking, BookingSchema } from './schema/booking.schema';
import { AccommodationModule } from '../accommodation/accommodation.module';
import { UserModule } from '../user/user.module';
import { RealtimeService } from './services/realtime.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
    AccommodationModule,
    UserModule,
  ],
  controllers: [BookingController],
  providers: [BookingService, RealtimeService],
  exports: [BookingService],
})
export class BookingModule {}
