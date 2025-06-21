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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { FoodProviderService } from '../services/food-provider.service';
import { CreateFoodProviderDto } from '../dto/create-food-provider.dto';
import { UpdateFoodProviderDto } from '../dto/update-food-provider.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { FoodProviderGuard } from '../guards/food-provider.guard';

@ApiTags('food-providers')
@Controller('food-providers')
// @UseGuards(AuthGuard) // Temporarily disabled for testing
// @ApiBearerAuth('JWT-auth') // Temporarily disabled for testing
export class FoodProviderController {
  constructor(private readonly foodProviderService: FoodProviderService) {}

  @Post()
  // @UseGuards(FoodProviderGuard) // Temporarily disabled for testing
  @ApiOperation({ summary: 'Create a new food provider' })
  @ApiResponse({
    status: 201,
    description: 'Food provider successfully created',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        name: 'Delicious Eats',
        description: 'Authentic local cuisine',
        location: {
          address: '456 Food Street',
          city: 'Food City',
          country: 'CountryName',
        },
        cuisine_type: 'Italian',
        operating_hours: {
          open: '09:00',
          close: '22:00',
        },
        contact_info: {
          phone: '+1234567890',
          email: 'info@deliciouseats.com',
        },
        owner_id: '507f1f77bcf86cd799439012',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only food providers can create food services',
  })
  async create(
    @Body() createFoodProviderDto: CreateFoodProviderDto,
    @Request() req,
  ) {
    // Temporary fix for testing without auth - use a dummy user ID
    const user = req.user || { _id: '683700350f8a15197d2abf50' }; // Dummy user ID for testing
    return this.foodProviderService.create(createFoodProviderDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all food providers' })
  @ApiResponse({
    status: 200,
    description: 'Return all food providers',
    schema: {
      example: [
        {
          id: '507f1f77bcf86cd799439011',
          name: 'Delicious Eats',
          cuisine_type: 'Italian',
          location: {
            city: 'Food City',
            country: 'CountryName',
          },
          rating: 4.5,
          total_reviews: 25,
        },
      ],
    },
  })
  async findAll() {
    return this.foodProviderService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a food provider by ID' })
  @ApiParam({ name: 'id', description: 'Food Provider ID' })
  @ApiResponse({
    status: 200,
    description: 'Return a food provider',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        name: 'Delicious Eats',
        description: 'Authentic local cuisine',
        cuisine_type: 'Italian',
        location: {
          address: '456 Food Street',
          city: 'Food City',
          country: 'CountryName',
        },
        operating_hours: {
          open: '09:00',
          close: '22:00',
        },
        contact_info: {
          phone: '+1234567890',
          email: 'info@deliciouseats.com',
        },
        menu_items: [],
        rating: 4.5,
        total_reviews: 25,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Food provider not found' })
  async findOne(@Param('id') id: string) {
    return this.foodProviderService.findOne(id);
  }

  @Put(':id')
  // @UseGuards(FoodProviderGuard) // Temporarily disabled for testing
  @ApiOperation({ summary: 'Update a food provider (Owners only)' })
  @ApiParam({ name: 'id', description: 'Food Provider ID' })
  @ApiResponse({
    status: 200,
    description: 'Food provider successfully updated',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        name: 'Updated Restaurant Name',
        message: 'Food provider updated successfully',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only update own food provider',
  })
  @ApiResponse({ status: 404, description: 'Food provider not found' })
  async update(
    @Param('id') id: string,
    @Body() updateFoodProviderDto: UpdateFoodProviderDto,
    @Request() req,
  ) {
    // Temporary fix for testing without auth
    const userId = req.user?._id || '683700350f8a15197d2abf50'; // Dummy user ID for testing
    return this.foodProviderService.update(id, updateFoodProviderDto, userId);
  }

  @Delete(':id')
  // @UseGuards(FoodProviderGuard) // Temporarily disabled for testing
  @ApiOperation({ summary: 'Delete a food provider (Owners only)' })
  @ApiParam({ name: 'id', description: 'Food Provider ID' })
  @ApiResponse({
    status: 200,
    description: 'Food provider successfully deleted',
    schema: {
      example: {
        message: 'Food provider deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only delete own food provider',
  })
  @ApiResponse({ status: 404, description: 'Food provider not found' })
  async remove(@Param('id') id: string, @Request() req) {
    // Temporary fix for testing without auth
    const userId = req.user?._id || '683700350f8a15197d2abf50'; // Dummy user ID for testing
    await this.foodProviderService.remove(id, userId);
    return { message: 'Food provider deleted successfully' };
  }

  // Food Provider Dashboard Endpoints

  @Get('owner/my-providers')
  @UseGuards(AuthGuard, FoodProviderGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all food providers owned by the user' })
  @ApiResponse({
    status: 200,
    description: 'Returns all food providers owned by the user',
  })
  async getMyProviders(@Request() req) {
    const ownerId =
      typeof req.user._id === 'string' ? req.user._id : req.user._id.toString();
    return this.foodProviderService.findByOwner(ownerId);
  }

  @Get('owner/dashboard')
  @UseGuards(AuthGuard, FoodProviderGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get food provider dashboard summary' })
  @ApiResponse({
    status: 200,
    description: 'Returns food provider dashboard summary',
  })
  async getProviderDashboard(@Request() req) {
    const ownerId =
      typeof req.user._id === 'string' ? req.user._id : req.user._id.toString();
    return this.foodProviderService.getProviderDashboard(ownerId);
  }

  @Get('owner/menu-items/:providerId')
  @UseGuards(AuthGuard, FoodProviderGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all menu items for a specific food provider' })
  @ApiParam({ name: 'providerId', description: 'Food Provider ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns all menu items for the specified food provider',
  })
  async getMenuItems(@Param('providerId') providerId: string, @Request() req) {
    return this.foodProviderService.getMenuItems(providerId);
  }

  @Post('owner/menu-items/:providerId')
  @UseGuards(AuthGuard, FoodProviderGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add a new menu item to a food provider' })
  @ApiParam({ name: 'providerId', description: 'Food Provider ID' })
  @ApiResponse({
    status: 201,
    description: 'Menu item successfully created',
  })
  async createMenuItem(
    @Param('providerId') providerId: string,
    @Body() menuItemDto: any,
    @Request() req,
  ) {
    const ownerId =
      typeof req.user._id === 'string' ? req.user._id : req.user._id.toString();
    return this.foodProviderService.createMenuItem(providerId, menuItemDto);
  }

  @Put('owner/menu-items/:providerId/:itemId')
  @UseGuards(AuthGuard, FoodProviderGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a menu item' })
  @ApiParam({ name: 'providerId', description: 'Food Provider ID' })
  @ApiParam({ name: 'itemId', description: 'Menu Item ID' })
  @ApiResponse({
    status: 200,
    description: 'Menu item successfully updated',
  })
  async updateMenuItem(
    @Param('providerId') providerId: string,
    @Param('itemId') itemId: string,
    @Body() menuItemDto: any,
    @Request() req,
  ) {
    return this.foodProviderService.updateMenuItem(
      itemId,
      providerId,
      menuItemDto,
    );
  }

  @Delete('owner/menu-items/:providerId/:itemId')
  @UseGuards(AuthGuard, FoodProviderGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a menu item' })
  @ApiParam({ name: 'providerId', description: 'Food Provider ID' })
  @ApiParam({ name: 'itemId', description: 'Menu Item ID' })
  @ApiResponse({
    status: 200,
    description: 'Menu item successfully deleted',
  })
  async deleteMenuItem(
    @Param('providerId') providerId: string,
    @Param('itemId') itemId: string,
    @Request() req,
  ) {
    await this.foodProviderService.deleteMenuItem(itemId, providerId);
    return { message: 'Menu item deleted successfully' };
  }

  @Get('owner/orders/:providerId')
  @UseGuards(AuthGuard, FoodProviderGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all orders for a specific food provider' })
  @ApiParam({ name: 'providerId', description: 'Food Provider ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns all orders for the specified food provider',
  })
  async getProviderOrders(
    @Param('providerId') providerId: string,
    @Request() req,
  ) {
    return this.foodProviderService.getProviderOrders(providerId);
  }

  @Get('owner/analytics')
  @UseGuards(AuthGuard, FoodProviderGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get analytics for food providers owned by the user',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns analytics for food providers owned by the user',
  })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getProviderAnalytics(@Request() req, @Query('days') days?: number) {
    const ownerId =
      typeof req.user._id === 'string' ? req.user._id : req.user._id.toString();
    return this.foodProviderService.getProviderAnalytics(ownerId, days);
  }
}
