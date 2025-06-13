import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { NotificationGateway } from '../gateways/notification.gateway';

export interface Notification {
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}

@Injectable()
export class NotificationService {
  private supabase;

  constructor(
    private configService: ConfigService,
    private notificationGateway: NotificationGateway,
  ) {
    this.supabase = createClient(
      this.configService.get<string>('supabase.url'),
      this.configService.get<string>('supabase.key'),
    );
  }

  async sendNotification(userId: string, notification: Notification): Promise<void> {
    // Store notification in Supabase
    const { error } = await this.supabase.from('notifications').insert({
      user_id: userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data || {},
    });

    if (error) {
      console.error('Error storing notification:', error);
      return;
    }

    // Send real-time notification
    this.notificationGateway.sendNotificationToUser(userId, notification);
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    await this.supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);
  }

  async getUserNotifications(userId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data;
  }

  async logAnalyticsEvent(
    eventType: string,
    userId: string,
    metadata: Record<string, any> = {},
  ): Promise<void> {
    await this.supabase.from('analytics_events').insert({
      event_type: eventType,
      user_id: userId,
      metadata,
    });
  }
}