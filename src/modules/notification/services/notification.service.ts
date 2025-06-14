import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationGateway } from '../gateways/notification.gateway';
import { Notification, NotificationDocument } from '../schema/notification.schema';
import { AnalyticsEvent, AnalyticsEventDocument } from '../schema/analytics-event.schema';

export interface NotificationDto {
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(AnalyticsEvent.name) private analyticsEventModel: Model<AnalyticsEventDocument>,
    private notificationGateway: NotificationGateway,
  ) {}

  async sendNotification(userId: string, notification: NotificationDto): Promise<void> {
    try {
      // Store notification in MongoDB
      const newNotification = new this.notificationModel({
        userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data || {},
        read: false,
      });
      
      await newNotification.save();

      // Send real-time notification
      this.notificationGateway.sendNotificationToUser(userId, notification);
    } catch (error) {
      console.error('Error storing notification:', error);
    }
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      await this.notificationModel.findOneAndUpdate(
        { _id: notificationId, userId },
        { read: true }
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async getUserNotifications(userId: string): Promise<any[]> {
    try {
      return await this.notificationModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async logAnalyticsEvent(
    eventType: string,
    userId: string,
    metadata: Record<string, any> = {},
  ): Promise<void> {
    try {
      const analyticsEvent = new this.analyticsEventModel({
        eventType,
        userId,
        metadata,
      });
      
      await analyticsEvent.save();
    } catch (error) {
      console.error('Error logging analytics event:', error);
    }
  }
}