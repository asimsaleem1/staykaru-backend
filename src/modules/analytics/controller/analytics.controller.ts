import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../user/guards/roles.guard';
import { Roles } from '../../user/decorators/roles.decorator';
import { UserRole } from '../../user/schema/user.schema';
import { AnalyticsService } from '../services/analytics.service';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('bookings')
  @ApiOperation({ summary: 'Get booking analytics' })
  @ApiResponse({ status: 200, description: 'Return booking analytics data' })
  async getBookingAnalytics(
    @Query('days', ParseIntPipe) days?: number,
  ) {
    try {
      return await this.analyticsService.getAnalytics('booking', days);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get order analytics' })
  @ApiResponse({ status: 200, description: 'Return order analytics data' })
  async getOrderAnalytics(
    @Query('days', ParseIntPipe) days?: number,
  ) {
    try {
      return await this.analyticsService.getAnalytics('order', days);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('payments')
  @ApiOperation({ summary: 'Get payment analytics' })
  @ApiResponse({ status: 200, description: 'Return payment analytics data' })
  async getPaymentAnalytics(
    @Query('days', ParseIntPipe) days?: number,
  ) {
    try {
      return await this.analyticsService.getAnalytics('payment', days);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}