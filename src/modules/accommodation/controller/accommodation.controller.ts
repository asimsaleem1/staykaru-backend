import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AccommodationService } from '../services/accommodation.service';
import { CreateAccommodationDto } from '../dto/create-accommodation.dto';
import { UpdateAccommodationDto } from '../dto/update-accommodation.dto';
import { SearchAccommodationDto } from '../dto/search-accommodation.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { LandlordGuard } from '../guards/landlord.guard';

interface RequestWithUser extends Request {
  user?: {
    _id: string | { toString(): string };
    email: string;
    [key: string]: any;
  };
}

@ApiTags('accommodations')
@Controller('accommodations')
export class AccommodationController {
  constructor(private readonly accommodationService: AccommodationService) {}

  @Post()
  @UseGuards(AuthGuard, LandlordGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new accommodation' })
  @ApiResponse({
    status: 201,
    description: 'Accommodation successfully created',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        title: 'Modern Student Apartment',
        description: 'Fully furnished apartment near university',
        price: 800,
        city: {
          _id: '507f1f77bcf86cd799439013',
          name: 'Mumbai',
          country: {
            _id: '507f1f77bcf86cd799439012',
            name: 'India',
          },
        },
        coordinates: {
          type: 'Point',
          coordinates: [72.8777, 19.076],
        },
        amenities: ['WiFi', 'Kitchen', 'Laundry'],
        availability: ['2025-06-01', '2025-06-02'],
        landlord: {
          _id: '507f1f77bcf86cd799439014',
          name: 'John Doe',
          email: 'john@landlord.com',
          role: 'landlord',
        },
        createdAt: '2025-05-28T10:00:00.000Z',
        updatedAt: '2025-05-28T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only landlords can create accommodations',
  })
  async create(
    @Body() createAccommodationDto: CreateAccommodationDto,
    @Request() req: RequestWithUser,
  ) {
    // For testing without authentication, req.user will be undefined
    return this.accommodationService.create(
      createAccommodationDto,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      req.user as any,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all accommodations with optional filters' })
  @ApiQuery({
    name: 'city',
    required: false,
    description: 'Filter by city ID (MongoDB ObjectId)',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    description: 'Minimum price filter',
    type: 'number',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    description: 'Maximum price filter',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all accommodations',
    schema: {
      example: [
        {
          _id: '507f1f77bcf86cd799439011',
          title: 'Modern Student Apartment',
          price: 800,
          city: {
            _id: '507f1f77bcf86cd799439013',
            name: 'Mumbai',
            country: {
              _id: '507f1f77bcf86cd799439012',
              name: 'India',
            },
          },
          amenities: ['WiFi', 'Kitchen'],
          landlord: {
            _id: '507f1f77bcf86cd799439014',
            name: 'John Doe',
          },
        },
      ],
    },
  })
  async findAll(@Query() searchDto: SearchAccommodationDto) {
    return this.accommodationService.findAll(searchDto);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Find nearby accommodations using coordinates' })
  @ApiQuery({
    name: 'lat',
    required: true,
    description: 'Latitude coordinate',
    type: 'number',
  })
  @ApiQuery({
    name: 'lng',
    required: true,
    description: 'Longitude coordinate',
    type: 'number',
  })
  @ApiQuery({
    name: 'radius',
    required: false,
    description: 'Search radius in meters (default: 5000)',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Return nearby accommodations',
    schema: {
      example: [
        {
          id: '507f1f77bcf86cd799439011',
          title: 'Close to Campus Apartment',
          distance: 1200,
          location: {
            coordinates: [40.7128, -74.006],
          },
        },
      ],
    },
  })
  async findNearby(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius: number = 5000,
  ) {
    return this.accommodationService.findNearby(lat, lng, radius);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an accommodation by ID' })
  @ApiParam({ name: 'id', description: 'Accommodation ID' })
  @ApiResponse({
    status: 200,
    description: 'Return an accommodation',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        title: 'Modern Student Apartment',
        description: 'Fully furnished apartment near university',
        price: 800,
        currency: 'USD',
        property_type: 'apartment',
        location: {
          address: '123 University Ave',
          city: 'Student City',
          country: 'CountryName',
          coordinates: [40.7128, -74.006],
        },
        amenities: ['WiFi', 'Kitchen', 'Laundry'],
        availability: true,
        landlord_id: '507f1f77bcf86cd799439012',
        created_at: '2025-05-28T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Accommodation not found' })
  async findOne(@Param('id') id: string) {
    return this.accommodationService.findOne(id);
  }

  @Put(':id')
  // @UseGuards(LandlordGuard) // Temporarily disabled for testing
  @ApiOperation({ summary: 'Update an accommodation' })
  @ApiParam({ name: 'id', description: 'Accommodation ID' })
  @ApiResponse({
    status: 200,
    description: 'Accommodation successfully updated',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        title: 'Updated Apartment Title',
        message: 'Accommodation updated successfully',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only update own accommodations',
  })
  @ApiResponse({ status: 404, description: 'Accommodation not found' })
  async update(
    @Param('id') id: string,
    @Body() updateAccommodationDto: UpdateAccommodationDto,
    @Request() req: RequestWithUser,
  ) {
    return this.accommodationService.update(
      id,
      updateAccommodationDto,
      typeof req.user?._id === 'string'
        ? req.user._id
        : req.user?._id?.toString() || 'temp-user-id',
    );
  }

  @Delete(':id')
  // @UseGuards(LandlordGuard) // Temporarily disabled for testing
  @ApiOperation({ summary: 'Delete an accommodation' })
  @ApiParam({ name: 'id', description: 'Accommodation ID' })
  @ApiResponse({
    status: 200,
    description: 'Accommodation successfully deleted',
    schema: {
      example: {
        message: 'Accommodation deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only delete own accommodations',
  })
  @ApiResponse({ status: 404, description: 'Accommodation not found' })
  async remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    await this.accommodationService.remove(
      id,
      typeof req.user?._id === 'string'
        ? req.user._id
        : req.user?._id?.toString() || 'temp-user-id',
    );
    return { message: 'Accommodation deleted successfully' };
  }

  // Landlord-specific endpoints

  @Get('landlord/my-accommodations')
  @UseGuards(AuthGuard, LandlordGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all accommodations owned by the landlord' })
  @ApiResponse({
    status: 200,
    description: 'Returns all accommodations owned by the landlord',
  })
  async getMyAccommodations(@Request() req: RequestWithUser) {
    const landlordId = typeof req.user._id === 'string'
      ? req.user._id
      : req.user._id.toString();
    return this.accommodationService.findByLandlord(landlordId);
  }

  @Get('landlord/dashboard')
  @UseGuards(AuthGuard, LandlordGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get landlord dashboard summary' })
  @ApiResponse({
    status: 200,
    description: 'Returns landlord dashboard summary',
  })
  async getLandlordDashboard(@Request() req: RequestWithUser) {
    const landlordId = typeof req.user._id === 'string'
      ? req.user._id
      : req.user._id.toString();
    return this.accommodationService.getLandlordDashboard(landlordId);
  }

  @Get('landlord/bookings')
  @UseGuards(AuthGuard, LandlordGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all bookings for accommodations owned by the landlord' })
  @ApiResponse({
    status: 200,
    description: 'Returns all bookings for accommodations owned by the landlord',
  })
  async getMyBookings(@Request() req: RequestWithUser) {
    const landlordId = typeof req.user._id === 'string'
      ? req.user._id
      : req.user._id.toString();
    return this.accommodationService.getLandlordBookings(landlordId);
  }

  @Get('landlord/analytics')
  @UseGuards(AuthGuard, LandlordGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get analytics for accommodations owned by the landlord' })
  @ApiResponse({
    status: 200,
    description: 'Returns analytics for accommodations owned by the landlord',
  })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getLandlordAnalytics(
    @Request() req: RequestWithUser,
    @Query('days') days?: number,
  ) {
    const landlordId = typeof req.user._id === 'string'
      ? req.user._id
      : req.user._id.toString();
    return this.accommodationService.getLandlordAnalytics(landlordId, days);
  }
}
