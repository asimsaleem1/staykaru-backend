import {
  Controller,
  Get,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleBasedAccessGuard } from '../auth/guards/role-based-access.guard';
import { AuthService } from '../auth/services/auth.service';
import { UserService } from '../user/services/user.service';
import { BookingService } from '../booking/services/booking.service';
import { OrderService } from '../order/services/order.service';
import { UserRole } from '../user/schema/user.schema';
import { OrderStatus } from '../order/schema/order.schema';

interface DashboardRequest extends Request {
  user: {
    _id: string;
    email: string;
    role: UserRole;
    name: string;
  };
}

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RoleBasedAccessGuard)
@ApiBearerAuth('JWT-auth')
export class DashboardController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly bookingService: BookingService,
    private readonly orderService: OrderService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user dashboard data based on role' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
    schema: {
      example: {
        user: {
          id: '507f1f77bcf86cd799439011',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'student',
        },
        stats: {
          totalBookings: 5,
          totalOrders: 12,
        },
        permissions: {
          canViewAccommodations: true,
          canViewFoodOptions: true,
          canMakeBookings: true,
          canMakeOrders: true,
        },
      },
    },
  })
  async getDashboard(@Request() req: DashboardRequest) {
    const userId = req.user._id;
    const userRole = req.user.role;

    // Get user dashboard data with permissions
    const dashboardData = await this.authService.getUserDashboardData(userId);

    // Get role-specific statistics
    let stats = {};
    
    switch (userRole) {
      case UserRole.STUDENT:
        stats = await this.getStudentStats(userId);
        break;
      case UserRole.LANDLORD:
        stats = await this.getLandlordStats(userId);
        break;
      case UserRole.FOOD_PROVIDER:
        stats = await this.getFoodProviderStats(userId);
        break;
    }

    return {
      ...dashboardData,
      stats,
    };
  }

  @Get('student/accommodations')
  @ApiOperation({ summary: 'Get available accommodations for students' })
  @ApiResponse({
    status: 200,
    description: 'Available accommodations retrieved successfully',
  })
  async getStudentAccommodations(@Request() req: DashboardRequest) {
    // Only students can access this endpoint
    if (req.user.role !== UserRole.STUDENT) {
      throw new Error('Access denied: Students only');
    }

    // TODO: Implement accommodation retrieval logic
    return {
      message: 'Available accommodations for students',
      data: [], // Placeholder
    };
  }

  @Get('student/food-options')
  @ApiOperation({ summary: 'Get available food options for students' })
  @ApiResponse({
    status: 200,
    description: 'Available food options retrieved successfully',
  })
  async getStudentFoodOptions(@Request() req: DashboardRequest) {
    // Only students can access this endpoint
    if (req.user.role !== UserRole.STUDENT) {
      throw new Error('Access denied: Students only');
    }

    // TODO: Implement food options retrieval logic
    return {
      message: 'Available food options for students',
      data: [], // Placeholder
    };
  }

  @Get('landlord/accommodations')
  @ApiOperation({ summary: 'Get landlord accommodations management' })
  @ApiResponse({
    status: 200,
    description: 'Landlord accommodations retrieved successfully',
  })
  async getLandlordAccommodations(@Request() req: DashboardRequest) {
    // Only landlords can access this endpoint
    if (req.user.role !== UserRole.LANDLORD) {
      throw new Error('Access denied: Landlords only');
    }

    const landlordId = req.user._id;

    // TODO: Implement landlord accommodations retrieval logic
    return {
      message: 'Landlord accommodations management',
      landlordId,
      data: [], // Placeholder
    };
  }

  @Get('landlord/revenue')
  @ApiOperation({ summary: 'Get landlord revenue analytics' })
  @ApiResponse({
    status: 200,
    description: 'Landlord revenue data retrieved successfully',
  })
  async getLandlordRevenue(@Request() req: DashboardRequest) {
    // Only landlords can access this endpoint
    if (req.user.role !== UserRole.LANDLORD) {
      throw new Error('Access denied: Landlords only');
    }

    const landlordId = req.user._id;

    // TODO: Implement revenue calculation logic
    return {
      message: 'Landlord revenue analytics',
      landlordId,
      totalRevenue: 0, // Placeholder
      monthlyRevenue: [], // Placeholder
    };
  }

  @Get('food-provider/food-options')
  @ApiOperation({ summary: 'Get food provider food options management' })
  @ApiResponse({
    status: 200,
    description: 'Food provider food options retrieved successfully',
  })
  async getFoodProviderFoodOptions(@Request() req: DashboardRequest) {
    // Only food providers can access this endpoint
    if (req.user.role !== UserRole.FOOD_PROVIDER) {
      throw new Error('Access denied: Food providers only');
    }

    const providerId = req.user._id;

    // TODO: Implement food provider food options retrieval logic
    return {
      message: 'Food provider food options management',
      providerId,
      data: [], // Placeholder
    };
  }

  @Get('food-provider/revenue')
  @ApiOperation({ summary: 'Get food provider revenue analytics' })
  @ApiResponse({
    status: 200,
    description: 'Food provider revenue data retrieved successfully',
  })
  async getFoodProviderRevenue(@Request() req: DashboardRequest) {
    // Only food providers can access this endpoint
    if (req.user.role !== UserRole.FOOD_PROVIDER) {
      throw new Error('Access denied: Food providers only');
    }

    const providerId = req.user._id;

    // TODO: Implement revenue calculation logic
    return {
      message: 'Food provider revenue analytics',
      providerId,
      totalRevenue: 0, // Placeholder
      monthlyRevenue: [], // Placeholder
    };
  }

  private async getStudentStats(userId: string) {
    try {
      const bookings = await this.bookingService.findByUser(userId);
      const orders = await this.orderService.findByUser(userId);

      return {
        totalBookings: bookings.length,
        totalOrders: orders.length,
        recentBookings: bookings.slice(-3), // Last 3 bookings
        recentOrders: orders.slice(-3), // Last 3 orders
      };
    } catch (error) {
      return {
        totalBookings: 0,
        totalOrders: 0,
        recentBookings: [],
        recentOrders: [],
      };
    }
  }

  private async getLandlordStats(userId: string) {
    try {
      const bookings = await this.bookingService.findByLandlord(userId);

      return {
        totalBookings: bookings.length,
        activeBookings: bookings.filter(b => b.status === 'confirmed').length,
        pendingBookings: bookings.filter(b => b.status === 'pending').length,
        totalRevenue: bookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0),
      };
    } catch (error) {
      return {
        totalBookings: 0,
        activeBookings: 0,
        pendingBookings: 0,
        totalRevenue: 0,
      };
    }
  }

  private async getFoodProviderStats(userId: string) {
    try {
      const orders = await this.orderService.findByFoodProvider(userId);

      return {
        totalOrders: orders.length,
        activeOrders: orders.filter(o => o.status === OrderStatus.PREPARING || o.status === OrderStatus.OUT_FOR_DELIVERY).length,
        pendingOrders: orders.filter(o => o.status === OrderStatus.PLACED).length,
        deliveredOrders: orders.filter(o => o.status === OrderStatus.DELIVERED).length,
        totalRevenue: orders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
      };
    } catch (error) {
      return {
        totalOrders: 0,
        activeOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
      };
    }
  }
}
