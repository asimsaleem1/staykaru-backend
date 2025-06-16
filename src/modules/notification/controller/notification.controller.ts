import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
  @Get()
  async getUserNotifications(@Request() req) {
    return this.notificationService.getUserNotifications(req.user.sub);
  }
  @Post(':id/read')
  async markAsRead(@Request() req, @Param('id') notificationId: string) {
    await this.notificationService.markAsRead(req.user.sub, notificationId);
    return { success: true };
  }
}
