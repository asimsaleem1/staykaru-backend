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
    return this.accommodationModel
      .find({
        landlord: landlordId,
      })
      .populate('landlord', 'firstName lastName email phone')
      .populate('city', 'name')
      .exec();
  }

  async getLandlordDashboard(landlordId: string): Promise<any> {
    const totalAccommodations = await this.accommodationModel.countDocuments({
      landlord: landlordId,
    });

    const pendingAccommodations = await this.accommodationModel.countDocuments({
      landlord: landlordId,
      approvalStatus: 'pending',
    });

    const approvedAccommodations = await this.accommodationModel.countDocuments(
      {
        landlord: landlordId,
        approvalStatus: 'approved',
        isActive: true,
      },
    );

    return {
      totalAccommodations,
      pendingAccommodations,
      approvedAccommodations,
      rejectedAccommodations:
        totalAccommodations - pendingAccommodations - approvedAccommodations,
    };
  }

  async getLandlordActivities(landlordId: string): Promise<any[]> {
    const recentAccommodations = await this.accommodationModel
      .find({
        landlord: landlordId,
      })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('title approvalStatus isActive updatedAt')
      .exec();

    return recentAccommodations.map((acc) => ({
      type: 'accommodation',
      title: acc.title,
      status: acc.approvalStatus,
      isActive: acc.isActive,
      date: new Date(),
    }));
  }

  // Admin methods
  async findPendingAccommodations(): Promise<Accommodation[]> {
    return this.accommodationModel
      .find({ approvalStatus: 'pending' })
      .populate(['city', 'landlord'])
      .sort({ createdAt: -1 })
      .exec();
  }

  async getAllForAdmin() {
    return this.accommodationModel
      .find({})
      .populate(['city', 'landlord', 'approvedBy'])
      .sort({ createdAt: -1 })
      .exec();
  }

  async approveAccommodation(accommodationId: string, adminId: string) {
    const accommodation =
      await this.accommodationModel.findById(accommodationId);

    if (!accommodation) {
      throw new NotFoundException(
        `Accommodation with ID ${accommodationId} not found`,
      );
    }

    accommodation.approvalStatus = 'approved';
    accommodation.isActive = true;
    accommodation.approvedBy = adminId as any;
    accommodation.approvedAt = new Date();
    accommodation.rejectionReason = undefined;

    await accommodation.save();
    await this.clearCache(accommodationId);

    return {
      message: 'Accommodation approved successfully',
      accommodation: await accommodation.populate([
        'city',
        'landlord',
        'approvedBy',
      ]),
    };
  }

  async rejectAccommodation(
    accommodationId: string,
    reason: string,
    adminId: string,
  ) {
    const accommodation =
      await this.accommodationModel.findById(accommodationId);

    if (!accommodation) {
      throw new NotFoundException(
        `Accommodation with ID ${accommodationId} not found`,
      );
    }

    accommodation.approvalStatus = 'rejected';
    accommodation.isActive = false;
    accommodation.approvedBy = adminId as any;
    accommodation.approvedAt = new Date();
    accommodation.rejectionReason = reason;

    await accommodation.save();
    await this.clearCache(accommodationId);

    return {
      message: 'Accommodation rejected successfully',
      accommodation: await accommodation.populate([
        'city',
        'landlord',
        'approvedBy',
      ]),
    };
  }

  async toggleActiveStatus(accommodationId: string) {
    const accommodation =
      await this.accommodationModel.findById(accommodationId);

    if (!accommodation) {
      throw new NotFoundException(
        `Accommodation with ID ${accommodationId} not found`,
      );
    }

    // Only allow toggling if accommodation is approved
    if (accommodation.approvalStatus !== 'approved') {
      throw new ForbiddenException(
        'Can only toggle status of approved accommodations',
      );
    }

    accommodation.isActive = !accommodation.isActive;
    await accommodation.save();
    await this.clearCache(accommodationId);

    return {
      message: `Accommodation ${accommodation.isActive ? 'activated' : 'deactivated'} successfully`,
      accommodation: await accommodation.populate(['city', 'landlord']),
    };
  }

  async getAccommodationForAdmin(accommodationId: string) {
    const accommodation = await this.accommodationModel
      .findById(accommodationId)
      .populate(['city', 'landlord', 'approvedBy'])
      .exec();

    if (!accommodation) {
      throw new NotFoundException(
        `Accommodation with ID ${accommodationId} not found`,
      );
    }

    // Get additional statistics for admin review
    const stats = await this.getAccommodationStats(accommodationId);

    return {
      accommodation,
      stats,
    };
  }

  private async getAccommodationStats(accommodationId: string) {
    // Get booking statistics
    const totalBookings = await this.bookingModel.countDocuments({
      accommodation: accommodationId,
    });

    const activeBookings = await this.bookingModel.countDocuments({
      accommodation: accommodationId,
      status: BookingStatus.CONFIRMED,
    });

    const completedBookings = await this.bookingModel.countDocuments({
      accommodation: accommodationId,
      status: BookingStatus.COMPLETED,
    });

    return {
      totalBookings,
      activeBookings,
      completedBookings,
    };
  }
}
