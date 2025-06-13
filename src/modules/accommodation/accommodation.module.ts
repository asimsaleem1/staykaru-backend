import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { AccommodationController } from './controller/accommodation.controller';
import { AccommodationService } from './services/accommodation.service';
import { Accommodation, AccommodationSchema } from './schema/accommodation.schema';
import { LocationModule } from '../location/location.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Accommodation.name, schema: AccommodationSchema },
    ]),
    CacheModule.register(),
    LocationModule,
    UserModule,
  ],
  controllers: [AccommodationController],
  providers: [AccommodationService],
  exports: [AccommodationService],
})
export class AccommodationModule {}