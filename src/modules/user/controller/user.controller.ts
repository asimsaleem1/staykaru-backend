import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../schema/user.schema';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { AuthenticatedRequest } from '../../../interfaces/request.interface';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Helper method to safely extract user ID
  private getUserId(req: AuthenticatedRequest): string {
    const userId = req.user._id;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return String(userId);
  }

  // Admin endpoints for user management
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Returns all users',
  })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @ApiQuery({ name: 'search', required: false })
  async getAllUsers(
    @Query('role') role?: UserRole,
    @Query('search') search?: string,
  ) {
    return this.userService.findAll(role, search);
  }

  @Get('admin/count')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user count by role (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Returns user counts by role',
  })
  async getUserCounts(): Promise<any> {
    return this.userService.getUserCounts();
  }

  @Put('admin/:id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user role (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User role updated successfully',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  async updateUserRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.userService.updateUserRole(id, role);
  }

  @Put('admin/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user status (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User status updated successfully',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  async updateUserStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.userService.updateUserStatus(id, isActive);
  }

  @Put('admin/:id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Deactivate user account (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User account deactivated successfully',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  async deactivateUser(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const adminId = req.user._id;
    return this.userService.deactivateUser(id, reason, adminId);
  }

  @Put('admin/:id/reactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Reactivate user account (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User account reactivated successfully',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  async reactivateUser(@Param('id') id: string) {
    return this.userService.reactivateUser(id);
  }

  @Get('admin/:id/activity-log')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user activity log (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Returns user activity history',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  async getUserActivityLog(@Param('id') id: string) {
    return this.userService.getUserActivityLog(id);
  }

  @Get('admin/security/suspicious')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get users with suspicious activity (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Returns users flagged for suspicious activity',
  })
  async getSuspiciousUsers() {
    return this.userService.getSuspiciousUsers();
  }

  // Standard user endpoints
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'student',
        phone: '+1234567890',
        address: '123 Main St',
        created_at: '2025-05-28T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @Roles(UserRole.ADMIN)
  async create(@Body() createUserDto: CreateUserDto): Promise<any> {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Return all users',
    schema: {
      example: [
        {
          id: '507f1f77bcf86cd799439011',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'student',
          created_at: '2025-05-28T10:00:00.000Z',
        },
      ],
    },
  })
  async findAll(): Promise<any> {
    return this.userService.findAll();
  }

  // Food Provider profile endpoints
  @Get('food-provider/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get food provider profile' })
  @ApiResponse({
    status: 200,
    description: 'Food provider profile retrieved successfully',
  })
  async getFoodProviderProfile(
    @Request() req: AuthenticatedRequest,
  ): Promise<any> {
    return this.userService.getUserProfile(this.getUserId(req));
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  async getUserProfile(@Request() req: AuthenticatedRequest): Promise<any> {
    return this.userService.getUserProfile(this.getUserId(req));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Return a user',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'student',
        phone: '+1234567890',
        address: '123 Main St',
        created_at: '2025-05-28T10:00:00.000Z',
        updated_at: '2025-05-28T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string): Promise<any> {
    return this.userService.findOne(id);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
  })
  async updateUserProfile(
    @Request() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<any> {
    return this.userService.updateUserProfile(
      this.getUserId(req),
      updateUserDto,
    );
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Partially update user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
  })
  async patchUserProfile(
    @Request() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<any> {
    return this.userService.updateUserProfile(req.user._id, updateUserDto);
  }

  // Change password endpoint
  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid old password',
  })
  async changePassword(
    @Request() req: AuthenticatedRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<any> {
    return this.userService.changePassword(req.user._id, changePasswordDto);
  }

  @Post('fcm-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update FCM token for notifications' })
  @ApiResponse({
    status: 200,
    description: 'FCM token updated successfully',
  })
  async updateFcmToken(
    @Request() req: AuthenticatedRequest,
    @Body('fcmToken') fcmToken: string,
  ): Promise<any> {
    return this.userService.updateFcmToken(this.getUserId(req), fcmToken);
  }

  // Landlord specific endpoints
  @Get('landlord/bookings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get landlord bookings' })
  @ApiResponse({
    status: 200,
    description: 'Returns landlord bookings',
  })
  async getLandlordBookings(
    @Request() req: AuthenticatedRequest,
  ): Promise<any> {
    const landlordId = req.user._id;
    return this.userService.getLandlordBookings(landlordId);
  }

  @Get('landlord/statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get landlord booking statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns landlord booking statistics',
  })
  async getLandlordStatistics(
    @Request() req: AuthenticatedRequest,
  ): Promise<any> {
    const landlordId = req.user._id;
    return this.userService.getLandlordStatistics(landlordId);
  }

  @Get('landlord/revenue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get landlord revenue analytics' })
  @ApiResponse({
    status: 200,
    description: 'Returns landlord revenue analytics',
  })
  async getLandlordRevenue(@Request() req: AuthenticatedRequest): Promise<any> {
    const landlordId = req.user._id;
    return this.userService.getLandlordRevenue(landlordId);
  }

  @Get('landlord/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get landlord profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns landlord profile',
  })
  async getLandlordProfile(@Request() req: AuthenticatedRequest): Promise<any> {
    const landlordId = req.user._id;
    return this.userService.getLandlordProfile(landlordId);
  }

  @Post('landlord/fcm-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update FCM token for landlord' })
  @ApiResponse({
    status: 200,
    description: 'FCM token updated successfully',
  })
  async updateLandlordFcmToken(
    @Request() req: AuthenticatedRequest,
    @Body() body: { fcmToken: string },
  ): Promise<any> {
    const landlordId = req.user._id;
    return this.userService.updateFcmToken(landlordId, body.fcmToken);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get student dashboard summary' })
  @ApiResponse({
    status: 200,
    description: 'Returns the student dashboard summary',
    schema: {
      example: {
        totalBookings: 10,
        totalOrders: 5,
        activeBookings: 2,
        pendingOrders: 1,
        recentTransactions: [],
      },
    },
  })
  async getDashboard(@Request() req: AuthenticatedRequest): Promise<any> {
    const userId = this.getUserId(req);
    return this.userService.getDashboardSummary(userId);
  }

  @Get('analytics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get student analytics data' })
  @ApiResponse({
    status: 200,
    description: 'Returns the student analytics data',
    schema: {
      example: {
        monthlySpending: {
          accommodation: 1000,
          food: 500,
        },
        accommodationSpending: [
          { month: 'January', amount: 500 },
          { month: 'February', amount: 500 },
        ],
        foodSpending: [
          { month: 'January', amount: 250 },
          { month: 'February', amount: 250 },
        ],
      },
    },
  })
  async getAnalytics(@Request() req: AuthenticatedRequest): Promise<any> {
    const userId = this.getUserId(req);
    return this.userService.getAnalytics(userId);
  }

  @Post('notifications/clear')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Clear all notifications for user' })
  @ApiResponse({
    status: 200,
    description: 'Notifications cleared successfully',
  })
  async clearNotifications(@Request() req: AuthenticatedRequest): Promise<any> {
    return await this.userService.clearNotifications(this.getUserId(req));
  }
}
