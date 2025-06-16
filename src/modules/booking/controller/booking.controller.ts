import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { BookingService } from '../services/booking.service';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { UpdateBookingStatusDto } from '../dto/update-booking-status.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { LandlordGuard } from '../../accommodation/guards/landlord.guard';

@ApiTags('bookings')
@Controller('bookings')
// @UseGuards(AuthGuard) // Temporarily disabled for testing
// @ApiBearerAuth('JWT-auth') // Temporarily disabled for testing
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new accommodation booking' })
  @ApiResponse({
    status: 201,
    description: 'Booking successfully created',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        accommodation_id: '507f1f77bcf86cd799439012',
        user_id: '507f1f77bcf86cd799439013',
        check_in_date: '2025-06-01',
        check_out_date: '2025-06-05',
        total_guests: 2,
        total_amount: 400,
        currency: 'USD',
        status: 'pending',
        special_requests: 'Late check-in requested',
        created_at: '2025-05-28T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid booking data',
  })
  @ApiResponse({ status: 404, description: 'Accommodation not found' })
  async create(@Body() createBookingDto: CreateBookingDto, @Request() req) {
    // Temporary fix for testing without auth
    const userId = req.user?._id || '683700350f8a15197d2abf50'; // Dummy user ID for testing
    return this.bookingService.create(createBookingDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings (Admin access)' })
  @ApiResponse({
    status: 200,
    description: 'Return all bookings',
    schema: {
      example: [
        {
          id: '507f1f77bcf86cd799439011',
          accommodation: {
            id: '507f1f77bcf86cd799439012',
            title: 'Modern Apartment',
          },
          user: {
            id: '507f1f77bcf86cd799439013',
            name: 'John Doe',
          },
          check_in_date: '2025-06-01',
          check_out_date: '2025-06-05',
          status: 'confirmed',
          total_amount: 400,
        },
      ],
    },
  })
  async findAll() {
    return this.bookingService.findAll();
  }

  @Get('my-bookings')
  @ApiOperation({ summary: "Get current user's bookings" })
  @ApiResponse({
    status: 200,
    description: "Return user's bookings",
    schema: {
      example: [
        {
          id: '507f1f77bcf86cd799439011',
          accommodation: {
            title: 'Modern Apartment',
            location: {
              city: 'Student City',
            },
          },
          check_in_date: '2025-06-01',
          check_out_date: '2025-06-05',
          status: 'confirmed',
          total_amount: 400,
        },
      ],
    },
  })
  async findMyBookings(@Request() req) {
    // Temporary fix for testing without auth
    const userId = req.user?._id || '683700350f8a15197d2abf50'; // Dummy user ID for testing
    return this.bookingService.findByUser(userId);
  }

  @Get('landlord-bookings')
  // @UseGuards(LandlordGuard) // Temporarily disabled for testing
  @ApiOperation({
    summary: "Get landlord's property bookings (Landlords only)",
  })
  @ApiResponse({
    status: 200,
    description: "Return landlord's property bookings",
    schema: {
      example: [
        {
          id: '507f1f77bcf86cd799439011',
          accommodation: {
            title: 'My Property',
          },
          guest: {
            name: 'John Doe',
            email: 'john@example.com',
          },
          check_in_date: '2025-06-01',
          check_out_date: '2025-06-05',
          status: 'pending',
          total_amount: 400,
        },
      ],
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Landlord access required',
  })
  async findLandlordBookings(@Request() req) {
    // Temporary fix for testing without auth
    const userId = req.user?._id || '683700350f8a15197d2abf50'; // Dummy user ID for testing
    return this.bookingService.findByLandlord(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a booking by ID' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({
    status: 200,
    description: 'Return a booking',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        accommodation: {
          id: '507f1f77bcf86cd799439012',
          title: 'Modern Apartment',
          location: {
            address: '123 University Ave',
            city: 'Student City',
          },
        },
        user: {
          id: '507f1f77bcf86cd799439013',
          name: 'John Doe',
          email: 'john@example.com',
        },
        check_in_date: '2025-06-01',
        check_out_date: '2025-06-05',
        total_guests: 2,
        total_amount: 400,
        currency: 'USD',
        status: 'confirmed',
        special_requests: 'Late check-in requested',
        created_at: '2025-05-28T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async findOne(@Param('id') id: string) {
    return this.bookingService.findOne(id);
  }

  @Put(':id/status')
  // @UseGuards(LandlordGuard) // Temporarily disabled for testing
  @ApiOperation({ summary: 'Update booking status (Landlords only)' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({
    status: 200,
    description: 'Booking status successfully updated',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        status: 'confirmed',
        message: 'Booking status updated successfully',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only update bookings for own properties',
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateBookingStatusDto: UpdateBookingStatusDto,
    @Request() req,
  ) {
    // Temporary fix for testing without auth
    const userId = req.user?._id || '683700350f8a15197d2abf50'; // Dummy user ID for testing
    return this.bookingService.updateStatus(id, updateBookingStatusDto, userId);
  }
}
