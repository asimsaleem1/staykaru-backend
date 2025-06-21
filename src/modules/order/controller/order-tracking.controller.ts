import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { OrderTrackingService } from '../services/order-tracking.service';
import {
  UpdateOrderLocationDto,
  SetDeliveryLocationDto,
  OptimizeRouteDto,
} from '../dto/order-tracking.dto';

@ApiTags('order-tracking')
@Controller('order-tracking')
export class OrderTrackingController {
  constructor(private readonly orderTrackingService: OrderTrackingService) {}

  @Put('location')
  @ApiOperation({
    summary: 'Update order location and status',
    description:
      'Update the current location of an order and optionally change its status for real-time tracking.',
  })
  @ApiResponse({
    status: 200,
    description: 'Order location updated successfully',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        status: 'out_for_delivery',
        current_location: {
          latitude: 24.8607,
          longitude: 67.0011,
        },
        delivery_location: {
          coordinates: {
            latitude: 24.8615,
            longitude: 67.0021,
          },
          address: 'House #123, Block A, Gulshan-e-Iqbal, Karachi',
        },
        estimated_delivery_time: '2025-06-21T13:30:00.000Z',
        tracking_history: [
          {
            location: {
              latitude: 24.8607,
              longitude: 67.0011,
            },
            status: 'out_for_delivery',
            timestamp: '2025-06-21T13:00:00.000Z',
            notes: 'Driver picked up the order',
          },
        ],
      },
    },
  })
  async updateOrderLocation(@Body() updateLocationDto: UpdateOrderLocationDto) {
    return this.orderTrackingService.updateOrderLocation(
      updateLocationDto.orderId,
      updateLocationDto.location,
      updateLocationDto.status,
      updateLocationDto.notes,
    );
  }

  @Get(':orderId/tracking')
  @ApiOperation({
    summary: 'Get real-time tracking information',
    description:
      'Get comprehensive tracking information for an order including current location, route, and estimated delivery time.',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order ID to track',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Tracking information retrieved successfully',
    schema: {
      example: {
        orderId: '507f1f77bcf86cd799439011',
        currentLocation: {
          latitude: 24.8607,
          longitude: 67.0011,
        },
        status: 'out_for_delivery',
        deliveryLocation: {
          latitude: 24.8615,
          longitude: 67.0021,
        },
        estimatedArrival: '2025-06-21T13:30:00.000Z',
        distance: '1.5 km',
        duration: '8 mins',
        trackingHistory: [
          {
            location: {
              latitude: 24.86,
              longitude: 67.001,
            },
            status: 'preparing',
            timestamp: '2025-06-21T12:45:00.000Z',
          },
        ],
      },
    },
  })
  async getTrackingInfo(@Param('orderId') orderId: string) {
    return this.orderTrackingService.getTrackingInfo(orderId);
  }

  @Post('delivery-location')
  @ApiOperation({
    summary: 'Set delivery location for order',
    description:
      'Set the delivery location coordinates and address for an order to enable tracking.',
  })
  @ApiResponse({
    status: 200,
    description: 'Delivery location set successfully',
  })
  async setDeliveryLocation(
    @Body() setDeliveryLocationDto: SetDeliveryLocationDto,
  ) {
    return this.orderTrackingService.setDeliveryLocation(
      setDeliveryLocationDto.orderId,
      setDeliveryLocationDto.coordinates,
      setDeliveryLocationDto.address,
      setDeliveryLocationDto.landmark,
    );
  }

  @Get('active-deliveries')
  @ApiOperation({
    summary: 'Get all active deliveries',
    description:
      'Get a list of all orders that are currently being prepared or out for delivery.',
  })
  @ApiResponse({
    status: 200,
    description: 'Active deliveries retrieved successfully',
    schema: {
      example: [
        {
          _id: '507f1f77bcf86cd799439011',
          status: 'out_for_delivery',
          current_location: {
            latitude: 24.8607,
            longitude: 67.0011,
          },
          delivery_location: {
            coordinates: {
              latitude: 24.8615,
              longitude: 67.0021,
            },
            address: 'House #123, Block A, Gulshan-e-Iqbal, Karachi',
          },
          user: {
            name: 'John Doe',
            phone: '+92300XXXXXXX',
          },
          food_provider: {
            name: 'Pizza Palace',
          },
        },
      ],
    },
  })
  async getActiveDeliveries() {
    return this.orderTrackingService.getActiveDeliveries();
  }

  @Get(':orderId/history')
  @ApiOperation({
    summary: 'Get delivery history for order',
    description:
      'Get the complete tracking history showing all location updates for an order.',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Delivery history retrieved successfully',
    schema: {
      example: [
        {
          location: {
            latitude: 24.86,
            longitude: 67.001,
          },
          status: 'placed',
          timestamp: '2025-06-21T12:30:00.000Z',
          notes: 'Order placed',
        },
        {
          location: {
            latitude: 24.8605,
            longitude: 67.0015,
          },
          status: 'preparing',
          timestamp: '2025-06-21T12:45:00.000Z',
          notes: 'Order is being prepared',
        },
      ],
    },
  })
  async getDeliveryHistory(@Param('orderId') orderId: string) {
    return this.orderTrackingService.getDeliveryHistory(orderId);
  }

  @Post('optimize-route')
  @ApiOperation({
    summary: 'Optimize delivery route for multiple orders',
    description:
      'Calculate the optimal route for delivering multiple orders to minimize travel time and distance.',
  })
  @ApiResponse({
    status: 200,
    description: 'Route optimized successfully',
    schema: {
      example: {
        totalRoutes: 3,
        totalDistance: 12.5,
        totalDuration: 35,
        routes: [
          {
            from: {
              latitude: 24.86,
              longitude: 67.001,
            },
            to: {
              latitude: 24.8615,
              longitude: 67.0021,
            },
            distance: '1.5 km',
            duration: '8 mins',
            polyline: 'encoded_polyline_string',
          },
        ],
      },
    },
  })
  async optimizeRoute(
    @Body() optimizeRouteDto: OptimizeRouteDto,
  ): Promise<any> {
    return this.orderTrackingService.optimizeDeliveryRoute(
      optimizeRouteDto.startLocation,
      optimizeRouteDto.deliveryLocations,
    );
  }
}
