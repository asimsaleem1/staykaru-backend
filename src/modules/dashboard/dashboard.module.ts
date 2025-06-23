import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { BookingModule } from '../booking/booking.module';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [AuthModule, UserModule, BookingModule, OrderModule],
  controllers: [DashboardController],
})
export class DashboardModule {}
