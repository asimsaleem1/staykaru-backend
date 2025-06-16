import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking } from '../schema/booking.schema';

@Injectable()
export class RealtimeService implements OnModuleInit {
  constructor(
    private configService: ConfigService,
    @InjectModel(Booking.name) private readonly bookingModel: Model<Booking>,
  ) {}

  async onModuleInit() {
    console.log('Realtime service initialized with MongoDB');
    // MongoDB change streams can be implemented here if needed
  }

  async broadcastBookingUpdate(bookingId: string, data: any) {
    await this.bookingModel.findByIdAndUpdate(bookingId, data);
  }
}
