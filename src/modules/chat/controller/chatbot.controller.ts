import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  UseGuards, 
  Request,
  ValidationPipe,
  Res
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ChatbotService, ChatResponse } from '../services/chatbot.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { IsString, IsNotEmpty } from 'class-validator';

class ChatMessageDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}

@ApiTags('Chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('message')
  @ApiOperation({ summary: 'Send a message to the chatbot' })
  @ApiResponse({ status: 200, description: 'Chatbot response', schema: { example: { message: 'Hello! How can I help you?' } } })
  async sendMessage(@Body() body: { message: string }, @Res() res) {
    try {
      const userMessage = body?.message || '';
      // Simulate a chatbot response
      return res.status(200).json({ message: userMessage ? `Echo: ${userMessage}` : 'Hello! How can I help you?' });
    } catch (e) {
      return res.status(200).json({ message: 'Hello! How can I help you?' });
    }
  }

  @Post('message/authenticated')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Send message to chatbot (authenticated)',
    description: 'Send a message to the AI chatbot with user context for personalized responses'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Personalized chatbot response based on user role and history'
  })
  async sendAuthenticatedMessage(
    @Body(ValidationPipe) chatMessageDto: ChatMessageDto,
    @Request() req: any
  ): Promise<ChatResponse> {
    const userId = req.user.sub;
    return await this.chatbotService.processMessage(chatMessageDto.message, userId);
  }

  @Get('suggestions')
  @ApiOperation({ 
    summary: 'Get quick suggestion prompts',
    description: 'Get common chatbot prompts/suggestions for quick access'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Array of quick suggestion prompts',
    schema: {
      type: 'object',
      properties: {
        suggestions: {
          type: 'array',
          items: { type: 'string' },
          example: [
            'Find accommodation in Karachi',
            'Show Pakistani restaurants', 
            'Help with booking',
            'Search for biryani'
          ]
        }
      }
    }
  })
  getQuickSuggestions(): { suggestions: string[] } {
    return {
      suggestions: this.chatbotService.getQuickSuggestions()
    };
  }

  @Get('suggestions/personalized')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get personalized quick suggestions',
    description: 'Get chatbot suggestions tailored to the authenticated user\'s role'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Array of personalized suggestion prompts'
  })
  getPersonalizedSuggestions(@Request() req: any): { suggestions: string[] } {
    const userRole = req.user.role;
    return {
      suggestions: this.chatbotService.getQuickSuggestions(userRole)
    };
  }

  @Get('help')
  @ApiOperation({ 
    summary: 'Get chatbot help information',
    description: 'Get information about what the chatbot can help with'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Help information about chatbot capabilities'
  })
  getChatbotHelp(): any {
    return {
      name: 'StayKaru AI Assistant',
      version: '1.0.0',
      capabilities: [
        '🏠 Accommodation Search - Find hostels, apartments, and student housing by city, price, and amenities',
        '🍽️ Restaurant Search - Discover restaurants by cuisine type, location, and ratings', 
        '📋 Menu Browsing - View menu items, prices, and restaurant details',
        '🔍 Smart Search - Understand natural language queries like "cheap biryani in Karachi"',
        '📚 Booking Help - Get guidance on making accommodation reservations',
        '🛍️ Order Assistance - Help with placing food delivery orders',
        '💬 24/7 Support - Always available to answer questions and provide guidance'
      ],
      sample_queries: [
        'Find a cheap hostel in Karachi',
        'Show me Pakistani restaurants in Lahore', 
        'I want to order biryani',
        'How do I make a booking?',
        'What are your best accommodations?',
        'Help me find food near university'
      ],
      supported_cities: ['Karachi', 'Lahore', 'Islamabad'],
      supported_cuisines: ['Pakistani', 'Chinese', 'Fast Food', 'Pizza', 'Continental']
    };
  }
}
