import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class RealtimeService implements OnModuleInit {
  private supabase;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('supabase.url'),
      this.configService.get<string>('supabase.key'),
    );
  }

  async onModuleInit() {
    this.supabase
      .channel('bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, 
        (payload) => {
          console.log('Change received!', payload);
        }
      )
      .subscribe();
  }

  async broadcastBookingUpdate(bookingId: string, data: any) {
    await this.supabase
      .from('bookings')
      .update(data)
      .eq('id', bookingId);
  }
}