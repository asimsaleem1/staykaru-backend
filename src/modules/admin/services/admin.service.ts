import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../user/schema/user.schema';
import { Accommodation } from '../../accommodation/schema/accommodation.schema';
import { Booking } from '../../booking/schema/booking.schema';
import { Order } from '../../order/schema/order.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Accommodation.name) private accommodationModel: Model<Accommodation>,
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
  ) {}

  // User Management
  async getAllUsers(filters: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }) {
    const { page = 1, limit = 10, role, search } = filters;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await this.userModel
      .find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await this.userModel.countDocuments(query);

    return {
      data: users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit,
      },
    };
  }

  async getUserById(id: string) {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { data: user };
  }

  async updateUserStatus(id: string, isActive: boolean) {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { isActive, updatedAt: new Date() },
      { new: true },
    ).select('-password');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user,
    };
  }

  async deleteUser(id: string) {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { message: 'User deleted successfully' };
  }

  // Accommodation Management
  async getAllAccommodations(filters: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const { page = 1, limit = 10, status } = filters;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (status) query.status = status;

    const accommodations = await this.accommodationModel
      .find(query)
      .populate('ownerId', 'name email phone')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await this.accommodationModel.countDocuments(query);

    return {
      data: accommodations,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit,
      },
    };
  }

  async approveAccommodation(id: string) {
    const accommodation = await this.accommodationModel.findByIdAndUpdate(
      id,
      { status: 'active', approvedAt: new Date() },
      { new: true },
    );

    if (!accommodation) {
      throw new NotFoundException('Accommodation not found');
    }

    return {
      message: 'Accommodation approved successfully',
      data: accommodation,
    };
  }

  async rejectAccommodation(id: string, reason: string) {
    const accommodation = await this.accommodationModel.findByIdAndUpdate(
      id,
      { 
        status: 'rejected', 
        rejectionReason: reason,
        rejectedAt: new Date(),
      },
      { new: true },
    );

    if (!accommodation) {
      throw new NotFoundException('Accommodation not found');
    }

    return {
      message: 'Accommodation rejected successfully',
      data: accommodation,
    };
  }

  async deleteAccommodation(id: string) {
    const accommodation = await this.accommodationModel.findByIdAndDelete(id);
    if (!accommodation) {
      throw new NotFoundException('Accommodation not found');
    }

    return { message: 'Accommodation deleted successfully' };
  }

  // Food Service Management
  async getAllFoodServices(filters: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const { page = 1, limit = 10, status } = filters;
    const skip = (page - 1) * limit;

    // Mock implementation - replace with actual food service model when available
    const mockFoodServices = Array.from({ length: 20 }, (_, i) => ({
      id: `food_${i + 1}`,
      name: `Food Service ${i + 1}`,
      providerId: `provider_${i + 1}`,
      status: ['active', 'inactive', 'pending'][i % 3],
      createdAt: new Date(Date.now() - i * 86400000),
    }));

    let filteredServices = mockFoodServices;
    if (status) {
      filteredServices = mockFoodServices.filter(service => service.status === status);
    }

    const data = filteredServices.slice(skip, skip + limit);
    const total = filteredServices.length;

    return {
      data,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit,
      },
    };
  }

  async approveFoodService(id: string) {
    // Mock implementation
    return {
      message: 'Food service approved successfully',
      data: { id, status: 'active', approvedAt: new Date() },
    };
  }

  async rejectFoodService(id: string, reason: string) {
    // Mock implementation
    return {
      message: 'Food service rejected successfully',
      data: { id, status: 'rejected', rejectionReason: reason, rejectedAt: new Date() },
    };
  }

  // Booking Management
  async getAllBookings(filters: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const { page = 1, limit = 10, status } = filters;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (status) query.status = status;

    const bookings = await this.bookingModel
      .find(query)
      .populate('userId', 'name email phone')
      .populate('accommodationId', 'title location')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await this.bookingModel.countDocuments(query);

    return {
      data: bookings,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit,
      },
    };
  }

  async getBookingById(id: string) {
    const booking = await this.bookingModel
      .findById(id)
      .populate('userId', 'name email phone')
      .populate('accommodationId', 'title location ownerId');

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return { data: booking };
  }

  async cancelBooking(id: string, reason: string) {
    const booking = await this.bookingModel.findByIdAndUpdate(
      id,
      { 
        status: 'cancelled', 
        cancellationReason: reason,
        cancelledAt: new Date(),
        cancelledBy: 'admin',
      },
      { new: true },
    );

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return {
      message: 'Booking cancelled successfully',
      data: booking,
    };
  }

  // Order Management
  async getAllOrders(filters: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const { page = 1, limit = 10, status } = filters;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (status) query.status = status;

    const orders = await this.orderModel
      .find(query)
      .populate('userId', 'name email phone')
      .populate('providerId', 'businessName email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await this.orderModel.countDocuments(query);

    return {
      data: orders,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit,
      },
    };
  }

  async getOrderById(id: string) {
    const order = await this.orderModel
      .findById(id)
      .populate('userId', 'name email phone')
      .populate('providerId', 'businessName email phone');

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return { data: order };
  }

  // Analytics and Reports
  async getDashboardAnalytics() {
    const totalUsers = await this.userModel.countDocuments();
    const totalStudents = await this.userModel.countDocuments({ role: 'student' });
    const totalLandlords = await this.userModel.countDocuments({ role: 'landlord' });
    const totalFoodProviders = await this.userModel.countDocuments({ role: 'food_provider' });
    
    const totalAccommodations = await this.accommodationModel.countDocuments();
    const activeAccommodations = await this.accommodationModel.countDocuments({ status: 'active' });
    const pendingAccommodations = await this.accommodationModel.countDocuments({ status: 'pending' });
    
    const totalBookings = await this.bookingModel.countDocuments();
    const activeBookings = await this.bookingModel.countDocuments({ status: 'confirmed' });
    const pendingBookings = await this.bookingModel.countDocuments({ status: 'pending' });
    
    const totalOrders = await this.orderModel.countDocuments();
    const activeOrders = await this.orderModel.countDocuments({ 
      status: { $in: ['confirmed', 'preparing', 'ready'] } 
    });
    const completedOrders = await this.orderModel.countDocuments({ status: 'delivered' });

    // Mock revenue calculation
    const mockRevenue = {
      today: 1250.75,
      thisWeek: 8750.50,
      thisMonth: 35420.25,
      thisYear: 425000.00,
    };

    return {
      data: {
        users: {
          total: totalUsers,
          students: totalStudents,
          landlords: totalLandlords,
          foodProviders: totalFoodProviders,
        },
        accommodations: {
          total: totalAccommodations,
          active: activeAccommodations,
          pending: pendingAccommodations,
        },
        bookings: {
          total: totalBookings,
          active: activeBookings,
          pending: pendingBookings,
        },
        orders: {
          total: totalOrders,
          active: activeOrders,
          completed: completedOrders,
        },
        revenue: mockRevenue,
        growth: {
          usersGrowth: 15.2,
          bookingsGrowth: 8.7,
          ordersGrowth: 12.3,
          revenueGrowth: 18.5,
        },
      },
    };
  }

  async getUserAnalytics(period: string) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const newUsers = await this.userModel.countDocuments({
      createdAt: { $gte: startDate },
    });

    const usersByRole = await this.userModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    return {
      data: {
        period,
        newUsers,
        usersByRole,
        registrationTrend: [], // Mock data - implement based on requirements
      },
    };
  }

  async getRevenueAnalytics(period: string) {
    // Mock implementation - replace with actual payment/revenue tracking
    const mockRevenueData = {
      day: { total: 1250.75, transactions: 45 },
      week: { total: 8750.50, transactions: 312 },
      month: { total: 35420.25, transactions: 1456 },
      year: { total: 425000.00, transactions: 18750 },
    };

    return {
      data: {
        period,
        revenue: mockRevenueData[period] || mockRevenueData.month,
        breakdown: {
          accommodations: 0.6,
          foodOrders: 0.4,
        },
        trend: [], // Mock trend data
      },
    };
  }

  async getBookingAnalytics(period: string) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const totalBookings = await this.bookingModel.countDocuments({
      createdAt: { $gte: startDate },
    });

    const bookingsByStatus = await this.bookingModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    return {
      data: {
        period,
        totalBookings,
        bookingsByStatus,
        trend: [], // Mock trend data
      },
    };
  }

  // Reports
  async generateUsersReport(format: string) {
    const users = await this.userModel.find().select('-password');
    
    if (format === 'csv') {
      // Mock CSV generation
      const csvData = users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        createdAt: user.createdAt,
      }));
      
      return {
        data: csvData,
        format: 'csv',
        filename: `users_report_${new Date().toISOString().split('T')[0]}.csv`,
      };
    }

    return {
      data: users,
      format: 'json',
      generatedAt: new Date(),
      total: users.length,
    };
  }

  async generateRevenueReport(options: {
    format: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { format, startDate, endDate } = options;
    
    // Mock revenue report data
    const mockRevenueData = [
      { date: '2024-01-01', accommodations: 15000, foodOrders: 8500, total: 23500 },
      { date: '2024-01-02', accommodations: 12000, foodOrders: 9200, total: 21200 },
      { date: '2024-01-03', accommodations: 18000, foodOrders: 7800, total: 25800 },
    ];

    if (format === 'csv') {
      return {
        data: mockRevenueData,
        format: 'csv',
        filename: `revenue_report_${new Date().toISOString().split('T')[0]}.csv`,
      };
    }

    return {
      data: mockRevenueData,
      format: 'json',
      period: { startDate, endDate },
      generatedAt: new Date(),
    };
  }

  // System Management
  async getSystemHealth() {
    const dbStatus = 'healthy'; // Mock - implement actual database health check
    const redisStatus = 'healthy'; // Mock - implement actual Redis health check
    
    return {
      data: {
        database: { status: dbStatus, responseTime: '12ms' },
        cache: { status: redisStatus, responseTime: '3ms' },
        api: { status: 'healthy', uptime: '99.9%' },
        memory: { used: '45%', available: '55%' },
        cpu: { usage: '23%' },
        disk: { used: '67%', available: '33%' },
        lastChecked: new Date(),
      },
    };
  }

  async createSystemBackup() {
    // Mock backup implementation
    const backupId = `backup_${Date.now()}`;
    
    return {
      message: 'System backup created successfully',
      data: {
        backupId,
        timestamp: new Date(),
        size: '2.4 GB',
        location: 's3://staykaru-backups/',
        status: 'completed',
      },
    };
  }

  async getSystemLogs(options: { level?: string; limit?: number }) {
    const { level, limit = 100 } = options;
    
    // Mock logs implementation
    const mockLogs = Array.from({ length: limit }, (_, i) => ({
      id: `log_${i + 1}`,
      level: ['error', 'warn', 'info', 'debug'][i % 4],
      message: `System log message ${i + 1}`,
      timestamp: new Date(Date.now() - i * 60000),
      service: ['auth', 'booking', 'order', 'payment'][i % 4],
    }));

    let filteredLogs = mockLogs;
    if (level) {
      filteredLogs = mockLogs.filter(log => log.level === level);
    }

    return {
      data: filteredLogs.slice(0, limit),
      total: filteredLogs.length,
    };
  }

  // Configuration Management
  async getPlatformConfig() {
    // Mock configuration
    return {
      data: {
        platform: {
          name: 'StayKaru',
          version: '1.0.0',
          environment: process.env.NODE_ENV || 'development',
        },
        features: {
          emailVerification: false,
          twoFactorAuth: false,
          socialLogin: false,
          chatSystem: true,
          notificationSystem: true,
        },
        limits: {
          maxBookingsPerUser: 10,
          maxOrdersPerDay: 50,
          fileUploadSize: '10MB',
        },
        integrations: {
          paymentGateway: 'stripe',
          emailService: 'sendgrid',
          smsService: 'twilio',
        },
      },
    };
  }

  async updatePlatformConfig(config: any) {
    // Mock configuration update
    return {
      message: 'Platform configuration updated successfully',
      data: config,
      updatedAt: new Date(),
    };
  }

  // Notification Management
  async sendBroadcastNotification(notification: {
    title: string;
    message: string;
    type: string;
  }) {
    const totalUsers = await this.userModel.countDocuments({ isActive: true });
    
    // Mock notification sending
    return {
      message: 'Broadcast notification sent successfully',
      data: {
        ...notification,
        sentTo: totalUsers,
        sentAt: new Date(),
        id: `broadcast_${Date.now()}`,
      },
    };
  }

  async sendTargetedNotification(notification: {
    title: string;
    message: string;
    type: string;
    userIds?: string[];
    role?: string;
  }) {
    let targetCount = 0;
    
    if (notification.userIds) {
      targetCount = notification.userIds.length;
    } else if (notification.role) {
      targetCount = await this.userModel.countDocuments({ 
        role: notification.role, 
        isActive: true 
      });
    }

    // Mock notification sending
    return {
      message: 'Targeted notification sent successfully',
      data: {
        ...notification,
        sentTo: targetCount,
        sentAt: new Date(),
        id: `targeted_${Date.now()}`,
      },
    };
  }
}
