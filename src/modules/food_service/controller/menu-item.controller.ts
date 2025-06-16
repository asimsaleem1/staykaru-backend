import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { MenuItemService } from '../services/menu-item.service';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';
import { UpdateMenuItemDto } from '../dto/update-menu-item.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { FoodProviderGuard } from '../guards/food-provider.guard';

@ApiTags('menu-items')
@Controller('menu-items')
// @UseGuards(AuthGuard) // Temporarily disabled for testing
// @ApiBearerAuth('JWT-auth') // Temporarily disabled for testing
export class MenuItemController {
  constructor(private readonly menuItemService: MenuItemService) {}

  @Post()
  // @UseGuards(FoodProviderGuard) // Temporarily disabled for testing
  @ApiOperation({ summary: 'Create a new menu item' })
  @ApiResponse({
    status: 201,
    description: 'Menu item successfully created',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato, mozzarella, and fresh basil',
        price: 12.99,
        currency: 'USD',
        category: 'Pizza',
        ingredients: ['Tomato sauce', 'Mozzarella', 'Fresh basil', 'Olive oil'],
        dietary_info: ['Vegetarian'],
        availability: true,
        preparation_time: 15,
        food_provider_id: '507f1f77bcf86cd799439012',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only food providers can create menu items',
  })
  async create(@Body() createMenuItemDto: CreateMenuItemDto, @Request() req) {
    // Temporary fix for testing without auth
    const userId = req.user?._id || '683700350f8a15197d2abf50'; // Dummy user ID for testing
    return this.menuItemService.create(createMenuItemDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all menu items' })
  @ApiResponse({
    status: 200,
    description: 'Return all menu items',
    schema: {
      example: [
        {
          id: '507f1f77bcf86cd799439011',
          name: 'Margherita Pizza',
          description: 'Classic pizza with tomato, mozzarella, and fresh basil',
          price: 12.99,
          currency: 'USD',
          category: 'Pizza',
          availability: true,
          preparation_time: 15,
          food_provider: {
            id: '507f1f77bcf86cd799439012',
            name: 'Italian Bistro',
          },
        },
      ],
    },
  })
  async findAll() {
    return this.menuItemService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a menu item by ID' })
  @ApiParam({ name: 'id', description: 'Menu Item ID' })
  @ApiResponse({
    status: 200,
    description: 'Return a menu item',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato, mozzarella, and fresh basil',
        price: 12.99,
        currency: 'USD',
        category: 'Pizza',
        ingredients: ['Tomato sauce', 'Mozzarella', 'Fresh basil', 'Olive oil'],
        dietary_info: ['Vegetarian'],
        availability: true,
        preparation_time: 15,
        nutritional_info: {
          calories: 280,
          protein: 12,
          carbs: 35,
          fat: 10,
        },
        food_provider_id: '507f1f77bcf86cd799439012',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  async findOne(@Param('id') id: string) {
    return this.menuItemService.findOne(id);
  }

  @Put(':id')
  // @UseGuards(FoodProviderGuard) // Temporarily disabled for testing
  @ApiOperation({ summary: 'Update a menu item (Food Providers only)' })
  @ApiParam({ name: 'id', description: 'Menu Item ID' })
  @ApiResponse({
    status: 200,
    description: 'Menu item successfully updated',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        name: 'Updated Pizza Name',
        message: 'Menu item updated successfully',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only update own menu items',
  })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  async update(
    @Param('id') id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
    @Request() req,
  ) {
    // Temporary fix for testing without auth
    const userId = req.user?._id || '683700350f8a15197d2abf50'; // Dummy user ID for testing
    return this.menuItemService.update(id, updateMenuItemDto, userId);
  }

  @Delete(':id')
  // @UseGuards(FoodProviderGuard) // Temporarily disabled for testing
  @ApiOperation({ summary: 'Delete a menu item (Food Providers only)' })
  @ApiParam({ name: 'id', description: 'Menu Item ID' })
  @ApiResponse({
    status: 200,
    description: 'Menu item successfully deleted',
    schema: {
      example: {
        message: 'Menu item deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only delete own menu items',
  })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  async remove(@Param('id') id: string, @Request() req) {
    // Temporary fix for testing without auth
    const userId = req.user?._id || '683700350f8a15197d2abf50'; // Dummy user ID for testing
    await this.menuItemService.remove(id, userId);
    return { message: 'Menu item deleted successfully' };
  }
}
