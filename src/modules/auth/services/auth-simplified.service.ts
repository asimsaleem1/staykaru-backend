import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { UserService } from '../../user/services/user.service';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { UserRole } from '../../user/schema/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      // Check if user already exists
      const existingUser = await this.userService.findByEmail(
        registerDto.email,
      );
      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }

      // Hash password
      const hashedPassword = await this.hashPassword(registerDto.password);

      // Create user with hashed password
      const createUserDto: CreateUserDto = {
        name: registerDto.name,
        email: registerDto.email,
        password: hashedPassword,
        role: registerDto.role,
        phone: registerDto.phone,
        countryCode: registerDto.countryCode,
        gender: registerDto.gender,
        profileImage: registerDto.profileImage,
        identificationType: registerDto.identificationType,
        identificationNumber: registerDto.identificationNumber,
        isEmailVerified: true, // Simplified - no email verification needed
        isActive: true,
      };

      const user = await this.userService.create(createUserDto);

      // Generate JWT token
      const token = this.generateToken(user);

      return {
        message: 'Registration successful',
        access_token: token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          countryCode: user.countryCode,
          gender: user.gender,
          profileImage: user.profileImage,
          identificationType: user.identificationType,
          identificationNumber: user.identificationNumber,
          isEmailVerified: true,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Registration failed: ' + error.message);
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    try {
      // Find user by email
      const user = await this.userService.findByEmail(email);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new UnauthorizedException('Account is deactivated');
      }

      // Validate password
      const isPasswordValid = await this.validatePassword(password, user.password);
      if (!isPasswordValid) {
        // Increment failed login attempts
        await this.userService.incrementFailedLoginAttempts(user._id.toString());
        throw new UnauthorizedException('Invalid credentials');
      }

      // Reset failed login attempts and update last login
      await this.userService.resetFailedLoginAttempts(user._id.toString());
      await this.userService.updateLastLoginDate(user._id.toString());

      // Generate JWT token
      const token = this.generateToken(user);

      return {
        message: 'Login successful',
        access_token: token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          countryCode: user.countryCode,
          gender: user.gender,
          profileImage: user.profileImage,
          identificationType: user.identificationType,
          identificationNumber: user.identificationNumber,
          university: user.university,
          studentId: user.studentId,
          businessName: user.businessName,
          address: user.address,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Login failed: ' + error.message);
    }
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    try {
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Validate current password
      const isCurrentPasswordValid = await this.validatePassword(
        currentPassword,
        user.password,
      );
      if (!isCurrentPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await this.hashPassword(newPassword);

      // Update password
      await this.userService.updatePassword(userId, hashedNewPassword);

      return {
        message: 'Password changed successfully',
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Password change failed: ' + error.message);
    }
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user || !user.isActive) {
      return null;
    }

    const isPasswordValid = await this.validatePassword(password, user.password);
    if (isPasswordValid) {
      return user;
    }
    return null;
  }

  async getUserById(id: string) {
    return this.userService.findById(id);
  }

  async updateUserRole(userId: string, role: UserRole) {
    return this.userService.updateRole(userId, role);
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  private async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  private generateToken(user: any): string {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    };
    return this.jwtService.sign(payload);
  }

  // User dashboard access control methods
  async getUserDashboardData(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const baseData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
    };

    switch (user.role) {
      case UserRole.STUDENT:
        return {
          ...baseData,
          university: user.university,
          studentId: user.studentId,
          program: user.program,
          yearOfStudy: user.yearOfStudy,
          // Student can see accommodations and food options
          canViewAccommodations: true,
          canViewFoodOptions: true,
          canMakeBookings: true,
          canMakeOrders: true,
        };

      case UserRole.LANDLORD:
        return {
          ...baseData,
          address: user.address,
          businessLicense: user.businessLicense,
          yearsOfExperience: user.yearsOfExperience,
          propertyTypes: user.propertyTypes,
          // Landlord can manage their accommodations
          canManageAccommodations: true,
          canViewBookings: true,
          canViewRevenue: true,
          canViewAnalytics: true,
        };

      case UserRole.FOOD_PROVIDER:
        return {
          ...baseData,
          businessName: user.businessName,
          address: user.address,
          foodLicense: user.foodLicense,
          cuisineTypes: user.cuisineTypes,
          operatingHours: user.operatingHours,
          // Food provider can manage their food options
          canManageFoodOptions: true,
          canViewOrders: true,
          canViewRevenue: true,
          canViewAnalytics: true,
        };

      default:
        return baseData;
    }
  }

  // Check if user can access specific resource
  async canUserAccessResource(userId: string, resourceType: string, resourceId?: string) {
    const user = await this.userService.findById(userId);
    if (!user) {
      return false;
    }

    switch (user.role) {
      case UserRole.STUDENT:
        // Students can access accommodations and food options but only their own bookings/orders
        return ['accommodations', 'food-options', 'my-bookings', 'my-orders'].includes(resourceType);

      case UserRole.LANDLORD:
        // Landlords can manage their own accommodations and view their bookings
        return ['my-accommodations', 'my-bookings', 'my-revenue', 'my-analytics'].includes(resourceType);

      case UserRole.FOOD_PROVIDER:
        // Food providers can manage their own food options and view their orders
        return ['my-food-options', 'my-orders', 'my-revenue', 'my-analytics'].includes(resourceType);

      default:
        return false;
    }
  }
}
