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
    console.log('Creating booking with DTO:', JSON.stringify(createBookingDto, null, 2));
    console.log('User ID:', userId);

    try {
      // Get accommodation for validation and pricing
      const accommodation = await this.accommodationService.findOne(
        createBookingDto.accommodation,
      );

      if (!accommodation) {
        throw new NotFoundException(`Accommodation with ID ${createBookingDto.accommodation} not found`);
      }

      console.log('Found accommodation:', accommodation.title);

      const startDate = new Date(createBookingDto.checkInDate);
      const endDate = new Date(createBookingDto.checkOutDate);
      
      // Validate dates
      if (startDate >= endDate) {
        throw new BadRequestException('End date must be after start date');
      }

      const durationDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      // Calculate total amount if not provided
      const totalAmount = createBookingDto.total_amount || (accommodation.price || 100) * durationDays;

      // Create booking with proper schema field names
      const bookingData = {
        accommodation: createBookingDto.accommodation,
        user: userId,
        checkInDate: startDate,
        checkOutDate: endDate,
        total_amount: totalAmount,
        status: BookingStatus.PENDING,
        payment_method: createBookingDto.payment_method,
        special_requests: createBookingDto.special_requests,
        guests: createBookingDto.guests || 1,
      };

      console.log('Creating booking with data:', JSON.stringify(bookingData, null, 2));

      const booking = new this.bookingModel(bookingData);
      const savedBooking = await booking.save();

      console.log('Booking saved successfully:', savedBooking._id);

      // Skip realtime service for now
      // await this.realtimeService.broadcastBookingUpdate(
      //   savedBooking._id.toString(),
      //   {
      //     status: savedBooking.status,
      //     user_id: userId,
      //   },
      // );

      // Simplified analytics tracking
      try {
        await this.bookingModel.db.collection('booking_analytics').insertOne({
          bookingId: savedBooking._id.toString(),
          userId: userId,
          accommodationId: createBookingDto.accommodation,
          status: savedBooking.status,
          createdAt: new Date(),
          startDate: savedBooking.checkInDate,
          endDate: savedBooking.checkOutDate,
          totalPrice: savedBooking.total_amount,
        });
      } catch (error) {
        console.error('Error logging booking analytics:', error);
      }

      // Populate and return
      const populatedBooking = await this.bookingModel
        .findById(savedBooking._id)
        .populate(['user', 'accommodation']);

      return populatedBooking || savedBooking;
    } catch (error) {
      console.error('Error creating booking:', error);
      if (error.name === 'ValidationError') {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
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
