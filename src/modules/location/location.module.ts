import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LocationController } from './controller/location.controller';
import { LocationService } from './services/location.service';
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
  controllers: [LocationController],
  providers: [LocationService, GoogleMapsAdapter],
  exports: [LocationService],
})
export class LocationModule {}
