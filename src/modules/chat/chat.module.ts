import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
// ...existing imports...
import { ChatbotService } from './services/chatbot.service';
import { ChatbotController } from './controller/chatbot.controller';
import { Accommodation, AccommodationSchema } from '../accommodation/schema/accommodation.schema';
import { FoodProvider, FoodProviderSchema } from '../food_service/schema/food-provider.schema';
import { MenuItem, MenuItemSchema } from '../food_service/schema/menu-item.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      // ...existing schemas...
      { name: Accommodation.name, schema: AccommodationSchema },
      { name: FoodProvider.name, schema: FoodProviderSchema },
      { name: MenuItem.name, schema: MenuItemSchema },
    ]),
  ],
  controllers: [
    // ...existing controllers...
    ChatbotController,
  ],
  providers: [
    // ...existing services...
    ChatbotService,
  ],
  exports: [
    // ...existing exports...
    ChatbotService,
  ],
})
export class ChatModule {}