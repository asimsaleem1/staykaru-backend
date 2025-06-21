import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Client,
  GeocodeResult,
  DirectionsResponse,
  TravelMode,
} from '@googlemaps/google-maps-services-js';

export interface Location {
  latitude: number;
  longitude: number;
}

@Injectable()
export class GoogleMapsAdapter {
  private client: Client;
  private readonly logger = new Logger(GoogleMapsAdapter.name);

  constructor(private configService: ConfigService) {
    this.client = new Client({});
  }

  async geocode(address: string): Promise<GeocodeResult[]> {
    try {
      const response = await this.client.geocode({
        params: {
          address,
          key: this.configService.get<string>('GOOGLE_MAPS_API_KEY'),
        },
      });

      return response.data.results;
    } catch (error) {
      this.logger.error('Geocoding failed', error);
      throw new Error('Failed to geocode address');
    }
  }

  async reverseGeocode(location: Location): Promise<GeocodeResult[]> {
    try {
      const response = await this.client.reverseGeocode({
        params: {
          latlng: `${location.latitude},${location.longitude}`,
          key: this.configService.get<string>('GOOGLE_MAPS_API_KEY'),
        },
      });

      return response.data.results;
    } catch (error) {
      this.logger.error('Reverse geocoding failed', error);
      throw new Error('Failed to reverse geocode location');
    }
  }

  async getNearbyPlaces(
    lat: number,
    lng: number,
    radius: number = 5000,
    type?: string,
    keyword?: string,
  ): Promise<any[]> {
    try {
      const params = {
        location: { lat, lng },
        radius,
        key: this.configService.get<string>('GOOGLE_MAPS_API_KEY'),
        ...(type && { type }),
        ...(keyword && { keyword }),
      };

      const response = await this.client.placesNearby({
        params,
      });

      return response.data.results;
    } catch (error) {
      this.logger.error('Nearby places search failed', error);
      throw new Error('Failed to search nearby places');
    }
  }

  async getDirections(
    origin: Location,
    destination: Location,
    mode: 'driving' | 'walking' | 'transit' = 'driving',
  ): Promise<DirectionsResponse['data']> {
    try {
      const travelModeMap = {
        driving: TravelMode.driving,
        walking: TravelMode.walking,
        transit: TravelMode.transit,
      };

      const response = await this.client.directions({
        params: {
          origin: `${origin.latitude},${origin.longitude}`,
          destination: `${destination.latitude},${destination.longitude}`,
          mode: travelModeMap[mode],
          key: this.configService.get<string>('GOOGLE_MAPS_API_KEY'),
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error('Directions request failed', error);
      throw new Error('Failed to get directions');
    }
  }

  async getPlaceDetails(placeId: string): Promise<any> {
    try {
      const response = await this.client.placeDetails({
        params: {
          place_id: placeId,
          key: this.configService.get<string>('GOOGLE_MAPS_API_KEY'),
          fields: [
            'name',
            'formatted_address',
            'geometry',
            'rating',
            'price_level',
            'photos',
            'opening_hours',
            'formatted_phone_number',
            'website',
            'reviews',
          ],
        },
      });

      return response.data.result;
    } catch (error) {
      this.logger.error('Place details request failed', error);
      throw new Error('Failed to get place details');
    }
  }

  async searchPlaces(
    query: string,
    location?: Location,
    radius?: number,
  ): Promise<any[]> {
    try {
      const params = {
        query,
        key: this.configService.get<string>('GOOGLE_MAPS_API_KEY'),
        ...(location && {
          location: `${location.latitude},${location.longitude}`,
        }),
        ...(radius && { radius }),
      };

      const response = await this.client.textSearch({
        params,
      });

      return response.data.results;
    } catch (error) {
      this.logger.error('Text search failed', error);
      throw new Error('Failed to search places');
    }
  }

  async getDistanceMatrix(
    origins: Location[],
    destinations: Location[],
    mode: 'driving' | 'walking' | 'transit' = 'driving',
  ): Promise<any> {
    try {
      const travelModeMap = {
        driving: TravelMode.driving,
        walking: TravelMode.walking,
        transit: TravelMode.transit,
      };

      const response = await this.client.distancematrix({
        params: {
          origins: origins.map((loc) => `${loc.latitude},${loc.longitude}`),
          destinations: destinations.map(
            (loc) => `${loc.latitude},${loc.longitude}`,
          ),
          mode: travelModeMap[mode],
          key: this.configService.get<string>('GOOGLE_MAPS_API_KEY'),
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error('Distance matrix request failed', error);
      throw new Error('Failed to get distance matrix');
    }
  }
}
