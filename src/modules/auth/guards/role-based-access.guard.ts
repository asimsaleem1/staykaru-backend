import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../user/schema/user.schema';

@Injectable()
export class RoleBasedAccessGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Get the resource type from the request path or query parameters
    const resourceType = this.getResourceType(request);
    const userId = user._id?.toString() || user.id?.toString();

    // Check role-based access permissions
    return this.checkUserAccess(user.role, resourceType, userId, request);
  }

  private getResourceType(request: any): string {
    const path = request.route?.path || request.url;
    
    if (path.includes('/accommodations')) return 'accommodations';
    if (path.includes('/food-options')) return 'food-options';
    if (path.includes('/bookings')) return 'bookings';
    if (path.includes('/orders')) return 'orders';
    if (path.includes('/revenue')) return 'revenue';
    if (path.includes('/analytics')) return 'analytics';
    if (path.includes('/dashboard')) return 'dashboard';
    
    return 'general';
  }

  private checkUserAccess(
    userRole: UserRole,
    resourceType: string,
    userId: string,
    request: any,
  ): boolean {
    switch (userRole) {
      case UserRole.STUDENT:
        return this.checkStudentAccess(resourceType, userId, request);
      case UserRole.LANDLORD:
        return this.checkLandlordAccess(resourceType, userId, request);
      case UserRole.FOOD_PROVIDER:
        return this.checkFoodProviderAccess(resourceType, userId, request);
      case UserRole.ADMIN:
        return true; // Admin has access to everything
      default:
        return false;
    }
  }

  private checkStudentAccess(
    resourceType: string,
    userId: string,
    request: any,
  ): boolean {
    switch (resourceType) {
      case 'accommodations':
      case 'food-options':
        // Students can view all accommodations and food options
        return true;
      case 'bookings':
      case 'orders':
        // Students can only access their own bookings and orders
        return this.isOwnResource(userId, request);
      case 'dashboard':
        // Students can access their own dashboard
        return true;
      case 'revenue':
      case 'analytics':
        // Students cannot access revenue or analytics
        return false;
      default:
        return true;
    }
  }

  private checkLandlordAccess(
    resourceType: string,
    userId: string,
    request: any,
  ): boolean {
    switch (resourceType) {
      case 'accommodations':
        // Landlords can manage their own accommodations
        return this.isOwnResource(userId, request);
      case 'bookings':
        // Landlords can view bookings for their properties
        return this.isOwnResource(userId, request);
      case 'revenue':
      case 'analytics':
        // Landlords can view their own revenue and analytics
        return this.isOwnResource(userId, request);
      case 'dashboard':
        // Landlords can access their own dashboard
        return true;
      case 'food-options':
      case 'orders':
        // Landlords cannot access food-related resources
        return false;
      default:
        return false;
    }
  }

  private checkFoodProviderAccess(
    resourceType: string,
    userId: string,
    request: any,
  ): boolean {
    switch (resourceType) {
      case 'food-options':
        // Food providers can manage their own food options
        return this.isOwnResource(userId, request);
      case 'orders':
        // Food providers can view orders for their food items
        return this.isOwnResource(userId, request);
      case 'revenue':
      case 'analytics':
        // Food providers can view their own revenue and analytics
        return this.isOwnResource(userId, request);
      case 'dashboard':
        // Food providers can access their own dashboard
        return true;
      case 'accommodations':
      case 'bookings':
        // Food providers cannot access accommodation-related resources
        return false;
      default:
        return false;
    }
  }

  private isOwnResource(userId: string, request: any): boolean {
    // Check if the resource belongs to the current user
    const resourceUserId = request.params?.userId || 
                          request.query?.userId || 
                          request.body?.userId ||
                          request.params?.id; // Sometimes the user ID is in the 'id' parameter

    // If no specific user ID is provided in the request, assume it's for the current user
    if (!resourceUserId) {
      return true;
    }

    return resourceUserId === userId;
  }
}
