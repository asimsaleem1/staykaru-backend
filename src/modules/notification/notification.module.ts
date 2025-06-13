import { Module } from '@nestjs/common';
import { NotificationService } from './services/notification.service';
import { NotificationGateway } from './gateways/notification.gateway';

@Module({
  providers: [NotificationService, NotificationGateway],
  exports: [NotificationService],
})
export class NotificationModule {}