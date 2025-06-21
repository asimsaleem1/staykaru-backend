import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
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
import { SocialLoginDto } from '../dto/social-login.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { StudentRegistrationDto } from '../dto/student-registration.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { User } from '../../user/schema/user.schema';
import { UserService } from '../../user/services/user.service';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { Document } from 'mongoose';
import { LandlordRegistrationDto } from '../dto/landlord-registration.dto';
import { FoodProviderRegistrationDto } from '../dto/food-provider-registration.dto';

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
  @Post('social-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login with social media provider (unified endpoint for students)',
  })
  @ApiResponse({
    status: 200,
    description: 'Social login successful',
    schema: {
      example: {
        message: 'Social login successful',
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
          isRegistrationComplete: false,
        },
        needsRegistration: true,
        redirectTo: '/student/complete-registration',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid provider or missing required fields',
  })
  @ApiResponse({ status: 401, description: 'Invalid social media token' })
  async socialLogin(@Body() socialLoginDto: SocialLoginDto) {
    const { provider, token, role } = socialLoginDto;

    let result;
    switch (provider) {
      case 'google':
        result = await this.authService.googleLogin({ idToken: token });
        break;
      case 'facebook':
        result = await this.authService.facebookLogin({ accessToken: token });
        break;
      default:
        throw new BadRequestException(
          'Only Google and Facebook login supported',
        );
    }

    // Set the selected role
    const userId = String(result.user?.id || result.user?._id);
    const currentRole = result.user?.role;
    
    if (currentRole !== role) {
      await this.authService.updateUserRole(userId, role);
      // Update the result object
      if (result.user) {
        result.user.role = role;
      }
    }

    // Check if registration is complete based on role
    let isRegistrationComplete = false;
    let redirectTo = '';

    switch (role) {
      case 'student':
        isRegistrationComplete = Boolean(
          result.user?.university &&
            result.user?.studentId &&
            result.user?.phone,
        );
        redirectTo = isRegistrationComplete
          ? '/student/dashboard'
          : '/student/complete-registration';
        break;

      case 'landlord':
        isRegistrationComplete = Boolean(
          result.user?.address &&
            result.user?.identificationType &&
            result.user?.identificationNumber &&
            result.user?.phone,
        );
        redirectTo = isRegistrationComplete
          ? '/landlord/dashboard'
          : '/landlord/complete-registration';
        break;

      case 'food_provider':
        isRegistrationComplete = Boolean(
          result.user?.businessName &&
            result.user?.address &&
            result.user?.identificationType &&
            result.user?.identificationNumber &&
            result.user?.phone,
        );
        redirectTo = isRegistrationComplete
          ? '/food-provider/dashboard'
          : '/food-provider/complete-registration';
        break;

      default:
        throw new BadRequestException('Invalid role selected');
    }
    
    return {
      token: result.token,
      user: result.user,
      needsRegistration: !isRegistrationComplete,
      redirectTo,
      role,
    };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent successfully',
    schema: {
      example: {
        message: 'Password reset email sent successfully',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.forgotPassword(forgotPasswordDto.email);
    return { message: 'Password reset email sent successfully' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    schema: {
      example: {
        message: 'Password reset successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
    return { message: 'Password reset successfully' };
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

  @Post('complete-student-registration')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete student registration after social login',
  })
  @ApiResponse({
    status: 200,
    description: 'Student registration completed successfully',
    schema: {
      example: {
        message: 'Student registration completed successfully',
        user: {
          id: '507f1f77bcf86cd799439011',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'student',
          university: 'University of California, Berkeley',
          studentId: 'STU123456',
          phone: '+1-1234567890',
          isRegistrationComplete: true,
        },
        redirectTo: '/student/dashboard',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async completeStudentRegistration(
    @Request() req: RequestWithUser,
    @Body() studentRegistrationDto: StudentRegistrationDto,
  ) {
    const userId = String(req.user.id || req.user._id);
    const updatedUser = await this.authService.completeStudentRegistration(
      userId,
      studentRegistrationDto,
    );

    return {
      message: 'Student registration completed successfully',
      user: updatedUser,
      redirectTo: '/student/dashboard',
    };
  }

  @Post('complete-landlord-registration')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete landlord registration after social login',
  })
  @ApiResponse({
    status: 200,
    description: 'Landlord registration completed successfully',
    schema: {
      example: {
        message: 'Landlord registration completed successfully',
        user: {
          id: '507f1f77bcf86cd799439011',
          name: 'John Doe',
          email: 'john.doe@example.com',
          role: 'landlord',
          registrationComplete: true,
          phone: '+1234567890',
          address: '123 Main Street, City',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async completeLandlordRegistration(
    @Request() req: RequestWithUser,
    @Body() registrationDto: LandlordRegistrationDto,
  ) {
    return await this.authService.completeLandlordRegistration(
      String(req.user.id),
      registrationDto,
    );
  }

  @Post('complete-food-provider-registration')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete food provider registration after social login',
  })
  @ApiResponse({
    status: 200,
    description: 'Food provider registration completed successfully',
    schema: {
      example: {
        message: 'Food provider registration completed successfully',
        user: {
          id: '507f1f77bcf86cd799439011',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          role: 'food_provider',
          registrationComplete: true,
          phone: '+1234567890',
          businessName: 'Delicious Food Corner',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async completeFoodProviderRegistration(
    @Request() req: RequestWithUser,
    @Body() registrationDto: FoodProviderRegistrationDto,
  ) {
    return await this.authService.completeFoodProviderRegistration(
      String(req.user.id),
      registrationDto,
    );
  }

  @Get('oauth-status')
  @ApiOperation({ summary: 'Check OAuth configuration status' })
  @ApiResponse({
    status: 200,
    description: 'OAuth configuration status',
    schema: {
      example: {
        google: { configured: true },
        facebook: { configured: true },
        message: 'OAuth providers are configured and ready',
      },
    },
  })
  getOAuthStatus() {
    const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID);
    const facebookConfigured = Boolean(process.env.FACEBOOK_APP_ID);
    
    return {
      google: { configured: googleConfigured },
      facebook: { configured: facebookConfigured },
      message:
        googleConfigured && facebookConfigured
          ? 'OAuth providers are configured and ready'
          : 'Some OAuth providers need configuration. Check your .env file.',
    };
  }
}
