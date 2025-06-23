import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from '../services/admin.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RoleBasedAccessGuard } from '../../auth/guards/role-based-access.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('Admin Management')
@Controller('admin')
@UseGuards(JwtAuthGuard, RoleBasedAccessGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // User Management
  @Get('users')
  @Roles('admin')
  @ApiOperation({ summary: 'Get all users with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, enum: ['student', 'landlord', 'food_provider'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getAllUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllUsers({ page, limit, role, search });
  }

  @Get('users/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Put('users/:id/status')
  @Roles('admin')
  @ApiOperation({ summary: 'Update user status (activate/deactivate)' })
  @ApiResponse({ status: 200, description: 'User status updated successfully' })
  async updateUserStatus(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.adminService.updateUserStatus(id, body.isActive);
  }

  @Delete('users/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete user account' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  // Accommodation Management
  @Get('accommodations')
  @Roles('admin')
  @ApiOperation({ summary: 'Get all accommodations with filters' })
  @ApiResponse({ status: 200, description: 'Accommodations retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'pending'] })
  async getAllAccommodations(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.getAllAccommodations({ page, limit, status });
  }

  @Put('accommodations/:id/approve')
  @Roles('admin')
  @ApiOperation({ summary: 'Approve accommodation listing' })
  @ApiResponse({ status: 200, description: 'Accommodation approved successfully' })
  async approveAccommodation(@Param('id') id: string) {
    return this.adminService.approveAccommodation(id);
  }

  @Put('accommodations/:id/reject')
  @Roles('admin')
  @ApiOperation({ summary: 'Reject accommodation listing' })
  @ApiResponse({ status: 200, description: 'Accommodation rejected successfully' })
  async rejectAccommodation(
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    return this.adminService.rejectAccommodation(id, body.reason);
  }

  @Delete('accommodations/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete accommodation listing' })
  @ApiResponse({ status: 200, description: 'Accommodation deleted successfully' })
  async deleteAccommodation(@Param('id') id: string) {
    return this.adminService.deleteAccommodation(id);
  }

  // Food Service Management
  @Get('food-services')
  @Roles('admin')
  @ApiOperation({ summary: 'Get all food services with filters' })
  @ApiResponse({ status: 200, description: 'Food services retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'pending'] })
  async getAllFoodServices(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.getAllFoodServices({ page, limit, status });
  }

  @Put('food-services/:id/approve')
  @Roles('admin')
  @ApiOperation({ summary: 'Approve food service' })
  @ApiResponse({ status: 200, description: 'Food service approved successfully' })
  async approveFoodService(@Param('id') id: string) {
    return this.adminService.approveFoodService(id);
  }

  @Put('food-services/:id/reject')
  @Roles('admin')
  @ApiOperation({ summary: 'Reject food service' })
  @ApiResponse({ status: 200, description: 'Food service rejected successfully' })
  async rejectFoodService(
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    return this.adminService.rejectFoodService(id, body.reason);
  }

  // Booking Management
  @Get('bookings')
  @Roles('admin')
  @ApiOperation({ summary: 'Get all bookings with filters' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'confirmed', 'cancelled', 'completed'] })
  async getAllBookings(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.getAllBookings({ page, limit, status });
  }

  @Get('bookings/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get booking details by ID' })
  @ApiResponse({ status: 200, description: 'Booking retrieved successfully' })
  async getBookingById(@Param('id') id: string) {
    return this.adminService.getBookingById(id);
  }

  @Put('bookings/:id/cancel')
  @Roles('admin')
  @ApiOperation({ summary: 'Cancel booking (admin action)' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
  async cancelBooking(
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    return this.adminService.cancelBooking(id, body.reason);
  }

  // Order Management
  @Get('orders')
  @Roles('admin')
  @ApiOperation({ summary: 'Get all orders with filters' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'] })
  async getAllOrders(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.getAllOrders({ page, limit, status });
  }

  @Get('orders/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get order details by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  async getOrderById(@Param('id') id: string) {
    return this.adminService.getOrderById(id);
  }

  // Analytics and Reports
  @Get('analytics/dashboard')
  @Roles('admin')
  @ApiOperation({ summary: 'Get admin dashboard analytics' })
  @ApiResponse({ status: 200, description: 'Dashboard analytics retrieved successfully' })
  async getDashboardAnalytics() {
    return this.adminService.getDashboardAnalytics();
  }

  @Get('analytics/users')
  @Roles('admin')
  @ApiOperation({ summary: 'Get user analytics' })
  @ApiResponse({ status: 200, description: 'User analytics retrieved successfully' })
  @ApiQuery({ name: 'period', required: false, enum: ['day', 'week', 'month', 'year'] })
  async getUserAnalytics(@Query('period') period?: string) {
    return this.adminService.getUserAnalytics(period || 'month');
  }

  @Get('analytics/revenue')
  @Roles('admin')
  @ApiOperation({ summary: 'Get revenue analytics' })
  @ApiResponse({ status: 200, description: 'Revenue analytics retrieved successfully' })
  @ApiQuery({ name: 'period', required: false, enum: ['day', 'week', 'month', 'year'] })
  async getRevenueAnalytics(@Query('period') period?: string) {
    return this.adminService.getRevenueAnalytics(period || 'month');
  }

  @Get('analytics/bookings')
  @Roles('admin')
  @ApiOperation({ summary: 'Get booking analytics' })
  @ApiResponse({ status: 200, description: 'Booking analytics retrieved successfully' })
  @ApiQuery({ name: 'period', required: false, enum: ['day', 'week', 'month', 'year'] })
  async getBookingAnalytics(@Query('period') period?: string) {
    return this.adminService.getBookingAnalytics(period || 'month');
  }

  // Reports
  @Get('reports/users')
  @Roles('admin')
  @ApiOperation({ summary: 'Generate users report' })
  @ApiResponse({ status: 200, description: 'Users report generated successfully' })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv'] })
  async generateUsersReport(@Query('format') format?: string) {
    return this.adminService.generateUsersReport(format || 'json');
  }

  @Get('reports/revenue')
  @Roles('admin')
  @ApiOperation({ summary: 'Generate revenue report' })
  @ApiResponse({ status: 200, description: 'Revenue report generated successfully' })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv'] })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async generateRevenueReport(
    @Query('format') format?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.generateRevenueReport({
      format: format || 'json',
      startDate,
      endDate,
    });
  }

  // System Management
  @Get('system/health')
  @Roles('admin')
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({ status: 200, description: 'System health retrieved successfully' })
  async getSystemHealth() {
    return this.adminService.getSystemHealth();
  }

  @Post('system/backup')
  @Roles('admin')
  @ApiOperation({ summary: 'Create system backup' })
  @ApiResponse({ status: 200, description: 'System backup created successfully' })
  async createSystemBackup() {
    return this.adminService.createSystemBackup();
  }

  @Get('system/logs')
  @Roles('admin')
  @ApiOperation({ summary: 'Get system logs' })
  @ApiResponse({ status: 200, description: 'System logs retrieved successfully' })
  @ApiQuery({ name: 'level', required: false, enum: ['error', 'warn', 'info', 'debug'] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getSystemLogs(
    @Query('level') level?: string,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getSystemLogs({ level, limit });
  }

  // Configuration Management
  @Get('config/platform')
  @Roles('admin')
  @ApiOperation({ summary: 'Get platform configuration' })
  @ApiResponse({ status: 200, description: 'Platform configuration retrieved successfully' })
  async getPlatformConfig() {
    return this.adminService.getPlatformConfig();
  }

  @Put('config/platform')
  @Roles('admin')
  @ApiOperation({ summary: 'Update platform configuration' })
  @ApiResponse({ status: 200, description: 'Platform configuration updated successfully' })
  async updatePlatformConfig(@Body() config: any) {
    return this.adminService.updatePlatformConfig(config);
  }

  // Notification Management
  @Post('notifications/broadcast')
  @Roles('admin')
  @ApiOperation({ summary: 'Send broadcast notification to all users' })
  @ApiResponse({ status: 200, description: 'Broadcast notification sent successfully' })
  async sendBroadcastNotification(
    @Body() body: { title: string; message: string; type: string },
  ) {
    return this.adminService.sendBroadcastNotification(body);
  }

  @Post('notifications/targeted')
  @Roles('admin')
  @ApiOperation({ summary: 'Send targeted notification to specific users' })
  @ApiResponse({ status: 200, description: 'Targeted notification sent successfully' })
  async sendTargetedNotification(
    @Body() body: { 
      title: string; 
      message: string; 
      type: string; 
      userIds: string[]; 
      role?: string;
    },
  ) {
    return this.adminService.sendTargetedNotification(body);
  }
}
