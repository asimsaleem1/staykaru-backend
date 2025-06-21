import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleMapsAdapter } from '../adapters/google-maps.adapter';
import { LocationService } from './location.service';
import { PlaceSearchDto } from '../dto/map.dto';

export interface Location {
  latitude: number;
  longitude: number;
}

export interface MapSearchParams {
  location: Location;
  radius?: number;
  type?: string;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface RouteInfo {
  distance: string;
  duration: string;
  steps: any[];
  polyline: string;
}

export interface TrackingUpdate {
  orderId: string;
  currentLocation: Location;
  estimatedArrival?: string;
  status: string;
  timestamp: Date;
}

@Injectable()
export class MapService {
  private readonly logger = new Logger(MapService.name);

  constructor(
    private readonly googleMapsAdapter: GoogleMapsAdapter,
    private readonly configService: ConfigService,
    private readonly locationService: LocationService,
  ) {}

  /**
   * Search for properties near a location
   */
  async searchNearbyProperties(params: MapSearchParams): Promise<any[]> {
    try {
      const { location, radius = 5000, type = 'lodging', keyword } = params;
      
      // Search for nearby places using Google Places API
      const places = await this.googleMapsAdapter.getNearbyPlaces(
        location.latitude,
        location.longitude,
        radius,
        type,
        keyword,
      );

      // Enhance results with additional property information
      return places.map(place => ({
        id: place.place_id,
        name: place.name,
        location: {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
        },
        address: place.vicinity || place.formatted_address,
        rating: place.rating,
        priceLevel: place.price_level,
        types: place.types,
        photos: place.photos?.map(photo => ({
          reference: photo.photo_reference,
          width: photo.width,
          height: photo.height,
        })),
        openingHours: place.opening_hours,
        distance: this.calculateDistance(
          location.latitude,
          location.longitude,
          place.geometry.location.lat,
          place.geometry.location.lng,
        ),
      }));
    } catch (error) {
      this.logger.error('Error searching nearby properties', error);
      throw new Error('Failed to search nearby properties');
    }
  }

  /**
   * Search for places by text query
   */
  async searchPlaces(placeSearchDto: PlaceSearchDto): Promise<any[]> {
    try {
      return await this.googleMapsAdapter.searchPlaces(
        placeSearchDto.query,
        placeSearchDto.location,
        placeSearchDto.radius,
      );
    } catch (error) {
      this.logger.error('Error searching places', error);
      throw new Error('Failed to search places');
    }
  }

  /**
   * Find nearby cities using the location service
   */
  async findNearbyCities(longitude: number, latitude: number, radius: number = 50): Promise<any[]> {
    try {
      return await this.locationService.findNearbyCities(longitude, latitude, radius);
    } catch (error) {
      this.logger.error('Error finding nearby cities', error);
      throw new Error('Failed to find nearby cities');
    }
  }

  /**
   * Get route between two locations
   */
  async getRoute(
    origin: Location,
    destination: Location,
    mode: 'driving' | 'walking' | 'transit' = 'driving',
  ): Promise<RouteInfo> {
    try {
      const route = await this.googleMapsAdapter.getDirections(
        origin,
        destination,
        mode,
      );

      if (!route.routes.length) {
        throw new Error('No route found');
      }

      const leg = route.routes[0].legs[0];
      return {
        distance: leg.distance.text,
        duration: leg.duration.text,
        steps: leg.steps,
        polyline: route.routes[0].overview_polyline.points,
      };
    } catch (error) {
      this.logger.error('Error getting route', error);
      throw new Error('Failed to get route information');
    }
  }

  /**
   * Get estimated arrival time for delivery
   */
  async getEstimatedArrival(
    from: Location,
    to: Location,
    mode: 'driving' | 'walking' | 'transit' = 'driving',
  ): Promise<string> {
    try {
      const route = await this.getRoute(from, to, mode);
      const now = new Date();
      const arrival = new Date(now.getTime() + this.parseDuration(route.duration));
      return arrival.toISOString();
    } catch (error) {
      this.logger.error('Error calculating estimated arrival', error);
      throw new Error('Failed to calculate estimated arrival time');
    }
  }

  /**
   * Track order location in real-time
   */
  async trackOrder(orderId: string, currentLocation: Location): Promise<TrackingUpdate> {
    try {
      // This would typically involve updating the order location in real-time
      // For now, we'll return a mock tracking update
      const trackingUpdate: TrackingUpdate = {
        orderId,
        currentLocation,
        status: 'in_transit',
        timestamp: new Date(),
      };

      // You can enhance this to store tracking history in database
      this.logger.log(`Order ${orderId} tracked at location: ${currentLocation.latitude}, ${currentLocation.longitude}`);
      
      return trackingUpdate;
    } catch (error) {
      this.logger.error('Error tracking order', error);
      throw new Error('Failed to track order');
    }
  }

  /**
   * Geocode address to coordinates
   */
  async geocodeAddress(address: string): Promise<Location> {
    try {
      const results = await this.googleMapsAdapter.geocode(address);
      if (!results.length) {
        throw new Error('Address not found');
      }

      const location = results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
      };
    } catch (error) {
      this.logger.error('Error geocoding address', error);
      throw new Error('Failed to geocode address');
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(location: Location): Promise<string> {
    try {
      const results = await this.googleMapsAdapter.reverseGeocode(location);
      if (!results.length) {
        throw new Error('Location not found');
      }

      return results[0].formatted_address;
    } catch (error) {
      this.logger.error('Error reverse geocoding', error);
      throw new Error('Failed to reverse geocode location');
    }
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private parseDuration(duration: string): number {
    // Parse duration string like "15 mins" or "1 hour 30 mins" to milliseconds
    const minutes = duration.match(/(\d+)\s*min/);
    const hours = duration.match(/(\d+)\s*hour/);
    
    let totalMinutes = 0;
    if (hours) totalMinutes += parseInt(hours[1]) * 60;
    if (minutes) totalMinutes += parseInt(minutes[1]);
    
    return totalMinutes * 60 * 1000; // Convert to milliseconds
  }
}
