import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserService } from '../../user/services/user.service';
import { UserRole } from '../../user/schema/user.schema';

@Injectable()
export class LandlordGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const firebaseUser = request.user;

    if (!firebaseUser || !firebaseUser.uid) {
      throw new ForbiddenException('Authentication required');
    }

    // Fetch the user from the database using the Firebase user ID
    const dbUser = await this.userService.findByFirebaseUid(firebaseUser.uid);

    if (!dbUser) {
      throw new ForbiddenException('User not found in database');
    }

    if (dbUser.role !== UserRole.LANDLORD) {
      throw new ForbiddenException('Only landlords can perform this action');
    }

    // Attach the complete user information to the request
    request.user = dbUser;
    return true;
  }
}