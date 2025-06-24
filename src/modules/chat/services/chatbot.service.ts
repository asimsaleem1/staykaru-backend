import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Accommodation } from '../../accommodation/schema/accommodation.schema';
import { FoodProvider } from '../../food_service/schema/food-provider.schema';
import { MenuItem } from '../../food_service/schema/menu-item.schema';

export interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'accommodation_list' | 'food_list' | 'menu_list';
  data?: any;
}

export interface ChatResponse {
  message: string;
  type: 'text' | 'accommodation_list' | 'food_list' | 'menu_list';
  data?: any;
  suggestions?: string[];
}

@Injectable()
export class ChatbotService {
  constructor(
    @InjectModel(Accommodation.name) private accommodationModel: Model<Accommodation>,
    @InjectModel(FoodProvider.name) private foodProviderModel: Model<FoodProvider>,
    @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItem>,
  ) {}

  async processMessage(message: string, userId?: string): Promise<ChatResponse> {
    const normalizedMessage = message.toLowerCase().trim();
    
    // Greeting patterns
    if (this.isGreeting(normalizedMessage)) {
      return this.getGreetingResponse();
    }

    // Accommodation search patterns
    if (this.isAccommodationQuery(normalizedMessage)) {
      return await this.handleAccommodationQuery(normalizedMessage);
    }

    // Food/restaurant search patterns
    if (this.isFoodQuery(normalizedMessage)) {
      return await this.handleFoodQuery(normalizedMessage);
    }

    // Booking help patterns
    if (this.isBookingQuery(normalizedMessage)) {
      return this.getBookingHelp();
    }

    // Order help patterns
    if (this.isOrderQuery(normalizedMessage)) {
      return this.getOrderHelp();
    }

    // Help patterns
    if (this.isHelpQuery(normalizedMessage)) {
      return this.getHelpResponse();
    }

    // Default response
    return this.getDefaultResponse();
  }

