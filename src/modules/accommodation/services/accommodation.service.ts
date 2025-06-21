import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
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
import { Booking, BookingStatus } from '../../booking/schema/booking.schema';

@Injectable()
export class AccommodationService {
  constructor(
    @InjectModel(Accommodation.name)
    private readonly accommodationModel: Model<Accommodation>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly locationService: LocationService,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<Booking>,
  ) {}

  private getCacheKey(id: string): string {
    return `accommodation:${id}`;
  }

  private async clearCache(id: string): Promise<void> {
    await this.cacheManager.del(this.getCacheKey(id));
    await this.cacheManager.del('accommodations:all');
  }

  async create(
    createAccommodationDto: CreateAccommodationDto,
    landlord: User,
  ): Promise<Accommodation> {
    const city = await this.locationService.getCityById(
      createAccommodationDto.city,
    );

    if (!city) {
      throw new NotFoundException(
        `City with ID ${createAccommodationDto.city} not found`,
      );
    }

    if (!landlord) {
      throw new ForbiddenException('Authentication required');
    }

    // For testing without authentication, use a default landlord ID if landlord is undefined
    const landlordId = landlord._id;

    const accommodation = new this.accommodationModel({
      ...createAccommodationDto,
      landlord: landlordId,
      coordinates: {
        type: 'Point',
        coordinates: city.location.coordinates,
      },
    });

    const savedAccommodation = await accommodation.save();
    const populatedAccommodation = await savedAccommodation.populate([
      'city',
      'landlord',
    ]);
    await this.cacheManager.del('accommodations:all');
    return populatedAccommodation;
  }

  async findAll(searchDto: SearchAccommodationDto): Promise<Accommodation[]> {
    const cacheKey = 'accommodations:all';
    const cached = await this.cacheManager.get<Accommodation[]>(cacheKey);

    if (cached) {
      return cached;
    }

    interface PriceQuery {
      $gte?: number;
      $lte?: number;
    }

    interface AccommodationQuery {
      city?: string;
      price?: PriceQuery;
    }

    const query: AccommodationQuery = {};

    if (searchDto.city) {
      query.city = searchDto.city;
    }

    if (searchDto.minPrice !== undefined || searchDto.maxPrice !== undefined) {
      const priceQuery: PriceQuery = {};
      if (searchDto.minPrice !== undefined) {
        priceQuery.$gte = searchDto.minPrice;
      }
      if (searchDto.maxPrice !== undefined) {
        priceQuery.$lte = searchDto.maxPrice;
      }
      query.price = priceQuery;
    }

    const accommodations = await this.accommodationModel
      .find(query)
      .populate(['city', 'landlord'])
      .exec();

    await this.cacheManager.set(cacheKey, accommodations);
    return accommodations;
  }

  async findNearby(
    lat: number,
    lng: number,
    radius: number = 5000,
  ): Promise<Accommodation[]> {
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    if ((accommodation.landlord as any)._id?.toString() !== userId) {
      throw new ForbiddenException(
        'You can only update your own accommodations',
      );
    }

    if (updateAccommodationDto.city) {
      const city = await this.locationService.getCityById(
        updateAccommodationDto.city,
      );
      if (!city) {
        throw new NotFoundException(
          `City with ID ${updateAccommodationDto.city} not found`,
        );
      }
      updateAccommodationDto['coordinates'] = {
        type: 'Point',
        coordinates: city.location.coordinates,
      };
    }

    const updated = await this.accommodationModel
      .findByIdAndUpdate(id, updateAccommodationDto, { new: true })
      .populate(['city', 'landlord'])
      .exec();

    if (!updated) {
      throw new NotFoundException(`Accommodation with ID ${id} not found`);
    }

    await this.clearCache(id);
    return updated;
  }

