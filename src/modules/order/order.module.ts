import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderController } from './controller/order.controller';
import { OrderService } from './services/order.service';
import { Order, OrderSchema } from './schema/order.schema';
import {
  MenuItem,
  MenuItemSchema,
} from '../food_service/schema/menu-item.schema';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: MenuItem.name, schema: MenuItemSchema },
    ]),
    UserModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
