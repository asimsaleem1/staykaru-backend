import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { User } from '../../user/schema/user.schema';
import { UserService } from '../../user/services/user.service';
import { Document } from 'mongoose';

interface RequestWithUser extends Request {
  user: User & Document;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      example: {
        message: 'Registration successful',
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '507f1f77bcf86cd799439011',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'student',
          phone: '1234567890',
          countryCode: '+92',
          gender: 'male',
          profileImage: 'https://example.com/profile.jpg',
          identificationType: 'cnic',
          identificationNumber: '12345-6789012-3',
          isEmailVerified: true,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        message: 'Login successful',
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '507f1f77bcf86cd799439011',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'student',
          phone: '1234567890',
          countryCode: '+92',
          gender: 'male',
          profileImage: 'https://example.com/profile.jpg',
          identificationType: 'cnic',
          identificationNumber: '12345-6789012-3',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Request() req: RequestWithUser) {
    return {
      user: req.user,
    };
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user dashboard data with role-based access' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDashboard(@Request() req: RequestWithUser) {
    const userId = req.user._id.toString();
    return this.authService.getUserDashboardData(userId);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async changePassword(
    @Request() req: RequestWithUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const userId = req.user._id.toString();
    return this.authService.changePassword(userId, changePasswordDto);
  }

  @Get('check-access/:resourceType')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Check if user can access a specific resource' })
  @ApiResponse({
    status: 200,
    description: 'Access check completed',
    schema: {
      example: {
        hasAccess: true,
        message: 'Access granted',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async checkAccess(
    @Request() req: RequestWithUser,
    @Param('resourceType') resourceType: string,
  ) {
    const userId = req.user._id.toString();
    const hasAccess = await this.authService.canUserAccessResource(
      userId,
      resourceType,
    );

    return {
      hasAccess,
      message: hasAccess ? 'Access granted' : 'Access denied',
      userRole: req.user.role,
      resourceType,
    };
  }
}
