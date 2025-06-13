import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, GeocodeResult } from '@googlemaps/google-maps-services-js';

@Injectable()
export class GoogleMapsAdapter {
  private client: Client;

  constructor(private configService: ConfigService) {
    this.client = new Client({});
  }

  async geocode(address: string): Promise<GeocodeResult[]> {
    const response = await this.client.geocode({
      params: {
        address,
        key: this.configService.get<string>('GOOGLE_MAPS_API_KEY'),
      },
    });

    return response.data.results;
  }

  async getNearbyPlaces(lat: number, lng: number, radius: number = 5000): Promise<any[]> {
    const response = await this.client.placesNearby({
      params: {
        location: { lat, lng },
        radius,
        key: this.configService.get<string>('GOOGLE_MAPS_API_KEY'),
      },
    });

    return response.data.results;
  }
}