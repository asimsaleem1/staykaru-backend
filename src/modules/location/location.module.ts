import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LocationController } from './controller/location.controller';
import { MapController } from './controller/map.controller';
import { LocationService } from './services/location.service';
import { MapService } from './services/map.service';
import { Country, CountrySchema } from './schema/country.schema';
import { City, CitySchema } from './schema/city.schema';
import { GoogleMapsAdapter } from './adapters/google-maps.adapter';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Country.name, schema: CountrySchema },
      { name: City.name, schema: CitySchema },
    ]),
  ],
  controllers: [LocationController, MapController],
  providers: [LocationService, MapService, GoogleMapsAdapter],
  exports: [LocationService, MapService],
})
export class LocationModule {}
