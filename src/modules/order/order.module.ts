import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderController } from './controller/order.controller';
import { OrderTrackingController } from './controller/order-tracking.controller';
import { TrackingController } from './controller/tracking.controller';
import { OrderService } from './services/order.service';
import { OrderTrackingService } from './services/order-tracking.service';
import { TrackingService } from './services/tracking.service';
import { Order, OrderSchema } from './schema/order.schema';
import {
  MenuItem,
  MenuItemSchema,
} from '../food_service/schema/menu-item.schema';
import { Booking, BookingSchema } from '../booking/schema/booking.schema';
import { UserModule } from '../user/user.module';
import { LocationModule } from '../location/location.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: MenuItem.name, schema: MenuItemSchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
    UserModule,
    LocationModule,
  ],
  controllers: [OrderController, OrderTrackingController, TrackingController],
  providers: [OrderService, OrderTrackingService, TrackingService],
  exports: [OrderService, OrderTrackingService, TrackingService],
})
export class OrderModule {}
