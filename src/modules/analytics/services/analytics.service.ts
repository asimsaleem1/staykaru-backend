import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AnalyticsReportFactory } from '../factories/analytics-report.factory';
import { AnalyticsTimeRange } from '../interfaces/analytics-report.interface';
import { User, UserRole } from '../../user/schema/user.schema';
import { Booking, BookingStatus } from '../../booking/schema/booking.schema';
import { Review } from '../../review/schema/review.schema';
import { Order } from '../../order/schema/order.schema';
import { Payment } from '../../payment/schema/payment.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly reportFactory: AnalyticsReportFactory,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Booking.name) private readonly bookingModel: Model<Booking>,
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    @InjectModel(Payment.name) private readonly paymentModel: Model<Payment>,
  ) {}

  async getAnalytics(type: string, days?: number): Promise<any> {
    const report = this.reportFactory.createReport(type);

    let timeRange: AnalyticsTimeRange | undefined;

    if (days) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      timeRange = { startDate, endDate };
    }

    return report.generate(timeRange);
  }

  async getUserAnalytics() {
    const totalUsers = await this.userModel.countDocuments();
    const usersByRole = await this.userModel.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    const recentUsers = await this.userModel
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email role createdAt');

    // User growth over time (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userGrowth = await this.userModel.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
    ]);

    return {
      totalUsers,
      usersByRole: usersByRole.map((item) => ({
        role: item._id,
        count: item.count,
      })),
      recentUsers,
      userGrowth: userGrowth.map((item) => ({
        period: `${item._id.year}-${item._id.month}`,
        count: item.count,
      })),
    };
  }

  async getReviewAnalytics() {
    const totalReviews = await this.reviewModel.countDocuments();

    const averageRating = await this.reviewModel.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
        },
      },
    ]);

    const reviewsByTargetType = await this.reviewModel.aggregate([
      {
        $group: {
          _id: '$target_type',
          count: { $sum: 1 },
          averageRating: { $avg: '$rating' },
        },
      },
    ]);

    const recentReviews = await this.reviewModel
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email')
      .select('rating comment target_type target_id createdAt');

    return {
      totalReviews,
      averageRating:
        averageRating.length > 0 ? averageRating[0].averageRating : 0,
      reviewsByTargetType: reviewsByTargetType.map((item) => ({
        targetType: item._id,
        count: item.count,
        averageRating: item.averageRating,
      })),
      recentReviews,
    };
  }

  async getDashboardSummary() {
    // Get counts of key entities
    const totalUsers = await this.userModel.countDocuments();
    const totalBookings = await this.bookingModel.countDocuments();
    const totalOrders = await this.orderModel.countDocuments();
    const totalReviews = await this.reviewModel.countDocuments();

    // Get revenue summary
    const totalRevenue = await this.paymentModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    // Recent activity
    const recentBookings = await this.bookingModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .populate('accommodation', 'title location price');

    const recentOrders = await this.orderModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .populate('food_provider', 'name location');

    // User distribution
    const usersByRole = await this.userModel.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    // Booking status distribution
    const bookingsByStatus = await this.bookingModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Order status distribution
    const ordersByStatus = await this.orderModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      counts: {
        users: totalUsers,
        bookings: totalBookings,
        orders: totalOrders,
        reviews: totalReviews,
        revenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      },
      distributions: {
        usersByRole: usersByRole.map((item) => ({
          role: item._id,
          count: item.count,
        })),
        bookingsByStatus: bookingsByStatus.map((item) => ({
          status: item._id,
          count: item.count,
        })),
        ordersByStatus: ordersByStatus.map((item) => ({
          status: item._id,
          count: item.count,
        })),
      },
      recent: {
        bookings: recentBookings,
        orders: recentOrders,
      },
    };
  }

  async generateUserReport() {
    const users = await this.userModel.find().select('-password');

    const userStats = {
      total: users.length,
      byRole: {
        students: users.filter((u) => u.role === UserRole.STUDENT).length,
        landlords: users.filter((u) => u.role === UserRole.LANDLORD).length,
        foodProviders: users.filter((u) => u.role === UserRole.FOOD_PROVIDER)
          .length,
        admins: users.filter((u) => u.role === UserRole.ADMIN).length,
      },
    };

    return {
      generatedAt: new Date(),
      stats: userStats,
      users: users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        gender: user.gender,
      })),
    };
  }

  async generateBookingReport(days?: number) {
    let query = {};

    if (days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      query = { createdAt: { $gte: startDate } };
    }

    const bookings = await this.bookingModel
      .find(query)
      .populate('user', 'name email')
      .populate('accommodation', 'title location price');

    const bookingStats = {
      total: bookings.length,
      byStatus: {
        pending: bookings.filter((b) => b.status === BookingStatus.PENDING)
          .length,
        confirmed: bookings.filter((b) => b.status === BookingStatus.CONFIRMED)
          .length,
        cancelled: bookings.filter((b) => b.status === BookingStatus.CANCELLED)
          .length,
        completed: bookings.filter((b) => b.status === BookingStatus.CONFIRMED)
          .length, // Use CONFIRMED instead of COMPLETED
      },
      totalRevenue: bookings.reduce(
        (sum, booking: any) => sum + booking.total_price,
        0,
      ),
    };

    return {
      generatedAt: new Date(),
      timeFrame: days ? `Last ${days} days` : 'All time',
      stats: bookingStats,
      bookings: bookings.map((booking: any) => ({
        id: booking._id,
        accommodation: booking.accommodation?.title || 'Unknown',
        user: booking.user?.name || 'Unknown',
        startDate: booking.start_date,
        endDate: booking.end_date,
        status: booking.status,
        price: booking.total_price,
        createdAt: booking.createdAt,
      })),
    };
  }

  async generateRevenueReport(days?: number) {
    let query = {};

    if (days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      query = { createdAt: { $gte: startDate } };
    }

    const payments = await this.paymentModel
      .find(query)
      .populate('user', 'name email')
      .populate({
        path: 'source',
        populate: {
          path: 'accommodation',
          select: 'title location',
        },
      });

    // Monthly revenue data
    const monthlyRevenue = await this.paymentModel.aggregate([
      {
        $match: query,
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
    ]);

    // Revenue by source type
    const revenueBySourceType = await this.paymentModel.aggregate([
      {
        $match: query,
      },
      {
        $group: {
          _id: '$source_type',
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );
    const averagePayment = totalRevenue / (payments.length || 1);

    return {
      generatedAt: new Date(),
      timeFrame: days ? `Last ${days} days` : 'All time',
      summary: {
        totalRevenue,
        numberOfPayments: payments.length,
        averagePaymentAmount: averagePayment,
      },
      trends: {
        monthly: monthlyRevenue.map((item: any) => ({
          period: `${item._id.year}-${item._id.month}`,
          revenue: item.revenue,
          count: item.count,
        })),
        bySourceType: revenueBySourceType.map((item: any) => ({
          sourceType: item._id,
          revenue: item.revenue,
          count: item.count,
        })),
      },
      recentPayments: payments.slice(0, 10).map((payment: any) => ({
        id: payment._id,
        amount: payment.amount,
        sourceType: payment.source_type,
        sourceName:
          payment.source_type === 'booking'
            ? payment.source?.accommodation?.title || 'Unknown'
            : 'Food Order',
        user: payment.user?.name || 'Unknown',
        status: payment.status,
        createdAt: payment.createdAt,
      })),
    };
  }
}
