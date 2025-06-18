import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { FoodProviderController } from './controller/food-provider.controller';
import { MenuItemController } from './controller/menu-item.controller';
import { FoodProviderService } from './services/food-provider.service';
import { MenuItemService } from './services/menu-item.service';
import {
  FoodProvider,
  FoodProviderSchema,
} from './schema/food-provider.schema';
import { MenuItem, MenuItemSchema } from './schema/menu-item.schema';
import { UserModule } from '../user/user.module';
import { Order, OrderSchema } from '../order/schema/order.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FoodProvider.name, schema: FoodProviderSchema },
      { name: MenuItem.name, schema: MenuItemSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    CacheModule.register(),
    UserModule,
    AuthModule,
  ],
  controllers: [FoodProviderController, MenuItemController],
  providers: [FoodProviderService, MenuItemService],
  exports: [FoodProviderService, MenuItemService],
})
export class FoodServiceModule {}
