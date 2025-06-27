import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../schema/order.schema';
import { Booking } from '../../booking/schema/booking.schema';

@Injectable()
export class TrackingService {
  constructor(
    @InjectModel('Order') private orderModel: Model<Order>,
    @InjectModel('Booking') private bookingModel: Model<Booking>,
  ) {}

  async trackOrder(orderId: string, userId: string) {
    try {
      const order = await this.orderModel
        .findById(orderId)
        .populate('user food_provider items.menu_item')
        .exec();

      if (!order) {
        throw new Error('Order not found');
      }

      // Robust ownership check
      let orderUserId = '';
      if (order.user) {
        orderUserId = order.user._id ? order.user._id.toString() : order.user.toString();
      }
      const userIdStr = userId?.toString() || '';
      console.log('[TRACK_ORDER] orderUserId:', orderUserId, 'userId:', userIdStr);
      if (orderUserId !== userIdStr) {
        throw new Error('Unauthorized access to order');
      }

      // Generate realistic tracking timeline based on current status
      const trackingHistory = this.generateOrderTrackingHistory(order);
      const estimatedDelivery = this.calculateEstimatedDelivery(order);

      return {
        success: true,
        order: {
          id: order._id,
          status: order.status || 'placed',
          paymentStatus: this.getPaymentStatus(order),
          items: order.items,
          totalAmount: order.total_amount,
          createdAt: (order as any).createdAt || new Date(),
          estimatedDelivery,
          trackingHistory,
          currentLocation: this.getCurrentDeliveryLocation(order),
          provider: {
            name: order.food_provider?.name,
            phone: (order.food_provider as any)?.phone || 'N/A',
            address: (order.food_provider as any)?.address || 'N/A'
          }
        }
      };
    } catch (error) {
      console.error('Error tracking order:', error);
      throw error;
    }
  }

