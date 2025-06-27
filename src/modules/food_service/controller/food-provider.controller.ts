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
import { MenuItemService } from '../services/menu-item.service';
import { CreateFoodProviderDto } from '../dto/create-food-provider.dto';
import { UpdateFoodProviderDto } from '../dto/update-food-provider.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { FoodProviderGuard } from '../guards/food-provider.guard';
import { RolesGuard } from '../../user/guards/roles.guard';
import { Roles } from '../../user/decorators/roles.decorator';
import { UserRole } from '../../user/schema/user.schema';

interface RequestWithUser extends Request {
  user?: {
    _id: string | { toString(): string };
    id?: string;
    email: string;
    role: string;
    [key: string]: any;
  };
}

@ApiTags('food-providers')
@Controller('food-providers')
// @UseGuards(AuthGuard) // Temporarily disabled for testing
// @ApiBearerAuth('JWT-auth') // Temporarily disabled for testing
export class FoodProviderController {
  constructor(
    private readonly foodProviderService: FoodProviderService,
    private readonly menuItemService: MenuItemService,
  ) {}

  // Helper method to safely extract user ID
  private getUserId(req: any): string {
    return req.user._id ? req.user._id.toString() : req.user.id.toString();
  }

  @Post()
  @UseGuards(JwtAuthGuard, FoodProviderGuard)
  @ApiBearerAuth('JWT-auth')
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
    return this.foodProviderService.create(createFoodProviderDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all food providers with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 50, max: 100)' })
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
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50'
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    return this.foodProviderService.findAll(pageNum, limitNum);
  }

  @Get('owner/my-providers')
  @UseGuards(JwtAuthGuard, FoodProviderGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all food providers owned by the user' })
  @ApiResponse({
    status: 200,
    description: 'Returns all food providers owned by the user',
  })
  async getMyProviders(@Request() req) {
    const ownerId = this.getUserId(req);
    return this.foodProviderService.findByOwner(ownerId);
  }

  @Get('owner/dashboard')
  @UseGuards(JwtAuthGuard, FoodProviderGuard)
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

  @Get('analytics')
  @UseGuards(JwtAuthGuard, FoodProviderGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get food provider analytics' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days for analytics' })
  @ApiResponse({
    status: 200,
    description: 'Returns food provider analytics',
  })
  async getAnalytics(@Request() req, @Query('days') days?: number) {
    const ownerId = this.getUserId(req);
    return this.foodProviderService.getProviderAnalytics(ownerId, days);
  }

  @Get('orders')
  @UseGuards(JwtAuthGuard, FoodProviderGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get food provider orders' })
  @ApiResponse({
    status: 200,
    description: 'Returns food provider orders',
  })
  async getOrders(@Request() req) {
    const ownerId = this.getUserId(req);
    // Get the first provider for this owner
    const providers = await this.foodProviderService.findByOwner(ownerId);
    if (providers.length === 0) {
      return [];
    }
    return this.foodProviderService.getProviderOrders(providers[0]._id.toString());
  }

  @Get('owner/menu-items/:providerId')
  @UseGuards(JwtAuthGuard, FoodProviderGuard)
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
  @UseGuards(JwtAuthGuard, FoodProviderGuard)
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
    console.log(
      `\n[CREATE_MENU_ITEM] Creating menu item for provider ${providerId}`,
    );
    console.log(`[CREATE_MENU_ITEM] User:`, this.getUserId(req));
    console.log(`[CREATE_MENU_ITEM] DTO:`, menuItemDto);

    try {
      // Add provider ID to the DTO
      const menuItemDtoWithProvider = {
        ...menuItemDto,
        provider: providerId,
      };

      const result = await this.menuItemService.create(
        menuItemDtoWithProvider,
        this.getUserId(req),
      );
      console.log(`[CREATE_MENU_ITEM] Success:`, result._id);
      return result;
    } catch (error) {
      console.error(`[CREATE_MENU_ITEM] Error:`, error.message);
      throw error;
    }
  }

  @Put('owner/menu-items/:providerId/:itemId')
  @UseGuards(JwtAuthGuard, FoodProviderGuard)
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
  @UseGuards(JwtAuthGuard, FoodProviderGuard)
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

  @Get('admin/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all pending food providers for admin approval',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all pending food providers',
  })
  async getPendingFoodProviders() {
    return this.foodProviderService.getPendingFoodProviders();
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all food providers with approval status (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all food providers with detailed admin info',
  })
  async getAllFoodProvidersAdmin() {
    return this.foodProviderService.getAllForAdmin();
  }

  @Put('admin/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Approve a food provider (Admin only)' })
  @ApiParam({ name: 'id', description: 'Food Provider ID' })
  @ApiResponse({
    status: 200,
    description: 'Food provider approved successfully',
  })
  async approveFoodProvider(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ) {
    const adminId =
      typeof req.user._id === 'string' ? req.user._id : req.user._id.toString();
    return this.foodProviderService.approveFoodProvider(id, adminId);
  }

  @Put('admin/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Reject a food provider (Admin only)' })
  @ApiParam({ name: 'id', description: 'Food Provider ID' })
  @ApiResponse({
    status: 200,
    description: 'Food provider rejected successfully',
  })
  async rejectFoodProvider(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req: RequestWithUser,
  ) {
    const adminId =
      typeof req.user._id === 'string' ? req.user._id : req.user._id.toString();
    return this.foodProviderService.rejectFoodProvider(id, reason, adminId);
  }

  @Put('admin/:id/toggle-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle food provider active status (Admin only)' })
  @ApiParam({ name: 'id', description: 'Food Provider ID' })
  @ApiResponse({
    status: 200,
    description: 'Food provider status toggled successfully',
  })
  async toggleFoodProviderStatus(@Param('id') id: string) {
    return this.foodProviderService.toggleActiveStatus(id);
  }

  @Get('admin/:id/details')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get food provider details for admin review' })
  @ApiParam({ name: 'id', description: 'Food Provider ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns detailed food provider info for admin review',
  })
  async getFoodProviderForAdmin(@Param('id') id: string) {
    return this.foodProviderService.getFoodProviderForAdmin(id);
  }

  @Get('admin/menu-items/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all pending menu items for admin approval' })
  @ApiResponse({
    status: 200,
    description: 'Returns all pending menu items',
  })
  async getPendingMenuItems() {
    return this.foodProviderService.getPendingMenuItems();
  }

  @Put('admin/menu-items/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Approve a menu item (Admin only)' })
  @ApiParam({ name: 'id', description: 'Menu Item ID' })
  @ApiResponse({
    status: 200,
    description: 'Menu item approved successfully',
  })
  async approveMenuItem(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ) {
    const adminId =
      typeof req.user._id === 'string' ? req.user._id : req.user._id.toString();
    return this.foodProviderService.approveMenuItem(id, adminId);
  }

  @Put('admin/menu-items/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Reject a menu item (Admin only)' })
  @ApiParam({ name: 'id', description: 'Menu Item ID' })
  @ApiResponse({
    status: 200,
    description: 'Menu item rejected successfully',
  })
  async rejectMenuItem(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req: RequestWithUser,
  ) {
    const adminId =
      typeof req.user._id === 'string' ? req.user._id : req.user._id.toString();
    return this.foodProviderService.rejectMenuItem(id, reason, adminId);
  }

  @Put('admin/menu-items/:id/toggle-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle menu item active status (Admin only)' })
  @ApiParam({ name: 'id', description: 'Menu Item ID' })
  @ApiResponse({
    status: 200,
    description: 'Menu item status toggled successfully',
  })
  async toggleMenuItemStatus(@Param('id') id: string) {
    return this.foodProviderService.toggleMenuItemStatus(id);
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
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
    const userId = this.getUserId(req);
    return this.foodProviderService.update(id, updateFoodProviderDto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
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
    const userId = this.getUserId(req);
    await this.foodProviderService.remove(id, userId);
    return { message: 'Food provider deleted successfully' };
  }
}
