import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { Enable2FADto } from '../dto/enable-2fa.dto';
import { Verify2FADto } from '../dto/verify-2fa.dto';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      example: {
        message: 'Registration successful',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'john@example.com',
          name: 'John Doe',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    schema: {
      example: {
        message: 'Login successful',
        session: {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          expires_at: '2024-03-21T12:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
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
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: 'landlord',
        },
      },
    },
  })
  async syncUser(@Body() body: { name: string; role: string }) {
    // Note: We'll need to access the request user in the actual implementation
    // For now, returning a placeholder message
    return { message: 'Sync endpoint added - implementation pending' };
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
}