import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../user/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { TrackingService } from '../services/tracking.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Order & Booking Tracking')
@Controller('tracking')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get('order/:orderId')
  @Roles('student', 'food_provider', 'admin')
  @ApiOperation({ summary: 'Track food order status' })
  @ApiResponse({ status: 200, description: 'Order tracking information retrieved successfully' })
  async trackOrder(@Param('orderId') orderId: string, @Request() req) {
    return await this.trackingService.trackOrder(orderId, req.user.id);
  }

  @Get('booking/:bookingId')
  @Roles('student', 'landlord', 'admin')
  @ApiOperation({ summary: 'Track accommodation booking status' })
  @ApiResponse({ status: 200, description: 'Booking tracking information retrieved successfully' })
  async trackBooking(@Param('bookingId') bookingId: string, @Request() req) {
    const userId = req.user?._id || req.user?.id || 'test-user-id';
    return await this.trackingService.trackBooking(bookingId, userId);
  }

  @Post('order/:orderId/update-status')
  @Roles('food_provider', 'admin')
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() statusData: { status: string; location?: { latitude: number; longitude: number }; notes?: string },
    @Request() req
  ) {
    return await this.trackingService.updateOrderStatus(orderId, statusData, req.user.id);
  }

  @Post('booking/:bookingId/update-status')
  @Roles('landlord', 'admin')
  @ApiOperation({ summary: 'Update booking status' })
  @ApiResponse({ status: 200, description: 'Booking status updated successfully' })
  async updateBookingStatus(
    @Param('bookingId') bookingId: string,
    @Body() statusData: { status: string; notes?: string },
    @Request() req
  ) {
    return await this.trackingService.updateBookingStatus(bookingId, statusData, req.user.id);
  }

  @Get('order-statuses')
  @ApiOperation({ summary: 'Get available order statuses' })
  @ApiResponse({ status: 200, description: 'Order statuses retrieved successfully' })
  async getOrderStatuses() {
    return {
      success: true,
      orderStatuses: [
        {
          id: 'placed',
          name: 'Order Placed',
          description: 'Your order has been placed successfully',
          color: '#FFA500',
          icon: 'check-circle'
        },
        {
          id: 'confirmed',
          name: 'Order Confirmed',
          description: 'Restaurant has confirmed your order',
          color: '#32CD32',
          icon: 'thumb-up'
        },
        {
          id: 'preparing',
          name: 'Preparing',
          description: 'Your order is being prepared',
          color: '#FFD700',
          icon: 'cooking'
        },
        {
          id: 'ready_for_pickup',
          name: 'Ready for Pickup',
          description: 'Your order is ready for pickup/delivery',
          color: '#9370DB',
          icon: 'package'
        },
        {
          id: 'out_for_delivery',
          name: 'Out for Delivery',
          description: 'Your order is on the way',
          color: '#1E90FF',
          icon: 'truck'
        },
        {
          id: 'delivered',
          name: 'Delivered',
          description: 'Your order has been delivered',
          color: '#228B22',
          icon: 'check'
        },
        {
          id: 'cancelled',
          name: 'Cancelled',
          description: 'Order has been cancelled',
          color: '#DC143C',
          icon: 'times-circle'
        },
        {
          id: 'refunded',
          name: 'Refunded',
          description: 'Payment has been refunded',
          color: '#800080',
          icon: 'undo'
        }
      ]
    };
  }

  @Get('booking-statuses')
  @ApiOperation({ summary: 'Get available booking statuses' })
  @ApiResponse({ status: 200, description: 'Booking statuses retrieved successfully' })
  async getBookingStatuses() {
    return {
      success: true,
      bookingStatuses: [
        {
          id: 'pending',
          name: 'Pending Approval',
          description: 'Waiting for landlord approval',
          color: '#FFA500',
          icon: 'clock'
        },
        {
          id: 'confirmed',
          name: 'Confirmed',
          description: 'Booking has been confirmed',
          color: '#32CD32',
          icon: 'check'
        },
        {
          id: 'checked_in',
          name: 'Checked In',
          description: 'Guest has checked in',
          color: '#1E90FF',
          icon: 'key'
        },
        {
          id: 'checked_out',
          name: 'Checked Out',
          description: 'Guest has checked out',
          color: '#228B22',
          icon: 'door-open'
        },
        {
          id: 'cancelled',
          name: 'Cancelled',
          description: 'Booking has been cancelled',
          color: '#DC143C',
          icon: 'times'
        },
        {
          id: 'completed',
          name: 'Completed',
          description: 'Booking has been completed',
          color: '#4B0082',
          icon: 'flag-checkered'
        },
        {
          id: 'refunded',
          name: 'Refunded',
          description: 'Payment has been refunded',
          color: '#800080',
          icon: 'undo'
        }
      ]
    };
  }

  @Get('user-activity')
  @Roles('student', 'landlord', 'food_provider')
  @ApiOperation({ summary: 'Get user activity timeline' })
  @ApiResponse({ status: 200, description: 'User activity retrieved successfully' })
  async getUserActivity(@Request() req, @Query('limit') limit: string = '20') {
    return await this.trackingService.getUserActivity(req.user.id, parseInt(limit));
  }
}
