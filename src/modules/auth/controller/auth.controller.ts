import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
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
import { FacebookLoginDto } from '../dto/facebook-login.dto';
import { GoogleLoginDto } from '../dto/google-login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { User } from '../../user/schema/user.schema';
import { UserService } from '../../user/services/user.service';
import { ChangePasswordDto } from '../dto/change-password.dto';
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
    // Use the user object directly from the JWT token
    return {
      user: req.user,
    };
  }

  @Post('facebook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with Facebook access token' })
  @ApiResponse({
    status: 200,
    description: 'Facebook login successful',
    schema: {
      example: {
        message: 'Facebook login successful',
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '507f1f77bcf86cd799439011',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'student',
          phone: '1234567890',
          countryCode: '+1',
          gender: 'male',
          profileImage: 'https://example.com/profile.jpg',
          socialProvider: 'facebook',
          isEmailVerified: true,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Invalid Facebook token' })
  async facebookLogin(@Body() facebookLoginDto: FacebookLoginDto) {
    return this.authService.facebookLogin(facebookLoginDto);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with Google ID token' })
  @ApiResponse({
    status: 200,
    description: 'Google login successful',
    schema: {
      example: {
        message: 'Google login successful',
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '507f1f77bcf86cd799439011',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'student',
          phone: '1234567890',
          countryCode: '+1',
          gender: 'male',
          profileImage: 'https://example.com/profile.jpg',
          socialProvider: 'google',
          isEmailVerified: true,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Invalid Google token' })
  async googleLogin(@Body() googleLoginDto: GoogleLoginDto) {
    return this.authService.googleLogin(googleLoginDto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    schema: {
      example: {
        message: 'Password changed successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async changePassword(
    @Request() req: RequestWithUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.authService.changePassword(
      String(req.user.id),
      changePasswordDto,
    );
    return { message: 'Password changed successfully' };
  }
}
