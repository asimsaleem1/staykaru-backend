import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { UserController } from './controller/user.controller';
import { UserPreferencesController } from './controller/user-preferences.controller';
import { UserService } from './services/user.service';
import { UserPreferencesService } from './services/user-preferences.service';
import { RecommendationService } from './services/recommendation.service';
import { User, UserSchema } from './schema/user.schema';
import { UserPreferences, UserPreferencesSchema } from './schema/user-preferences.schema';
import { Booking, BookingSchema } from '../booking/schema/booking.schema';
import { Order, OrderSchema } from '../order/schema/order.schema';
import { Accommodation, AccommodationSchema } from '../accommodation/schema/accommodation.schema';
import { FoodProvider, FoodProviderSchema } from '../food_service/schema/food-provider.schema';
import { MenuItem, MenuItemSchema } from '../food_service/schema/menu-item.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserPreferences.name, schema: UserPreferencesSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Accommodation.name, schema: AccommodationSchema },
      { name: FoodProvider.name, schema: FoodProviderSchema },
      { name: MenuItem.name, schema: MenuItemSchema },
    ]),
    CacheModule.register(),
  ],
  controllers: [UserController, UserPreferencesController],
  providers: [UserService, UserPreferencesService, RecommendationService],
  exports: [UserService, UserPreferencesService, RecommendationService],
})
export class UserModule {}
