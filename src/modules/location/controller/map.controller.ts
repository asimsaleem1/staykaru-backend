import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MapService } from '../services/map.service';
import {
  MapSearchDto,
  RouteDto,
  GeocodeDto,
  ReverseGeocodeDto,
  PlaceSearchDto,
  TrackOrderDto,
} from '../dto/map.dto';

@ApiTags('maps')
@Controller('maps')
// @UseGuards(AuthGuard) // Temporarily disabled for testing
// @ApiBearerAuth('JWT-auth') // Temporarily disabled for testing
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Post('search/properties')
  @ApiOperation({
    summary: 'Search for properties near a location',
    description:
      'Find accommodations, hotels, and other properties within a specified radius of a location.',
  })
  @ApiResponse({
    status: 200,
    description: 'Properties found successfully',
    schema: {
      example: [
        {
          id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
          name: 'Hotel Example',
          location: {
            latitude: 24.8607,
            longitude: 67.0011,
          },
          address: 'Karachi, Pakistan',
          rating: 4.2,
          priceLevel: 2,
          distance: 1.5,
          photos: [
            {
              reference: 'photo_reference_here',
              width: 400,
              height: 300,
            },
          ],
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid search parameters',
  })
  async searchNearbyProperties(@Body() mapSearchDto: MapSearchDto) {
    return this.mapService.searchNearbyProperties(mapSearchDto);
  }

  @Post('route')
  @ApiOperation({
    summary: 'Get route between two locations',
    description:
      'Calculate the route, distance, and estimated travel time between two points.',
  })
  @ApiResponse({
    status: 200,
    description: 'Route calculated successfully',
    schema: {
      example: {
        distance: '15.2 km',
        duration: '22 mins',
        polyline: 'encoded_polyline_string',
        steps: [
          {
            instruction: 'Head north on Main St',
            distance: '500 m',
            duration: '2 mins',
          },
        ],
      },
    },
  })
  async getRoute(@Body() routeDto: RouteDto) {
    return this.mapService.getRoute(
      routeDto.origin,
      routeDto.destination,
      routeDto.mode,
    );
  }

  @Post('geocode')
  @ApiOperation({
    summary: 'Convert address to coordinates',
    description: 'Get latitude and longitude coordinates for a given address.',
  })
  @ApiResponse({
    status: 200,
    description: 'Address geocoded successfully',
    schema: {
      example: {
        latitude: 24.8607,
        longitude: 67.0011,
      },
    },
  })
  async geocodeAddress(@Body() geocodeDto: GeocodeDto) {
    return this.mapService.geocodeAddress(geocodeDto.address);
  }

  @Post('reverse-geocode')
  @ApiOperation({
    summary: 'Convert coordinates to address',
    description: 'Get formatted address for given latitude and longitude.',
  })
  @ApiResponse({
    status: 200,
    description: 'Coordinates reverse geocoded successfully',
    schema: {
      example: {
        address: 'Karachi, Karachi City, Sindh, Pakistan',
      },
    },
  })
  async reverseGeocode(@Body() reverseGeocodeDto: ReverseGeocodeDto) {
    const address = await this.mapService.reverseGeocode(
      reverseGeocodeDto.location,
    );
    return { address };
  }

  @Post('search/places')
  @ApiOperation({
    summary: 'Search for places by text query',
    description:
      'Search for places using text query, optionally filtered by location and radius.',
  })
  @ApiResponse({
    status: 200,
    description: 'Places found successfully',
    schema: {
      example: [
        {
          place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
          name: 'Restaurant Example',
          formatted_address: 'Karachi, Pakistan',
          geometry: {
            location: {
              lat: 24.8607,
              lng: 67.0011,
            },
          },
          rating: 4.5,
          types: ['restaurant', 'food', 'establishment'],
        },
      ],
    },
  })
  async searchPlaces(@Body() placeSearchDto: PlaceSearchDto) {
    return this.mapService.searchPlaces(placeSearchDto);
  }

  @Post('track-order')
  @ApiOperation({
    summary: 'Track order location',
    description:
      'Update and track the real-time location of an order for delivery tracking.',
  })
  @ApiResponse({
    status: 200,
    description: 'Order tracking updated successfully',
    schema: {
      example: {
        orderId: '507f1f77bcf86cd799439011',
        currentLocation: {
          latitude: 24.8607,
          longitude: 67.0011,
        },
        status: 'in_transit',
        timestamp: '2025-06-21T12:00:00.000Z',
        estimatedArrival: '2025-06-21T12:30:00.000Z',
      },
    },
  })
  async trackOrder(@Body() trackOrderDto: TrackOrderDto) {
    return this.mapService.trackOrder(
      trackOrderDto.orderId,
      trackOrderDto.location,
    );
  }

  @Get('estimated-arrival')
  @ApiOperation({
    summary: 'Get estimated arrival time',
    description:
      'Calculate estimated arrival time between two locations based on current traffic.',
  })
  @ApiQuery({
    name: 'fromLat',
    description: 'Origin latitude',
    example: 24.8607,
  })
  @ApiQuery({
    name: 'fromLng',
    description: 'Origin longitude',
    example: 67.0011,
  })
  @ApiQuery({
    name: 'toLat',
    description: 'Destination latitude',
    example: 24.8615,
  })
  @ApiQuery({
    name: 'toLng',
    description: 'Destination longitude',
    example: 67.0021,
  })
  @ApiQuery({
    name: 'mode',
    description: 'Travel mode',
    example: 'driving',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Estimated arrival time calculated successfully',
    schema: {
      example: {
        estimatedArrival: '2025-06-21T12:30:00.000Z',
      },
    },
  })
  async getEstimatedArrival(
    @Query('fromLat') fromLat: number,
    @Query('fromLng') fromLng: number,
    @Query('toLat') toLat: number,
    @Query('toLng') toLng: number,
    @Query('mode') mode: 'driving' | 'walking' | 'transit' = 'driving',
  ) {
    const from = { latitude: fromLat, longitude: fromLng };
    const to = { latitude: toLat, longitude: toLng };
    const estimatedArrival = await this.mapService.getEstimatedArrival(
      from,
      to,
      mode,
    );
    return { estimatedArrival };
  }

  @Get('nearby-cities')
  @ApiOperation({
    summary: 'Find nearby cities',
    description: 'Get cities within a specified radius of given coordinates.',
  })
  @ApiQuery({
    name: 'lat',
    description: 'Latitude',
    example: 24.8607,
  })
  @ApiQuery({
    name: 'lng',
    description: 'Longitude',
    example: 67.0011,
  })
  @ApiQuery({
    name: 'radius',
    description: 'Search radius in kilometers',
    example: 50,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Nearby cities found successfully',
  })
  async findNearbyCities(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius: number = 50,
  ) {
    // This uses the existing location service method
    return this.mapService.findNearbyCities(lng, lat, radius);
  }
}
