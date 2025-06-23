import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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

  async create(
    createBookingDto: CreateBookingDto,
    userId: string,
  ): Promise<Booking> {
    const accommodation = await this.accommodationService.findOne(
      createBookingDto.accommodation,
    );

    // Check availability if accommodation has availability array
    if (accommodation.availability && accommodation.availability.length > 0) {
      const isAvailable = accommodation.availability.some(
        (date) =>
          date.toISOString().split('T')[0] === createBookingDto.checkInDate,
      );

      if (!isAvailable) {
        throw new BadRequestException('Selected dates are not available');
      }
    }

    const checkInDate = new Date(createBookingDto.checkInDate);
    const checkOutDate = new Date(createBookingDto.checkOutDate);
    const durationDays = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    const booking = new this.bookingModel({
      accommodation: createBookingDto.accommodation,
      user: userId,
      start_date: createBookingDto.checkInDate,
      end_date: createBookingDto.checkOutDate,
      total_guests: createBookingDto.guests || 1,
      total_amount: createBookingDto.totalAmount || accommodation.price * durationDays,
      payment_method: createBookingDto.paymentMethod || 'card',
      special_requests: createBookingDto.specialRequests || '',
      status: BookingStatus.PENDING,
      total_price: createBookingDto.totalAmount || accommodation.price * durationDays,
      duration_days: durationDays,
    });

    const savedBooking = await (
      await booking.save()
    ).populate(['user', 'accommodation']);

    await this.realtimeService.broadcastBookingUpdate(
      savedBooking._id.toString(),
      {
        status: savedBooking.status,
        user_id: userId,
      },
    );

    // Analytics tracking is now handled through MongoDB
    try {
      await this.bookingModel.db.collection('booking_analytics').insertOne({
        bookingId: savedBooking._id.toString(),
        userId: userId,
        accommodationId: accommodation._id.toString(),
        status: savedBooking.status,
        createdAt: new Date(),
        startDate: savedBooking.start_date,
        endDate: savedBooking.end_date,
        totalPrice: savedBooking.total_amount,
      });
    } catch (error) {
      console.error('Error logging booking analytics:', error);
    }

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
      throw new BadRequestException(
        'Only the landlord can update booking status',
      );
    }

    booking.status = updateBookingStatusDto.status;
    const updatedBooking = await booking.save();

    // Notify the student about the booking status change
    // Notification is now handled through MongoDB
    try {
      await this.bookingModel.db.collection('booking_notifications').insertOne({
        bookingId: booking._id.toString(),
        userId: booking.user.toString(),
        message: `Your booking status has been updated to ${updateBookingStatusDto.status}`,
        createdAt: new Date(),
        read: false,
      });
    } catch (error) {
      console.error('Error creating booking notification:', error);
    }

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

  async getLandlordStats(landlordId: string): Promise<any> {
    // Mock implementation for now
    return {
      totalBookings: 0,
      activeBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
    };
  }

  async getLandlordRevenue(landlordId: string): Promise<any> {
    // Mock implementation for now
    return {
      totalRevenue: 0,
      monthlyRevenue: [],
      averageBookingValue: 0,
    };
  }
}
