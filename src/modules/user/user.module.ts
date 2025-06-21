import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { UserController } from './controller/user.controller';
import { UserService } from './services/user.service';
import { User, UserSchema } from './schema/user.schema';
import { Booking, BookingSchema } from '../booking/schema/booking.schema';
import { Order, OrderSchema } from '../order/schema/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    CacheModule.register(),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
