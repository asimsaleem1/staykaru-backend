import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { AuthGuard } from '../../auth/guards/auth.guard';

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getUserNotifications(@Request() req) {
    return this.notificationService.getUserNotifications(req.user.uid);
  }

  @Post(':id/read')
  async markAsRead(@Request() req, @Param('id') notificationId: string) {
    await this.notificationService.markAsRead(req.user.uid, notificationId);
    return { success: true };
  }
}
