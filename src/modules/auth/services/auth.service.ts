import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { Enable2FADto } from '../dto/enable-2fa.dto';
import { Verify2FADto } from '../dto/verify-2fa.dto';
import { UserRole } from '../../user/schema/user.schema';
import { UserService } from '../../user/services/user.service';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { FirebaseService } from './firebase.service';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private firebaseService: FirebaseService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      // Create user in Firebase
      const userRecord = await this.firebaseService.createUser(
        registerDto.email,
        registerDto.password,
        registerDto.name,
      );

      // Set custom claims for user role
      await this.firebaseService.setCustomUserClaims(userRecord.uid, {
        role: registerDto.role,
      });

      // Create corresponding MongoDB record
      try {
        const createUserDto: CreateUserDto = {
          name: registerDto.name,
          email: registerDto.email,
          role: registerDto.role as UserRole,
        };

        await this.userService.create(createUserDto, userRecord.uid);
      } catch (dbError) {
        // If MongoDB user creation fails, clean up Firebase user
        await this.firebaseService.deleteUser(userRecord.uid);
        console.error('Failed to create MongoDB user record:', dbError);
        throw new BadRequestException('Failed to create user in database');
      }

      return {
        message: 'Registration successful. Please verify your email.',
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          name: userRecord.displayName,
          emailVerified: userRecord.emailVerified,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async login(loginDto: LoginDto) {
    try {
      // For login we need to use the Firebase client SDK in the frontend
      // Here we'll simulate a login by checking if the user exists in Firebase
      const userRecord = await this.firebaseService.getUserByEmail(loginDto.email);
      
      // Verify the user exists in our database
      const user = await this.userService.findByFirebaseUid(userRecord.uid);
      
      if (!user) {
        throw new UnauthorizedException('User not found in database');
      }
      
      return {
        message: 'User exists and can login via frontend Firebase SDK',
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          name: userRecord.displayName,
          emailVerified: userRecord.emailVerified,
        },
        note: 'The actual authentication token should be obtained client-side using Firebase authentication SDK',
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid email or password');
    }
  }

  async enable2FA(enable2FADto: Enable2FADto) {
    try {
      // We'll need to use Firebase Phone Auth in the frontend
      // For now, we'll just return a mock response
      return {
        message: 'To enable 2FA, use Firebase Phone Authentication in the frontend',
        success: true,
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  async verify2FA(verify2FADto: Verify2FADto) {
    try {
      // Firebase handles 2FA verification on the client side
      // For now, we'll just return a mock response
      return {
        message: '2FA verification should be handled by Firebase client SDK',
        success: true,
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
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

    try {
      // Check if user already exists in Firebase
      try {
        const existingUser = await this.firebaseService.getUserByEmail(testUser.email);
        
        // User exists, return their credentials
        return {
          message: `Test ${role} user already exists`,
          credentials: {
            email: testUser.email,
            password: testUser.password,
          },
          note: 'For testing: Use these credentials with Firebase client SDK',
        };
      } catch (notFoundError) {
        // User doesn't exist, create a new one
      }

      // Create new user in Firebase
      const userRecord = await this.firebaseService.createUser(
        testUser.email,
        testUser.password,
        testUser.name,
      );

      // Set custom claims for user role
      await this.firebaseService.setCustomUserClaims(userRecord.uid, {
        role: testUser.role,
      });

      // Create corresponding MongoDB record
      try {
        const createUserDto: CreateUserDto = {
          name: testUser.name,
          email: testUser.email,
          role: testUser.role as UserRole,
        };

        await this.userService.create(createUserDto, userRecord.uid);
      } catch (dbError) {
        console.error('Failed to create MongoDB test user record:', dbError);
      }

      return {
        message: `Test ${role} user created successfully`,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          name: userRecord.displayName,
        },
        credentials: {
          email: testUser.email,
          password: testUser.password,
        },
        note: 'For testing: Use these credentials with Firebase client SDK',
      };
    } catch (error) {
      throw new BadRequestException(`Failed to create test user: ${error.message}`);
    }
  }

  // Helper method to sync existing users to MongoDB
  async syncUserToDatabase(firebaseUid: string, userEmail: string, userName: string, userRole: string) {
    try {
      const existingUser = await this.userService.findByFirebaseUid(firebaseUid);
      
      if (!existingUser) {
        const createUserDto: CreateUserDto = {
          name: userName,
          email: userEmail,
          role: userRole as UserRole,
        };

        const newUser = await this.userService.create(createUserDto, firebaseUid);
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