  async remove(id: string, userId: string): Promise<void> {
    const accommodation = await this.accommodationModel.findById(id);

    if (!accommodation) {
      throw new NotFoundException(`Accommodation with ID ${id} not found`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    if ((accommodation.landlord as any)._id?.toString() !== userId) {
      throw new ForbiddenException(
        'You can only delete your own accommodations',
      );
    }

    await this.accommodationModel.findByIdAndDelete(id).exec();
    await this.clearCache(id);
  }

  // Landlord dashboard methods
  async findByLandlord(landlordId: string): Promise<Accommodation[]> {
    const cacheKey = `accommodations:landlord:${landlordId}`;
    const cached = await this.cacheManager.get<Accommodation[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const accommodations = await this.accommodationModel
      .find({ landlord: landlordId })
      .populate(['city', 'landlord'])
      .exec();

    await this.cacheManager.set(cacheKey, accommodations, 3600);
    return accommodations;
  }

  async getLandlordDashboard(landlordId: string) {
    // Get all accommodations by this landlord
    const accommodations = await this.findByLandlord(landlordId);

    // Get total bookings for all accommodations
    const accommodationIds = accommodations.map((acc) => acc._id);
    const totalBookings = await this.bookingModel.countDocuments({
      accommodation: { $in: accommodationIds },
    });

    // Get active bookings (confirmed status)
    const activeBookings = await this.bookingModel.countDocuments({
      accommodation: { $in: accommodationIds },
      status: BookingStatus.CONFIRMED,
    });

    // Get booking statistics by status
    const bookingsByStatus = await this.bookingModel.aggregate([
      { $match: { accommodation: { $in: accommodationIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Get recent bookings
    const recentBookings = await this.bookingModel
      .find({ accommodation: { $in: accommodationIds } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate(['user', 'accommodation'])
      .exec();

    return {
      totalAccommodations: accommodations.length,
      totalBookings,
      activeBookings,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      bookingsByStatus: bookingsByStatus.reduce(
        (acc: Record<string, number>, curr: any) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const statusId = curr._id as string;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const count = curr.count as number;
          acc[statusId] = count;
          return acc;
        },
        {},
      ),
      recentBookings,
      accommodations: accommodations.map((acc) => ({
        _id: acc._id,
        title: acc.title,
        city: acc.city,
        price: acc.price,
      })),
    };
  }

  async getLandlordBookings(landlordId: string) {
    // Get all accommodations by this landlord
    const accommodations = await this.findByLandlord(landlordId);
    const accommodationIds = accommodations.map((acc) => acc._id);

    // Get all bookings for these accommodations
    const bookings = await this.bookingModel
      .find({ accommodation: { $in: accommodationIds } })
      .populate(['user', 'accommodation'])
      .sort({ createdAt: -1 })
      .exec();

    return bookings;
  }

  async getLandlordAnalytics(landlordId: string, days = 30) {
    // Get all accommodations by this landlord
    const accommodations = await this.findByLandlord(landlordId);
    const accommodationIds = accommodations.map((acc) => acc._id);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get bookings within date range
    const bookings = await this.bookingModel
      .find({
        accommodation: { $in: accommodationIds },
        createdAt: { $gte: startDate, $lte: endDate },
      })
      .exec();

    // Group bookings by date
    const bookingsByDate: Record<string, number> = {};
    bookings.forEach((booking) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const createdAt = (booking as any).createdAt as Date;
      const dateStr = createdAt.toISOString().split('T')[0];
      if (!bookingsByDate[dateStr]) {
        bookingsByDate[dateStr] = 0;
      }
      bookingsByDate[dateStr]++;
    });

    // Group bookings by accommodation
    const bookingsByAccommodation = await this.bookingModel.aggregate([
      { $match: { accommodation: { $in: accommodationIds } } },
      { $group: { _id: '$accommodation', count: { $sum: 1 } } },
    ]);

    // Get accommodation details for each ID
    const accommodationDetails = await Promise.all(
      bookingsByAccommodation.map(async (item: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const accommodationId = item._id as string;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const bookingCount = item.count as number;
        const accommodation =
          await this.accommodationModel.findById(accommodationId);

        if (!accommodation) {
          return null; // Skip if accommodation not found
        }

        return {
          _id: accommodation._id,
          title: accommodation.title,
          bookings: bookingCount,
        };
      }),
    );

    // Filter out null values
    const validAccommodationDetails = accommodationDetails.filter(
      (detail) => detail !== null,
    );

    return {
      totalBookings: bookings.length,
      bookingsByDate,
      bookingsByAccommodation: validAccommodationDetails,
      timeframe: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days,
      },
    };
  }
}