  private isGreeting(message: string): boolean {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'assalam', 'salam'];
    return greetings.some(greeting => message.includes(greeting));
  }

  private isAccommodationQuery(message: string): boolean {
    const keywords = ['accommodation', 'room', 'hostel', 'apartment', 'place to stay', 'housing', 'rent', 'lodge'];
    return keywords.some(keyword => message.includes(keyword));
  }

  private isFoodQuery(message: string): boolean {
    const keywords = ['food', 'restaurant', 'eat', 'meal', 'hungry', 'order', 'menu', 'biryani', 'pizza', 'burger'];
    return keywords.some(keyword => message.includes(keyword));
  }

  private isBookingQuery(message: string): boolean {
    const keywords = ['book', 'booking', 'reserve', 'reservation', 'check in', 'check out'];
    return keywords.some(keyword => message.includes(keyword));
  }

  private isOrderQuery(message: string): boolean {
    const keywords = ['order', 'delivery', 'food order', 'place order'];
    return keywords.some(keyword => message.includes(keyword));
  }

  private isHelpQuery(message: string): boolean {
    const keywords = ['help', 'support', 'how to', 'what can you do', 'commands'];
    return keywords.some(keyword => message.includes(keyword));
  }

  private getGreetingResponse(): ChatResponse {
    const greetings = [
      "Hello! I'm your StayKaru assistant. I can help you find accommodations, food, and answer questions about bookings and orders.",
      "Hi there! Welcome to StayKaru. How can I help you today?",
      "Assalam-o-Alaikum! I'm here to help you with accommodations and food services. What are you looking for?"
    ];
    
    return {
      message: greetings[Math.floor(Math.random() * greetings.length)],
      type: 'text',
      suggestions: ['Find accommodation', 'Search restaurants', 'Help with booking', 'Show menu items']
    };
  }

  private async handleAccommodationQuery(message: string): Promise<ChatResponse> {
    try {
      // Extract city if mentioned
      const cities = ['karachi', 'lahore', 'islamabad'];
      const mentionedCity = cities.find(city => message.includes(city));
      
      let query: any = { isActive: true };
      if (mentionedCity) {
        query.city = new RegExp(mentionedCity, 'i');
      }

      const accommodations = await this.accommodationModel
        .find(query)
        .limit(5)
        .select('title description city pricePerNight amenities rating totalReviews')
        .exec();

      if (accommodations.length === 0) {
        return {
          message: mentionedCity 
            ? `Sorry, I couldn't find any accommodations in ${mentionedCity}. Try searching in Karachi, Lahore, or Islamabad.`
            : "I couldn't find any accommodations right now. Please try again later.",
          type: 'text',
          suggestions: ['Search in Karachi', 'Search in Lahore', 'Search in Islamabad']
        };
      }

      return {
        message: `I found ${accommodations.length} accommodation${accommodations.length > 1 ? 's' : ''} for you${mentionedCity ? ` in ${mentionedCity}` : ''}:`,
        type: 'accommodation_list',
        data: accommodations,
        suggestions: ['Show more options', 'Help with booking', 'Search restaurants']
      };
    } catch (error) {
      return {
        message: "Sorry, I'm having trouble searching for accommodations right now. Please try again later.",
        type: 'text'
      };
    }
  }

  private async handleFoodQuery(message: string): Promise<ChatResponse> {
    try {
      // Extract cuisine or city if mentioned
      const cuisines = ['pakistani', 'chinese', 'fast food', 'pizza', 'biryani'];
      const cities = ['karachi', 'lahore', 'islamabad'];
      
      const mentionedCuisine = cuisines.find(cuisine => message.includes(cuisine));
      const mentionedCity = cities.find(city => message.includes(city));

      let query: any = { is_active: true };
      if (mentionedCity) {
        query.city = new RegExp(mentionedCity, 'i');
      }
      if (mentionedCuisine) {
        query.cuisineTypes = new RegExp(mentionedCuisine, 'i');
      }

      // If user mentioned specific food items, search menu items instead
      const foodItems = ['biryani', 'burger', 'pizza', 'tikka', 'karahi'];
      const mentionedFood = foodItems.find(food => message.includes(food));
      
      if (mentionedFood) {
        const menuItems = await this.menuItemModel
          .find({ 
            name: new RegExp(mentionedFood, 'i'),
            approvalStatus: 'approved' 
          })
          .populate('provider', 'name description businessName')
          .limit(5)
          .select('name description price provider category')
          .exec();

        if (menuItems.length > 0) {
          return {
            message: `I found ${menuItems.length} ${mentionedFood} option${menuItems.length > 1 ? 's' : ''} for you:`,
            type: 'menu_list',
            data: menuItems,
            suggestions: ['Place order', 'Show more restaurants', 'Search accommodations']
          };
        }
      }

      const foodProviders = await this.foodProviderModel
        .find(query)
        .limit(5)
        .select('name description cuisineTypes rating city businessName')
        .exec();

      if (foodProviders.length === 0) {
        return {
          message: "I couldn't find any restaurants matching your criteria. Try searching for Pakistani food, Chinese, or Fast Food.",
          type: 'text',
          suggestions: ['Pakistani restaurants', 'Chinese food', 'Fast food', 'Pizza places']
        };
      }

      return {
        message: `I found ${foodProviders.length} restaurant${foodProviders.length > 1 ? 's' : ''} for you:`,
        type: 'food_list',
        data: foodProviders,
        suggestions: ['Show menu', 'Place order', 'Find accommodations']
      };
    } catch (error) {
      return {
        message: "Sorry, I'm having trouble searching for restaurants right now. Please try again later.",
        type: 'text'
      };
    }
  }

  private getBookingHelp(): ChatResponse {
    return {
      message: `Here's how to make a booking:
      
1. Browse accommodations by city or type
2. Select your preferred place
3. Choose check-in and check-out dates
4. Add guest count and special requests
5. Confirm your booking and make payment

You can view your bookings in the "My Bookings" section of your profile.`,
      type: 'text',
      suggestions: ['Find accommodation', 'View my bookings', 'Contact support']
    };
  }

  private getOrderHelp(): ChatResponse {
    return {
      message: `Here's how to place a food order:
      
1. Browse restaurants by location or cuisine
2. Select a restaurant and view their menu
3. Add items to your cart with quantities
4. Provide your delivery address
5. Confirm order and make payment

You can track your orders in the "My Orders" section.`,
      type: 'text',
      suggestions: ['Find restaurants', 'View my orders', 'Contact support']
    };
  }

  private getHelpResponse(): ChatResponse {
    return {
      message: `I can help you with:
      
🏠 **Accommodations**: Find hostels, apartments, and student housing
🍽️ **Food**: Search restaurants, browse menus, and place orders
📋 **Bookings**: Help with accommodation reservations
🛍️ **Orders**: Assistance with food delivery orders
📞 **Support**: General questions and guidance

What would you like help with?`,
      type: 'text',
      suggestions: ['Find accommodation', 'Search restaurants', 'Booking help', 'Order help']
    };
  }

  private getDefaultResponse(): ChatResponse {
    const responses = [
      "I'm not sure I understand. Can you try rephrasing that?",
      "Could you please be more specific about what you're looking for?",
      "I can help you find accommodations, restaurants, or answer questions about bookings and orders. What interests you?"
    ];

    return {
      message: responses[Math.floor(Math.random() * responses.length)],
      type: 'text',
      suggestions: ['Find accommodation', 'Search restaurants', 'Help', 'What can you do?']
    };
  }

  // Get quick suggestions based on user context
  getQuickSuggestions(userRole?: string): string[] {
    const commonSuggestions = [
      'Find accommodation in Karachi',
      'Show Pakistani restaurants',
      'Help with booking',
      'Search for biryani'
    ];

    switch (userRole) {
      case 'student':
        return [
          'Find budget hostels',
          'Cheap food options',
          'My bookings',
          'My orders',
          ...commonSuggestions
        ];
      case 'landlord':
        return [
          'My property bookings',
          'Revenue statistics',
          'Find restaurants',
          ...commonSuggestions
        ];
      case 'food_provider':
        return [
          'My restaurant orders',
          'Find accommodations',
          'Business analytics',
          ...commonSuggestions
        ];
      default:
        return commonSuggestions;
    }
  }
}
