import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../../user/decorators/roles.decorator';
import { UserRole } from '../../user/schema/user.schema';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../user/guards/roles.guard';
import { AnalyticsService } from '../services/analytics.service';

@Controller('food-providers/analytics')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.FOOD_PROVIDER)
export class FoodProviderAnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  async getMyAnalytics(@Req() req, @Query('timeRange') timeRange?: string) {
    const providerId = req.user._id || req.user.id;
    return await this.analyticsService.getFoodProviderAnalytics(providerId, timeRange);
  }
} 