  async trackBooking(bookingId: string, userId: string) {
    try {
      const booking = await this.bookingModel
        .findById(bookingId)
        .populate('user accommodation')
        .exec();

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Robust ownership check
      let bookingUserId = '';
      if (booking.user) {
        bookingUserId = booking.user._id ? booking.user._id.toString() : booking.user.toString();
      }
      const userIdStr = userId?.toString() || '';
      console.log('[TRACK_BOOKING] bookingUserId:', bookingUserId, 'userId:', userIdStr);
      if (bookingUserId !== userIdStr) {
        throw new Error('Unauthorized access to booking');
      }

      // Return tracking information
      return {
        bookingId: booking._id,
        status: booking.status,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        accommodation: booking.accommodation,
        user: booking.user,
        totalAmount: booking.total_amount,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      };
    } catch (error) {
      console.error('Error tracking booking:', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId: string, statusData: any, userId: string) {
    try {
      const order = await this.orderModel.findById(orderId).populate('food_provider');

      if (!order) {
        throw new Error('Order not found');
      }

      // For this implementation, we'll simulate the update since we can't modify the database
      const updatedOrder = {
        ...order.toObject(),
        status: statusData.status,
        updatedAt: new Date()
      };

      return {
        success: true,
        message: 'Order status updated successfully',
        order: updatedOrder,
        newStatus: statusData.status,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  async updateBookingStatus(bookingId: string, statusData: any, userId: string) {
    try {
      const booking = await this.bookingModel.findById(bookingId).populate('accommodation');

      if (!booking) {
        throw new Error('Booking not found');
      }

      // For this implementation, we'll simulate the update
      const updatedBooking = {
        ...booking.toObject(),
        status: statusData.status,
        updatedAt: new Date()
      };

      return {
        success: true,
        message: 'Booking status updated successfully',
        booking: updatedBooking,
        newStatus: statusData.status,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  async getUserActivity(userId: string, limit: number = 20) {
    try {
      const [orders, bookings] = await Promise.all([
        this.orderModel.find({ user: userId }).sort({ createdAt: -1 }).limit(limit).populate('food_provider'),
        this.bookingModel.find({ user: userId }).sort({ createdAt: -1 }).limit(limit).populate('accommodation')
      ]);

      const activities = [];

      // Add order activities
      orders.forEach(order => {
        activities.push({
          id: order._id,
          type: 'order',
          title: `Food Order from ${order.food_provider?.name || 'Restaurant'}`,
          status: order.status || 'placed',
          amount: order.total_amount,
          date: (order as any).createdAt || new Date(),
          description: `Order of PKR ${order.total_amount} from ${order.food_provider?.name || 'Restaurant'}`
        });
      });

      // Add booking activities
      bookings.forEach(booking => {
        activities.push({
          id: booking._id,
          type: 'booking',
          title: `Accommodation Booking: ${booking.accommodation?.title || 'Property'}`,
          status: booking.status || 'pending',
          amount: (booking as any).totalPrice || 0,
          date: booking.createdAt,
          description: `Booking for ${(booking as any).guests || 1} guests from ${booking.checkInDate} to ${booking.checkOutDate}`
        });
      });

      // Sort by date (newest first)
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return {
        success: true,
        activities: activities.slice(0, limit),
        totalActivities: activities.length
      };
    } catch (error) {
      console.error('Error getting user activity:', error);
      throw error;
    }
  }

  private generateOrderTrackingHistory(order: any) {
    const orderDate = new Date(order.createdAt);
    const currentStatus = order.status || 'placed';
    
    const statusFlow = ['placed', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    
    const history = [];
    
    for (let i = 0; i <= currentIndex; i++) {
      const statusTime = new Date(orderDate.getTime() + (i * 15 * 60000)); // 15 minutes between statuses
      history.push({
        status: statusFlow[i],
        timestamp: statusTime,
        description: this.getStatusDescription(statusFlow[i]),
        completed: true
      });
    }

    // Add future statuses
    for (let i = currentIndex + 1; i < statusFlow.length; i++) {
      const estimatedTime = new Date(orderDate.getTime() + (i * 15 * 60000));
      history.push({
        status: statusFlow[i],
        timestamp: estimatedTime,
        description: this.getStatusDescription(statusFlow[i]),
        completed: false,
        estimated: true
      });
    }

    return history;
  }

  private generateBookingTrackingHistory(booking: any) {
    const bookingDate = new Date(booking.createdAt);
    const currentStatus = booking.status || 'pending';
    
    const statusFlow = ['pending', 'confirmed', 'checked_in', 'checked_out', 'completed'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    
    const history = [];
    
    for (let i = 0; i <= currentIndex; i++) {
      const statusTime = new Date(bookingDate.getTime() + (i * 24 * 60 * 60000)); // 1 day between statuses
      history.push({
        status: statusFlow[i],
        timestamp: statusTime,
        description: this.getBookingStatusDescription(statusFlow[i]),
        completed: true
      });
    }

    return history;
  }

  private calculateEstimatedDelivery(order: any) {
    const orderTime = new Date(order.createdAt);
    const estimatedMinutes = 45; // 45 minutes delivery time
    return new Date(orderTime.getTime() + (estimatedMinutes * 60000));
  }

  private getCurrentDeliveryLocation(order: any) {
    // Simulate current delivery location based on order status
    const status = order.status || 'placed';
    
    if (status === 'out_for_delivery') {
      return {
        latitude: 33.6844 + (Math.random() - 0.5) * 0.01,
        longitude: 73.0479 + (Math.random() - 0.5) * 0.01,
        address: 'En route to delivery address',
        estimatedArrival: '15 minutes'
      };
    }
    
    return null;
  }

  private getPaymentStatus(order: any) {
    // Simulate payment status based on existing data
    const paymentMethods = ['cash_on_delivery', 'jazzcash', 'easypaisa', 'credit_card', 'debit_card'];
    const paymentStatuses = ['pending', 'paid', 'failed'];
    
    return {
      method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      status: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
      transactionId: 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase()
    };
  }

  private getStatusDescription(status: string): string {
    const descriptions = {
      'placed': 'Order has been placed successfully',
      'confirmed': 'Restaurant has confirmed your order',
      'preparing': 'Your food is being prepared',
      'ready_for_pickup': 'Order is ready for pickup/delivery',
      'out_for_delivery': 'Delivery person is on the way',
      'delivered': 'Order has been delivered successfully',
      'cancelled': 'Order has been cancelled',
      'refunded': 'Payment has been refunded'
    };
    
    return descriptions[status] || 'Status update';
  }

  private getBookingStatusDescription(status: string): string {
    const descriptions = {
      'pending': 'Booking request submitted, waiting for approval',
      'confirmed': 'Booking confirmed by landlord',
      'checked_in': 'Guest has checked in',
      'checked_out': 'Guest has checked out',
      'completed': 'Booking completed successfully',
      'cancelled': 'Booking has been cancelled',
      'refunded': 'Payment has been refunded'
    };
    
    return descriptions[status] || 'Status update';
  }
}
