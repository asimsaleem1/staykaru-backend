import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserService } from '../../user/services/user.service';
import { UserRole } from '../../user/schema/user.schema';

@Injectable()
export class FoodProviderGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const supabaseUser = request.user;

    if (!supabaseUser || !supabaseUser.id) {
      throw new ForbiddenException('Authentication required');
    }

    // Fetch the user from the database using the Supabase user ID
    const dbUser = await this.userService.findBySupabaseUserId(supabaseUser.id);

    if (!dbUser) {
      throw new ForbiddenException('User not found in database');
    }

    if (dbUser.role !== UserRole.FOOD_PROVIDER) {
      throw new ForbiddenException('Only food providers can perform this action');
    }

    // Attach the complete user information to the request
    request.user = dbUser;
    return true;
  }
}