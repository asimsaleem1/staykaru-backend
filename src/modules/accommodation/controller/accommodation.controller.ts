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
import { RolesGuard } from '../../user/guards/roles.guard';
import { Roles } from '../../user/decorators/roles.decorator';
import { UserRole } from '../../user/schema/user.schema';
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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD, UserRole.ADMIN)
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
  // Landlord-specific endpoints (MUST come before :id route)
  @Get('landlord')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all accommodations for the authenticated landlord',
  })
  @ApiResponse({
    status: 200,
    description: 'Return landlord accommodations',
  })
  async getLandlordAccommodations(@Request() req: RequestWithUser) {
    const landlordId =
      typeof req.user._id === 'string' ? req.user._id : req.user._id.toString();
    return this.accommodationService.findByLandlord(landlordId);
  }

  @Get('landlord/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get landlord dashboard overview' })
  @ApiResponse({
    status: 200,
    description: 'Return landlord dashboard data',
  })
  async getLandlordDashboard(@Request() req: RequestWithUser) {
    const landlordId =
      typeof req.user._id === 'string' ? req.user._id : req.user._id.toString();
    return this.accommodationService.getLandlordDashboard(landlordId);
  }

  @Get('landlord/activities')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get landlord recent activities' })
  @ApiResponse({
    status: 200,
    description: 'Return landlord recent activities',
  })
  async getLandlordActivities(@Request() req: RequestWithUser) {
    const landlordId =
      typeof req.user._id === 'string' ? req.user._id : req.user._id.toString();
    return this.accommodationService.getLandlordActivities(landlordId);
  }

  // Admin endpoints (MUST come before :id route)
  @Get('admin/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all pending accommodations for admin approval',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all pending accommodations',
  })
  async findPending() {
    return this.accommodationService.findPendingAccommodations();
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all accommodations for admin review' })
  @ApiResponse({
    status: 200,
    description: 'Returns all accommodations',
  })
  async findAllForAdmin() {
    return this.accommodationService.getAllForAdmin();
  }

  @Get('admin/:id/details')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get accommodation details for admin review' })
  @ApiParam({ name: 'id', description: 'Accommodation ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns accommodation details for admin',
  })
  async getAdminAccommodationDetails(@Param('id') id: string) {
    return this.accommodationService.getAccommodationForAdmin(id);
  }

  // Generic :id route MUST come after all specific routes
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

  // Admin actions
  @Put('admin/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Approve an accommodation (Admin only)' })
  @ApiParam({ name: 'id', description: 'Accommodation ID' })
  @ApiResponse({
    status: 200,
    description: 'Accommodation approved successfully',
  })
  async approveAccommodation(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ) {
    const adminId =
      typeof req.user._id === 'string' ? req.user._id : req.user._id.toString();
    return this.accommodationService.approveAccommodation(id, adminId);
  }

  @Put('admin/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Reject an accommodation (Admin only)' })
  @ApiParam({ name: 'id', description: 'Accommodation ID' })
  @ApiResponse({
    status: 200,
    description: 'Accommodation rejected successfully',
  })
  async rejectAccommodation(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req: RequestWithUser,
  ) {
    const adminId =
      typeof req.user._id === 'string' ? req.user._id : req.user._id.toString();
    return this.accommodationService.rejectAccommodation(id, reason, adminId);
  }

  @Put('admin/:id/toggle-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle accommodation active status (Admin only)' })
  @ApiParam({ name: 'id', description: 'Accommodation ID' })
  @ApiResponse({
    status: 200,
    description: 'Accommodation status toggled successfully',
  })
  async toggleAccommodationStatus(@Param('id') id: string) {
    return this.accommodationService.toggleActiveStatus(id);
  }

  @Get('types')
  @ApiOperation({ summary: 'Get available accommodation types' })
  @ApiResponse({
    status: 200,
    description: 'Accommodation types retrieved successfully',
  })
  async getAccommodationTypes() {
    return {
      success: true,
      accommodationTypes: [
        {
          id: 'room',
          name: 'Single Room',
          description: 'Private room in a shared property',
          icon: 'bed',
          features: ['Private bedroom', 'Shared common areas'],
          avgPrice: '8000-15000',
          popular: true,
        },
        {
          id: 'shared_room',
          name: 'Shared Room',
          description: 'Shared bedroom with other students',
          icon: 'users',
          features: [
            'Shared bedroom',
            'Cost-effective',
            'Social environment',
          ],
          avgPrice: '4000-8000',
          popular: true,
        },
        {
          id: 'apartment',
          name: 'Full Apartment',
          description: 'Complete apartment for rent',
          icon: 'home',
          features: [
            'Private apartment',
            'Kitchen included',
            'Living room',
          ],
          avgPrice: '20000-40000',
          popular: false,
        },
        {
          id: 'hostel',
          name: 'Hostel',
          description: 'Dormitory-style accommodation',
          icon: 'building',
          features: [
            'Multiple beds',
            'Shared facilities',
            'Budget-friendly',
          ],
          avgPrice: '3000-6000',
          popular: true,
        },
        {
          id: 'pg',
          name: 'Paying Guest (PG)',
          description: 'Room with meals and services',
          icon: 'utensils',
          features: ['Meals included', 'Housekeeping', 'All utilities'],
          avgPrice: '12000-25000',
          popular: true,
        },
        {
          id: 'studio',
          name: 'Studio Apartment',
          description: 'Single room with kitchenette',
          icon: 'square',
          features: ['Compact living', 'Kitchenette', 'Private bathroom'],
          avgPrice: '15000-30000',
          popular: false,
        },
        {
          id: 'house',
          name: 'House',
          description: 'Full house for rent',
          icon: 'home-lg-alt',
          features: ['Multiple rooms', 'Garden/yard', 'Family-style'],
          avgPrice: '40000-80000',
          popular: false,
        },
        {
          id: 'flat',
          name: 'Flat',
          description: 'Independent flat in a building',
          icon: 'building-o',
          features: ['Independent entrance', 'Multiple rooms', 'Balcony'],
          avgPrice: '18000-35000',
          popular: false,
        },
        {
          id: 'villa',
          name: 'Villa',
          description: 'Luxury villa accommodation',
          icon: 'star',
          features: ['Luxury amenities', 'Large space', 'Premium location'],
          avgPrice: '60000-150000',
          popular: false,
        },
        {
          id: 'townhouse',
          name: 'Townhouse',
          description: 'Multi-story townhouse',
          icon: 'building-columns',
          features: ['Multiple floors', 'Private entrance', 'Modern design'],
          avgPrice: '35000-70000',
          popular: false,
        },
        {
          id: 'penthouse',
          name: 'Penthouse',
          description: 'Top-floor luxury apartment',
          icon: 'crown',
          features: ['Top floor', 'City views', 'Premium amenities'],
          avgPrice: '80000-200000',
          popular: false,
        },
        {
          id: 'loft',
          name: 'Loft',
          description: 'Open-plan loft space',
          icon: 'layer-group',
          features: ['Open space', 'High ceilings', 'Modern style'],
          avgPrice: '25000-50000',
          popular: false,
        },
      ],
    };
  }
}
