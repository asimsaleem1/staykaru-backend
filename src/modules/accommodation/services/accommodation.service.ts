import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Accommodation } from '../schema/accommodation.schema';
import { CreateAccommodationDto } from '../dto/create-accommodation.dto';
import { UpdateAccommodationDto } from '../dto/update-accommodation.dto';
import { SearchAccommodationDto } from '../dto/search-accommodation.dto';
import { User } from '../../user/schema/user.schema';
import { LocationService } from '../../location/services/location.service';

@Injectable()
export class AccommodationService {
  constructor(
    @InjectModel(Accommodation.name)
    private readonly accommodationModel: Model<Accommodation>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly locationService: LocationService,
  ) {}

  private getCacheKey(id: string): string {
    return `accommodation:${id}`;
  }

  private async clearCache(id: string): Promise<void> {
    await this.cacheManager.del(this.getCacheKey(id));
    await this.cacheManager.del('accommodations:all');
  }

  async create(createAccommodationDto: CreateAccommodationDto, landlord: User): Promise<Accommodation> {
    const city = await this.locationService.getCityById(createAccommodationDto.city);
    
    // For testing without authentication, use a default landlord ID if landlord is undefined
    const landlordId = landlord?._id || '68371305d8af1d5cc606fdf0'; // Test landlord ID created above
    
    const accommodation = new this.accommodationModel({
      ...createAccommodationDto,
      landlord: landlordId,
      coordinates: {
        type: 'Point',
        coordinates: city.location.coordinates,
      },
    });

    const savedAccommodation = await (await accommodation.save()).populate(['city', 'landlord']);
    await this.cacheManager.del('accommodations:all');
    return savedAccommodation;
  }

  async findAll(searchDto: SearchAccommodationDto): Promise<Accommodation[]> {
    const cacheKey = 'accommodations:all';
    const cached = await this.cacheManager.get<Accommodation[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const query: any = {};

    if (searchDto.city) {
      query.city = searchDto.city;
    }

    if (searchDto.minPrice !== undefined || searchDto.maxPrice !== undefined) {
      query.price = {};
      if (searchDto.minPrice !== undefined) {
        query.price.$gte = searchDto.minPrice;
      }
      if (searchDto.maxPrice !== undefined) {
        query.price.$lte = searchDto.maxPrice;
      }
    }

    const accommodations = await this.accommodationModel
      .find(query)
      .populate(['city', 'landlord'])
      .exec();

    await this.cacheManager.set(cacheKey, accommodations);
    return accommodations;
  }

  async findNearby(lat: number, lng: number, radius: number = 5000): Promise<Accommodation[]> {
    return this.accommodationModel
      .find({
        coordinates: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat],
            },
            $maxDistance: radius,
          },
        },
      })
      .populate(['city', 'landlord'])
      .exec();
  }

  async findOne(id: string): Promise<Accommodation> {
    const cacheKey = this.getCacheKey(id);
    const cached = await this.cacheManager.get<Accommodation>(cacheKey);

    if (cached) {
      return cached;
    }

    const accommodation = await this.accommodationModel
      .findById(id)
      .populate(['city', 'landlord'])
      .exec();

    if (!accommodation) {
      throw new NotFoundException(`Accommodation with ID ${id} not found`);
    }

    await this.cacheManager.set(cacheKey, accommodation);
    return accommodation;
  }

  async update(
    id: string,
    updateAccommodationDto: UpdateAccommodationDto,
    userId: string,
  ): Promise<Accommodation> {
    const accommodation = await this.accommodationModel.findById(id);

    if (!accommodation) {
      throw new NotFoundException(`Accommodation with ID ${id} not found`);
    }

    if (accommodation.landlord.toString() !== userId) {
      throw new ForbiddenException('You can only update your own accommodations');
    }

    if (updateAccommodationDto.city) {
      const city = await this.locationService.getCityById(updateAccommodationDto.city);
      updateAccommodationDto['coordinates'] = {
        type: 'Point',
        coordinates: city.location.coordinates,
      };
    }

    const updated = await this.accommodationModel
      .findByIdAndUpdate(id, updateAccommodationDto, { new: true })
      .populate(['city', 'landlord'])
      .exec();

    await this.clearCache(id);
    return updated;
  }

  async remove(id: string, userId: string): Promise<void> {
    const accommodation = await this.accommodationModel.findById(id);

    if (!accommodation) {
      throw new NotFoundException(`Accommodation with ID ${id} not found`);
    }

    if (accommodation.landlord.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own accommodations');
    }

    await this.accommodationModel.findByIdAndDelete(id).exec();
    await this.clearCache(id);
  }
}