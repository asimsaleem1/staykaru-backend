import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderStatus, TrackingHistory } from '../schema/order.schema';
import { MapService } from '../../location/services/map.service';

export interface LocationUpdate {
  latitude: number;
  longitude: number;
}

export interface TrackingInfo {
  orderId: string;
  currentLocation: LocationUpdate;
  status: OrderStatus;
  deliveryLocation: LocationUpdate;
  estimatedArrival?: string;
  distance?: string;
  duration?: string;
  trackingHistory: TrackingHistory[];
}

@Injectable()
export class OrderTrackingService {
  private readonly logger = new Logger(OrderTrackingService.name);

  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    private readonly mapService: MapService,
  ) {}

  /**
   * Update order location and status
   */
  async updateOrderLocation(
    orderId: string,
    location: LocationUpdate,
    status?: OrderStatus,
    notes?: string,
  ): Promise<Order> {
    try {
      const order = await this.orderModel.findById(orderId);
      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }

      // Update current location
      order.current_location = {
        latitude: location.latitude,
        longitude: location.longitude,
      };

      // Add to tracking history
      const trackingEntry: TrackingHistory = {
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        status: status || order.status,
        timestamp: new Date(),
        notes,
      };

      order.tracking_history.push(trackingEntry);

      // Update status if provided
      if (status) {
        order.status = status;
      }

      // Calculate estimated delivery time if delivery location exists
      if (order.delivery_location && status === OrderStatus.OUT_FOR_DELIVERY) {
        try {
          const estimatedArrival = await this.mapService.getEstimatedArrival(
            location,
            order.delivery_location.coordinates,
            'driving',
          );
          order.estimated_delivery_time = new Date(estimatedArrival);
        } catch (error) {
          this.logger.warn('Could not calculate estimated delivery time', error);
        }
      }

      await order.save();
      return order;
    } catch (error) {
      this.logger.error('Error updating order location', error);
      throw new Error('Failed to update order location');
    }
  }

  /**
   * Get real-time tracking information for an order
   */
  async getTrackingInfo(orderId: string): Promise<TrackingInfo> {
    try {
      const order = await this.orderModel
        .findById(orderId)
        .populate('user food_provider')
        .exec();

      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }

      const trackingInfo: TrackingInfo = {
        orderId: order._id.toString(),
        currentLocation: order.current_location || null,
        status: order.status,
        deliveryLocation: order.delivery_location?.coordinates || null,
        trackingHistory: order.tracking_history || [],
      };

      // Calculate route information if both locations are available
      if (order.current_location && order.delivery_location) {
        try {
          const route = await this.mapService.getRoute(
            order.current_location,
            order.delivery_location.coordinates,
            'driving',
          );
          trackingInfo.distance = route.distance;
          trackingInfo.duration = route.duration;

          // Update estimated arrival
          const estimatedArrival = await this.mapService.getEstimatedArrival(
            order.current_location,
            order.delivery_location.coordinates,
            'driving',
          );
          trackingInfo.estimatedArrival = estimatedArrival;
        } catch (error) {
          this.logger.warn('Could not calculate route information', error);
        }
      }

      return trackingInfo;
    } catch (error) {
      this.logger.error('Error getting tracking info', error);
      throw new Error('Failed to get tracking information');
    }
  }

  /**
   * Get all orders that are currently being tracked
   */
  async getActiveDeliveries(): Promise<Order[]> {
    try {
      return await this.orderModel
        .find({
          status: { $in: [OrderStatus.PREPARING, OrderStatus.OUT_FOR_DELIVERY] },
        })
        .populate('user food_provider')
        .exec();
    } catch (error) {
      this.logger.error('Error getting active deliveries', error);
      throw new Error('Failed to get active deliveries');
    }
  }

  /**
   * Set delivery location for an order
   */
  async setDeliveryLocation(
    orderId: string,
    coordinates: LocationUpdate,
    address: string,
    landmark?: string,
  ): Promise<Order> {
    try {
      const order = await this.orderModel.findById(orderId);
      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }

      order.delivery_location = {
        coordinates: {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        },
        address,
        landmark,
      };

      await order.save();
      return order;
    } catch (error) {
      this.logger.error('Error setting delivery location', error);
      throw new Error('Failed to set delivery location');
    }
  }

  /**
   * Get delivery history for a specific order
   */
  async getDeliveryHistory(orderId: string): Promise<TrackingHistory[]> {
    try {
      const order = await this.orderModel.findById(orderId);
      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }

      return order.tracking_history || [];
    } catch (error) {
      this.logger.error('Error getting delivery history', error);
      throw new Error('Failed to get delivery history');
    }
  }

  /**
   * Calculate optimal route for multiple deliveries
   */
  async optimizeDeliveryRoute(
    startLocation: LocationUpdate,
    deliveryLocations: LocationUpdate[],
  ): Promise<any> {
    try {
      // This is a simplified implementation
      // In a real-world scenario, you'd use more sophisticated algorithms
      const routes = [];

      for (let i = 0; i < deliveryLocations.length; i++) {
        const from = i === 0 ? startLocation : deliveryLocations[i - 1];
        const to = deliveryLocations[i];

        const route = await this.mapService.getRoute(from, to, 'driving');
        routes.push({
          from,
          to,
          ...route,
        });
      }

      return {
        totalRoutes: routes.length,
        routes,
        totalDistance: routes.reduce((sum, route) => {
          const distance = parseFloat(route.distance.replace(/[^\d.]/g, ''));
          return sum + (isNaN(distance) ? 0 : distance);
        }, 0),
        totalDuration: routes.reduce((sum, route) => {
          const duration = parseFloat(route.duration.replace(/[^\d.]/g, ''));
          return sum + (isNaN(duration) ? 0 : duration);
        }, 0),
      };
    } catch (error) {
      this.logger.error('Error optimizing delivery route', error);
      throw new Error('Failed to optimize delivery route');
    }
  }
}
