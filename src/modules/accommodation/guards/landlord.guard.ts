import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserRole } from '../../user/schema/user.schema';

interface RequestWithUser extends Request {
  user: {
    _id: string;
    role: UserRole;
    [key: string]: any;
  };
}

@Injectable()
export class LandlordGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user || !user._id) {
      throw new ForbiddenException('Authentication required');
    }

    if (user.role !== UserRole.LANDLORD && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only landlords can perform this action');
    }

    return true;
  }
}
