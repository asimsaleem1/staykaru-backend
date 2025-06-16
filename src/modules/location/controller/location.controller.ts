import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  Put,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { LocationService } from '../services/location.service';
import { CreateCountryDto } from '../dto/create-country.dto';
import { CreateCityDto } from '../dto/create-city.dto';
import { UpdateCountryDto } from '../dto/update-country.dto';
import { UpdateCityDto } from '../dto/update-city.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';

@ApiTags('location')
@Controller('location')
// @UseGuards(AuthGuard) // Temporarily disabled for testing
// @ApiBearerAuth('JWT-auth') // Temporarily disabled for testing
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post('countries')
  @ApiOperation({
    summary: 'Create a new country',
    description: 'Add a new country to the location database.',
  })
  @ApiResponse({
    status: 201,
    description: 'Country successfully created',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        name: 'India',
        createdAt: '2025-05-28T10:00:00.000Z',
        updatedAt: '2025-05-28T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid country data',
    schema: {
      example: {
        message: ['name should not be empty', 'name must be a string'],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Country already exists',
    schema: {
      example: {
        message: 'Country with this name already exists',
        error: 'Conflict',
        statusCode: 409,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async createCountry(@Body() createCountryDto: CreateCountryDto) {
    return this.locationService.createCountry(createCountryDto);
  }

  @Get('countries')
  @ApiOperation({
    summary: 'Get all countries',
    description:
      'Retrieve a list of all countries in the database. Returns countries with their IDs and names.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all countries',
    schema: {
      example: [
        {
          _id: '507f1f77bcf86cd799439011',
          name: 'India',
          createdAt: '2025-05-28T10:00:00.000Z',
          updatedAt: '2025-05-28T10:00:00.000Z',
        },
        {
          _id: '507f1f77bcf86cd799439012',
          name: 'Pakistan',
          createdAt: '2025-05-28T10:01:00.000Z',
          updatedAt: '2025-05-28T10:01:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getAllCountries() {
    return this.locationService.getAllCountries();
  }

  @Get('countries/:id')
  @ApiOperation({
    summary: 'Get a country by ID',
    description: 'Retrieve a specific country by its MongoDB ObjectId.',
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the country',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the country',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        name: 'India',
        createdAt: '2025-05-28T10:00:00.000Z',
        updatedAt: '2025-05-28T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Country not found',
    schema: {
      example: {
        message: 'Country not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid country ID format',
    schema: {
      example: {
        message: 'Invalid ObjectId format',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getCountryById(@Param('id') id: string) {
    return this.locationService.getCountryById(id);
  }

  @Put('countries/:id')
  @ApiOperation({
    summary: 'Update a country by ID',
    description:
      "Update an existing country's information. Only provide fields that need to be updated.",
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the country to update',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Country successfully updated',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        name: 'Updated India',
        createdAt: '2025-05-28T10:00:00.000Z',
        updatedAt: '2025-05-28T11:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Country not found',
    schema: {
      example: {
        message: 'Country not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or country ID format',
    schema: {
      example: {
        message: ['name should not be empty', 'name must be a string'],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async updateCountry(
    @Param('id') id: string,
    @Body() updateCountryDto: UpdateCountryDto,
  ) {
    return this.locationService.updateCountry(id, updateCountryDto);
  }

  @Delete('countries/:id')
  @ApiOperation({
    summary: 'Delete a country by ID',
    description:
      'Delete a country from the database. Cannot delete countries that have cities associated with them.',
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the country to delete',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Country successfully deleted',
    schema: {
      example: {
        message: 'Country deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Country not found',
    schema: {
      example: {
        message: 'Country not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete country with associated cities',
    schema: {
      example: {
        message: 'Cannot delete country. It has 5 cities associated with it.',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async deleteCountry(@Param('id') id: string) {
    return this.locationService.deleteCountry(id);
  }

  @Post('cities')
  @ApiOperation({
    summary: 'Create a new city',
    description:
      'Add a new city to the location database. The city must be associated with an existing country. Includes geographic coordinates for location-based services.',
  })
  @ApiResponse({
    status: 201,
    description: 'City successfully created',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439013',
        name: 'Mumbai',
        country: {
          _id: '507f1f77bcf86cd799439011',
          name: 'India',
        },
        location: {
          type: 'Point',
          coordinates: [72.8777, 19.076],
        },
        createdAt: '2025-05-28T10:02:00.000Z',
        updatedAt: '2025-05-28T10:02:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid city data or country ID',
    schema: {
      example: {
        message: ['name should not be empty', 'country must be a mongodb id'],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Country not found',
    schema: {
      example: {
        message: 'Country not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async createCity(@Body() createCityDto: CreateCityDto) {
    return this.locationService.createCity(createCityDto);
  }

  @Get('cities')
  @ApiOperation({
    summary: 'Get all cities',
    description:
      'Retrieve a list of all cities in the database. Each city includes its country information and geographic coordinates.',
  })
  @ApiQuery({
    name: 'country',
    description: 'Filter cities by country ID',
    required: false,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all cities',
    schema: {
      example: [
        {
          _id: '507f1f77bcf86cd799439013',
          name: 'Mumbai',
          country: {
            _id: '507f1f77bcf86cd799439011',
            name: 'India',
          },
          location: {
            type: 'Point',
            coordinates: [72.8777, 19.076],
          },
          createdAt: '2025-05-28T10:02:00.000Z',
          updatedAt: '2025-05-28T10:02:00.000Z',
        },
        {
          _id: '507f1f77bcf86cd799439014',
          name: 'Delhi',
          country: {
            _id: '507f1f77bcf86cd799439011',
            name: 'India',
          },
          location: {
            type: 'Point',
            coordinates: [77.1025, 28.7041],
          },
          createdAt: '2025-05-28T10:03:00.000Z',
          updatedAt: '2025-05-28T10:03:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getAllCities(@Query('country') country?: string) {
    return this.locationService.getAllCities();
  }

  @Get('cities/nearby')
  @ApiOperation({
    summary: 'Find nearby cities',
    description:
      'Find cities within a specified radius of given coordinates. Useful for location-based accommodation and food service searches.',
  })
  @ApiQuery({
    name: 'longitude',
    description: 'Longitude coordinate',
    example: 72.8777,
    type: Number,
  })
  @ApiQuery({
    name: 'latitude',
    description: 'Latitude coordinate',
    example: 19.076,
    type: Number,
  })
  @ApiQuery({
    name: 'radius',
    description: 'Search radius in kilometers',
    example: 50,
    type: Number,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully found nearby cities',
    schema: {
      example: [
        {
          _id: '507f1f77bcf86cd799439013',
          name: 'Mumbai',
          country: {
            _id: '507f1f77bcf86cd799439011',
            name: 'India',
          },
          location: {
            type: 'Point',
            coordinates: [72.8777, 19.076],
          },
          distance: 0,
          createdAt: '2025-05-28T10:02:00.000Z',
          updatedAt: '2025-05-28T10:02:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid coordinates or radius',
    schema: {
      example: {
        message: 'Invalid coordinates provided',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async findNearbyCities(
    @Query('longitude') longitude: number,
    @Query('latitude') latitude: number,
    @Query('radius') radius: number = 50,
  ) {
    return this.locationService.findNearbyCities(longitude, latitude, radius);
  }

  @Get('cities/:id')
  @ApiOperation({
    summary: 'Get a city by ID',
    description:
      'Retrieve a specific city by its MongoDB ObjectId. Includes country information and geographic coordinates.',
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the city',
    example: '507f1f77bcf86cd799439013',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the city',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439013',
        name: 'Mumbai',
        country: {
          _id: '507f1f77bcf86cd799439011',
          name: 'India',
        },
        location: {
          type: 'Point',
          coordinates: [72.8777, 19.076],
        },
        createdAt: '2025-05-28T10:02:00.000Z',
        updatedAt: '2025-05-28T10:02:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'City not found',
    schema: {
      example: {
        message: 'City not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid city ID format',
    schema: {
      example: {
        message: 'Invalid ObjectId format',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getCityById(@Param('id') id: string) {
    return this.locationService.getCityById(id);
  }

  @Get('countries/:id/cities')
  @ApiOperation({
    summary: 'Get all cities in a country',
    description:
      'Retrieve all cities that belong to a specific country. Useful for populating location dropdowns or filtering accommodations by region.',
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the country',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all cities in the country',
    schema: {
      example: [
        {
          _id: '507f1f77bcf86cd799439013',
          name: 'Mumbai',
          country: {
            _id: '507f1f77bcf86cd799439011',
            name: 'India',
          },
          location: {
            type: 'Point',
            coordinates: [72.8777, 19.076],
          },
          createdAt: '2025-05-28T10:02:00.000Z',
          updatedAt: '2025-05-28T10:02:00.000Z',
        },
        {
          _id: '507f1f77bcf86cd799439014',
          name: 'Delhi',
          country: {
            _id: '507f1f77bcf86cd799439011',
            name: 'India',
          },
          location: {
            type: 'Point',
            coordinates: [77.1025, 28.7041],
          },
          createdAt: '2025-05-28T10:03:00.000Z',
          updatedAt: '2025-05-28T10:03:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Country not found',
    schema: {
      example: {
        message: 'Country not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid country ID format',
    schema: {
      example: {
        message: 'Invalid ObjectId format',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getCitiesByCountry(@Param('id') countryId: string) {
    return this.locationService.getCitiesByCountry(countryId);
  }

  @Put('cities/:id')
  @ApiOperation({
    summary: 'Update a city by ID',
    description:
      "Update an existing city's information. Only provide fields that need to be updated. If changing the country, ensure the new country exists.",
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the city to update',
    example: '507f1f77bcf86cd799439013',
  })
  @ApiResponse({
    status: 200,
    description: 'City successfully updated',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439013',
        name: 'Updated Mumbai',
        country: {
          _id: '507f1f77bcf86cd799439011',
          name: 'India',
        },
        location: {
          type: 'Point',
          coordinates: [72.8777, 19.076],
        },
        createdAt: '2025-05-28T10:02:00.000Z',
        updatedAt: '2025-05-28T11:02:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'City not found or country not found (if updating country)',
    schema: {
      example: {
        message: 'City not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or city ID format',
    schema: {
      example: {
        message: ['name should not be empty', 'country must be a mongodb id'],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async updateCity(
    @Param('id') id: string,
    @Body() updateCityDto: UpdateCityDto,
  ) {
    return this.locationService.updateCity(id, updateCityDto);
  }

  @Delete('cities/:id')
  @ApiOperation({
    summary: 'Delete a city by ID',
    description:
      'Delete a city from the database. This will remove all accommodations and related data in this city.',
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the city to delete',
    example: '507f1f77bcf86cd799439013',
  })
  @ApiResponse({
    status: 200,
    description: 'City successfully deleted',
    schema: {
      example: {
        message: 'City deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'City not found',
    schema: {
      example: {
        message: 'City not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid city ID format',
    schema: {
      example: {
        message: 'Invalid ObjectId format',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async deleteCity(@Param('id') id: string) {
    return this.locationService.deleteCity(id);
  }
}
