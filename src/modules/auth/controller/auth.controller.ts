import { Controller, Post, Body, UseGuards, Get, Param, Request, Headers, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { Enable2FADto } from '../dto/enable-2fa.dto';
import { Verify2FADto } from '../dto/verify-2fa.dto';
import { AuthGuard } from '../guards/auth.guard';
import { FirebaseService } from '../services/firebase.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Post('register')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Register a new user (requires Firebase token)' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      example: {
        success: true,
        message: 'Registration successful',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          firebaseUid: 'firebase_uid_string',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          isVerified: false,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Invalid Firebase token' })
  async register(@Body() registerDto: RegisterDto, @Request() req) {
    // The AuthGuard will decode the Firebase token and add user info to req.user
    const firebaseUser = req.user;
    return this.authService.register(registerDto, firebaseUser.uid);
  }

  @Post('login')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Login user with Firebase token' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    schema: {
      example: {
        success: true,
        message: 'Login successful',
        user: {
          id: 'mongodb_user_id',
          firebaseUid: 'firebase_uid',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          isVerified: true,
        },
        accessToken: 'firebase_jwt_token',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Request() req, @Headers('authorization') authHeader: string) {
    const firebaseUser = req.user;
    const token = authHeader?.replace('Bearer ', '');
    return this.authService.loginWithFirebase(firebaseUser, token);
  }

  @Post('2fa/enable')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Enable 2FA for user' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  async enable2FA(@Body() enable2FADto: Enable2FADto) {
    return this.authService.enable2FA(enable2FADto);
  }

  @Post('2fa/verify')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Verify 2FA OTP' })
  @ApiResponse({ status: 200, description: '2FA verified successfully' })
  async verify2FA(@Body() verify2FADto: Verify2FADto) {
    return this.authService.verify2FA(verify2FADto);
  }

  @Get('test-credentials/:role')
  @ApiOperation({ 
    summary: 'Get test user credentials for development',
    description: 'Returns test user credentials for different roles. Use these to manually register and test the system.'
  })
  @ApiResponse({
    status: 200,
    description: 'Test credentials provided',
    schema: {
      example: {
        message: 'Test student credentials for manual testing',
        credentials: {
          email: 'student.test@university.edu',
          password: 'StudentPass123!',
          name: 'Test Student',
          role: 'student',
        },
        note: 'Register this user manually using /auth/register endpoint',
      },
    },
  })
  async getTestCredentials(@Param('role') role: string) {
    return this.authService.createTestUser(role);
  }

  @Post('sync-user')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Sync current user to database' })
  @ApiResponse({
    status: 200,
    description: 'User synced to database successfully',
    schema: {
      example: {
        message: 'User synced to database successfully',
        user: {
          id: '507f1f77bcf86cd799439011',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'landlord',
        },
      },
    },
  })
  async syncUser(@Body() body: { name: string; role: string }, @Request() req) {
    const firebaseUser = req.user;
    return this.authService.syncUserToDatabase(
      firebaseUser.uid,
      firebaseUser.email,
      body.name || firebaseUser.name,
      body.role || firebaseUser.role,
    );
  }

  @Get('protected')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Protected route example' })
  @ApiResponse({
    status: 200,
    description: 'Protected route accessed successfully',
    schema: {
      example: {
        message: 'This is a protected route',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async protected() {
    return { message: 'This is a protected route' };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  async getCurrentUser(@Request() req) {
    const firebaseUser = req.user;
    const user = await this.authService.getCurrentUser(firebaseUser.uid);
    return user;
  }

  @Get('check-email')
  @ApiOperation({ summary: 'Check if email is available' })
  @ApiResponse({
    status: 200,
    description: 'Email availability status',
    schema: {
      example: {
        available: true,
        message: 'Email is available'
      }
    }
  })
  async checkEmail(@Query('email') email: string) {
    return this.authService.checkEmailAvailability(email);
  }
}