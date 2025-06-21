import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../../../interfaces/request.interface';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getUserNotifications(@Request() req: AuthenticatedRequest) {
    return this.notificationService.getUserNotifications(req.user._id);
  }

  @Post(':id/read')
  async markAsRead(
    @Request() req: AuthenticatedRequest,
    @Param('id') notificationId: string,
  ) {
    await this.notificationService.markAsRead(req.user._id, notificationId);
    return { success: true };
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: AuthenticatedRequest) {
    const count = await this.notificationService.countUnreadNotifications(
      req.user._id.toString(),
    );
    return { count };
  }

  @Put('mark-all-read')
  async markAllAsRead(@Request() req: AuthenticatedRequest) {
    await this.notificationService.markAllAsRead(req.user._id.toString());
    return { message: 'All notifications marked as read' };
  }
}
