import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Booking, BookingStatus } from '../schema/booking.schema';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { UpdateBookingStatusDto } from '../dto/update-booking-status.dto';
import { AccommodationService } from '../../accommodation/services/accommodation.service';
import { RealtimeService } from './realtime.service';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private readonly bookingModel: Model<Booking>,
    private readonly accommodationService: AccommodationService,
    private readonly realtimeService: RealtimeService,
    private readonly configService: ConfigService,
  ) {}

  async create(createBookingDto: CreateBookingDto, userId: string): Promise<Booking> {
    const accommodation = await this.accommodationService.findOne(
      createBookingDto.accommodation,
    );

    const isAvailable = accommodation.availability.some(
      (date) => date.toISOString().split('T')[0] === createBookingDto.start_date,
    );

    if (!isAvailable) {
      throw new BadRequestException('Selected dates are not available');
    }

    const booking = new this.bookingModel({
      ...createBookingDto,
      user: userId,
      status: BookingStatus.PENDING,
    });

    const savedBooking = await (await booking.save()).populate(['user', 'accommodation']);

    await this.realtimeService.broadcastBookingUpdate(savedBooking._id.toString(), {
      status: savedBooking.status,
      user_id: userId,
    });

    await this.supabase.from('booking_analytics').insert({
      booking_id: savedBooking._id.toString(),
      user_id: userId,
      accommodation_id: accommodation._id.toString(),
      status: savedBooking.status,
      total_price: accommodation.price,
      duration_days: Math.ceil(
        (new Date(createBookingDto.end_date).getTime() - 
         new Date(createBookingDto.start_date).getTime()) / (1000 * 60 * 60 * 24)
      ),
    });

    return savedBooking;
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingModel.find().populate(['user', 'accommodation']).exec();
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingModel
      .findById(id)
      .populate(['user', 'accommodation'])
      .exec();

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  async updateStatus(
    id: string,
    updateBookingStatusDto: UpdateBookingStatusDto,
    landlordId: string,
  ): Promise<Booking> {
    const booking = await this.bookingModel
      .findById(id)
      .populate(['user', 'accommodation'])
      .exec();

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    if (booking.accommodation.landlord.toString() !== landlordId) {
      throw new BadRequestException('Only the landlord can update booking status');
    }

    booking.status = updateBookingStatusDto.status;
    const updatedBooking = await booking.save();

    // Notify the student about the booking status change
    await this.supabase.from('booking_notifications').insert({
      booking_id: booking._id.toString(),
      user_id: booking.user.toString(),
      message: `Your booking status has been updated to ${updateBookingStatusDto.status}`,
    });

    return updatedBooking;
  }

  async findByUser(userId: string): Promise<Booking[]> {
    return this.bookingModel
      .find({ user: userId })
      .populate(['user', 'accommodation'])
      .exec();
  }

  async findByLandlord(landlordId: string): Promise<Booking[]> {
    const bookings = await this.bookingModel
      .find()
      .populate(['user', 'accommodation'])
      .exec();

    return bookings.filter(
      (booking) => booking.accommodation.landlord.toString() === landlordId,
    );
  }
}