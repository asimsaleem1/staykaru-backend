import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { Enable2FADto } from '../dto/enable-2fa.dto';
import { Verify2FADto } from '../dto/verify-2fa.dto';
import { UserRole } from '../../user/schema/user.schema';
import { UserService } from '../../user/services/user.service';
import { CreateUserDto } from '../../user/dto/create-user.dto';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    this.supabase = createClient(
      this.configService.get<string>('supabase.url'),
      this.configService.get<string>('supabase.key'),
    );
  }

  async register(registerDto: RegisterDto) {
    const { data, error } = await this.supabase.auth.signUp({
      email: registerDto.email,
      password: registerDto.password,
      options: {
        data: {
          name: registerDto.name,
          role: registerDto.role,
        },
        emailRedirectTo: undefined, // Disable email confirmation for development
      },
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    // Create corresponding MongoDB record if Supabase registration is successful
    if (data.user) {
      try {
        const createUserDto: CreateUserDto = {
          name: registerDto.name,
          email: registerDto.email,
          role: registerDto.role as UserRole,
        };

        await this.userService.create(createUserDto, data.user.id);
      } catch (dbError) {
        // If MongoDB user creation fails, we should ideally clean up Supabase user
        // For now, we'll log the error and continue
        console.error('Failed to create MongoDB user record:', dbError);
      }
    }

    return {
      message: 'Registration successful. Please check your email for confirmation.',
      user: data.user,
      confirmationRequired: !data.user?.email_confirmed_at,
      session: data.session,
    };
  }

  async login(loginDto: LoginDto) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: loginDto.email,
      password: loginDto.password,
    });

    if (error) {
      // Provide more specific error handling
      if (error.message.includes('Email not confirmed')) {
        throw new UnauthorizedException(
          'Email not confirmed. Please check your email for confirmation link, or contact support for development testing.',
        );
      }
      throw new UnauthorizedException(error.message);
    }

    return {
      message: 'Login successful',
      session: data.session,
      user: data.user,
      access_token: data.session?.access_token,
    };
  }

  async enable2FA(enable2FADto: Enable2FADto) {
    const { error } = await this.supabase.auth.signInWithOtp({
      email: enable2FADto.email,
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return {
      message: 'OTP sent successfully',
    };
  }

  async verify2FA(verify2FADto: Verify2FADto) {
    const { data, error } = await this.supabase.auth.verifyOtp({
      email: verify2FADto.email,
      token: verify2FADto.otp,
      type: 'email',
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return {
      message: '2FA verified successfully',
      session: data.session,
    };
  }

  // Development only: Create test users with confirmed emails
  async createTestUser(role: string) {
    const testUsers = {
      [UserRole.STUDENT]: {
        email: 'student.test@university.edu',
        password: 'StudentPass123!',
        name: 'Test Student',
        role: UserRole.STUDENT,
      },
      [UserRole.LANDLORD]: {
        email: 'landlord.test@property.com',
        password: 'LandlordPass123!',
        name: 'Test Landlord',
        role: UserRole.LANDLORD,
      },
      [UserRole.FOOD_PROVIDER]: {
        email: 'foodprovider.test@restaurant.com',
        password: 'FoodPass123!',
        name: 'Test Food Provider',
        role: UserRole.FOOD_PROVIDER,
      },
      [UserRole.ADMIN]: {
        email: 'admin.test@staykaro.com',
        password: 'AdminPass123!',
        name: 'Test Admin',
        role: UserRole.ADMIN,
      },
    };

    const testUser = testUsers[role];
    if (!testUser) {
      throw new UnauthorizedException('Invalid test user role');
    }

    // First try to sign up
    const { data: signUpData, error: signUpError } = await this.supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          name: testUser.name,
          role: testUser.role,
        },
      },
    });

    if (signUpError && !signUpError.message.includes('User already registered')) {
      throw new UnauthorizedException(signUpError.message);
    }

    // Create MongoDB record if Supabase user was created
    if (signUpData.user) {
      try {
        const createUserDto: CreateUserDto = {
          name: testUser.name,
          email: testUser.email,
          role: testUser.role as UserRole,
        };

        await this.userService.create(createUserDto, signUpData.user.id);
      } catch (dbError) {
        console.error('Failed to create MongoDB test user record:', dbError);
      }
    }

    // Try to sign in to get session
    const { data: signInData, error: signInError } = await this.supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password,
    });

    // If email not confirmed, return the user data anyway for testing
    if (signInError && signInError.message.includes('Email not confirmed')) {
      return {
        message: `Test ${role} user created but email needs confirmation`,
        user: signUpData.user,
        credentials: {
          email: testUser.email,
          password: testUser.password,
        },
        note: 'For testing: Use these credentials after email confirmation',
      };
    }

    if (signInError) {
      throw new UnauthorizedException(signInError.message);
    }

    return {
      message: `Test ${role} user ready for testing`,
      session: signInData.session,
      user: signInData.user,
      access_token: signInData.session?.access_token,
      credentials: {
        email: testUser.email,
        password: testUser.password,
      },
    };
  }

  // Helper method to sync existing Supabase users to MongoDB
  async syncUserToDatabase(supabaseUserId: string, userEmail: string, userName: string, userRole: string) {
    try {
      const existingUser = await this.userService.findBySupabaseUserId(supabaseUserId);
      
      if (!existingUser) {
        const createUserDto: CreateUserDto = {
          name: userName,
          email: userEmail,
          role: userRole as UserRole,
        };

        const newUser = await this.userService.create(createUserDto, supabaseUserId);
        return {
          message: 'User synced to database successfully',
          user: newUser,
        };
      }

      return {
        message: 'User already exists in database',
        user: existingUser,
      };
    } catch (error) {
      throw new UnauthorizedException(`Failed to sync user to database: ${error.message}`);
    }
  }
}