import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './controller/admin.controller';
import { AdminService } from './services/admin.service';
import { User, UserSchema } from '../user/schema/user.schema';
import { Accommodation, AccommodationSchema } from '../accommodation/schema/accommodation.schema';
import { Booking, BookingSchema } from '../booking/schema/booking.schema';
import { Order, OrderSchema } from '../order/schema/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Accommodation.name, schema: AccommodationSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
