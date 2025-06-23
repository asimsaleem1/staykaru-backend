import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { SendVerificationDto } from '../dto/send-verification.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { UserService } from '../../user/services/user.service';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { UpdateUserDto } from '../../user/dto/update-user.dto';
import {
  UserRole,
  IdentificationType,
  SocialProvider,
} from '../../user/schema/user.schema';
import { SocialAuthService } from './social-auth.service';
import { OtpService } from './otp.service';
import { EmailService } from '../../email/email.service';
import { FacebookLoginDto } from '../dto/facebook-login.dto';
import { GoogleLoginDto } from '../dto/google-login.dto';
import { StudentRegistrationDto } from '../dto/student-registration.dto';
import { LandlordRegistrationDto } from '../dto/landlord-registration.dto';
import { FoodProviderRegistrationDto } from '../dto/food-provider-registration.dto';

interface ResetTokenPayload {
  email: string;
  type: string;
}

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private jwtService: JwtService,
    private socialAuthService: SocialAuthService,
    private otpService: OtpService,
    private emailService: EmailService,
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

      // Check if we're in development mode
      const isDevelopment = this.configService.get<string>('NODE_ENV') === 'development';

      // Create user with hashed password and email verification based on environment
      const createUserDto: CreateUserDto = {
        name: registerDto.name,
        email: registerDto.email,
        password: hashedPassword, // Store hashed password
        role: registerDto.role,
        phone: registerDto.phone,
        countryCode: registerDto.countryCode,
        gender: registerDto.gender,
        profileImage: registerDto.profileImage,
        identificationType: registerDto.identificationType,
        identificationNumber: registerDto.identificationNumber,
        isEmailVerified: isDevelopment, // Skip email verification in development
      };

      const user = await this.userService.create(createUserDto);

      // Try to send verification email, but don't fail registration if email fails
      if (!isDevelopment) {
        try {
          const otp = this.otpService.generateOtp();
          await this.otpService.storeOtp(user.email, otp, 'email_verification');
          await this.emailService.sendEmailVerification(user.email, otp);
          
          return {
            message:
              'Registration successful. Please check your email to verify your account before logging in.',
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              isEmailVerified: false,
            },
            requiresEmailVerification: true,
          };
        } catch (emailError) {
          // Email sending failed, but user is created - allow bypass in development/staging
          console.warn('Email verification failed, but user was created:', emailError.message);
          
          // Update user to be verified since email failed
          await this.userService.update(user._id as string, { isEmailVerified: true });
          
          return {
            message:
              'Registration successful! Email service is temporarily unavailable, but your account is ready to use.',
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              isEmailVerified: true,
            },
            requiresEmailVerification: false,
          };
        }
      } else {
        // Development mode - no email verification required
        return {
          message:
            'Registration successful! (Development mode: email verification skipped)',
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: true,
          },
          requiresEmailVerification: false,
        };
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Registration failed',
      );
    }
  }

  async login(loginDto: LoginDto) {
    try {
      // Special handling for admin login
      if (loginDto.email === 'assaleemofficial@gmail.com') {
        // Check if it's the specific admin credentials
        if (loginDto.password !== 'admin123') {
          throw new UnauthorizedException('Invalid admin credentials');
        }

        // Create or find admin user
        let adminUser = await this.userService.findByEmail(loginDto.email);

        if (!adminUser) {
          // Create admin user if doesn't exist
          const createAdminDto: CreateUserDto = {
            name: 'Admin',
            email: 'assaleemofficial@gmail.com',
            password: await this.hashPassword('admin123'),
            role: UserRole.ADMIN,
            phone: '0000000000',
            countryCode: '+92',
            gender: 'male',
            profileImage: '',
            identificationType: IdentificationType.CNIC,
            identificationNumber: 'admin-id',
            isEmailVerified: true, // Admin doesn't need email verification
          };
          adminUser = await this.userService.create(createAdminDto);
        } else if (adminUser.role !== UserRole.ADMIN || !adminUser.password) {
          // Update existing user to admin role and set password if needed
          const updateDto: UpdateUserDto = { 
            role: UserRole.ADMIN,
            isEmailVerified: true, // Ensure admin is verified
          };
          if (!adminUser.password) {
            updateDto.password = await this.hashPassword('admin123');
          }
          adminUser = await this.userService.update(
            adminUser._id as string,
            updateDto,
          );
        }

        // Generate JWT token for admin
        const payload = {
          email: adminUser.email,
          sub: adminUser._id,
          role: adminUser.role,
        };

        return {
          message: 'Admin login successful',
          access_token: this.jwtService.sign(payload),
          user: {
            id: adminUser._id,
            name: adminUser.name,
            email: adminUser.email,
            role: adminUser.role,
            phone: adminUser.phone,
            gender: adminUser.gender,
          },
        };
      }

      // Regular user login for non-admin users
      const user = await this.userService.findByEmail(loginDto.email);
      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Prevent non-admin users from accessing admin role
      if (
        user.role === UserRole.ADMIN &&
        loginDto.email !== 'assaleemofficial@gmail.com'
      ) {
        throw new UnauthorizedException('Unauthorized admin access');
      }

      // Check email verification for non-admin users (skip in development mode)
      const isDevelopment = this.configService.get<string>('NODE_ENV') === 'development';
      
      if (user.role !== UserRole.ADMIN && !user.isEmailVerified && !isDevelopment) {
        throw new UnauthorizedException(
          'Please verify your email address before logging in. Check your email for the verification code.',
        );
      }

      // Compare passwords using bcrypt
      const isPasswordValid = await this.comparePasswords(
        loginDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Generate JWT token
      const payload = {
        email: user.email,
        sub: user._id,
        role: user.role,
      };

      return {
        message: 'Login successful',
        access_token: this.jwtService.sign(payload),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          gender: user.gender,
        },
        redirectTo: '/student/dashboard', // Traditional login always redirects to student
      };
    } catch {
      throw new UnauthorizedException('Invalid email or password');
    }
  }

  /**
   * Handle Facebook login
   */
  async facebookLogin(facebookLoginDto: FacebookLoginDto) {
    try {
      // Verify Facebook access token
      const facebookUserData = await this.socialAuthService.verifyFacebookToken(
        facebookLoginDto.accessToken,
      );

      this.socialAuthService.validateSocialUserData(
        facebookUserData,
        'facebook',
      );

      // Check if user exists by Facebook ID
      let user = await this.userService.findByFacebookId(facebookUserData.id);

      if (!user) {
        // Check if user exists by email
        user = await this.userService.findByEmail(facebookUserData.email);

        if (user) {
          // Link Facebook account to existing user
          await this.userService.update(String(user.id), {
            facebookId: facebookUserData.id,
            socialProvider: SocialProvider.FACEBOOK,
            isEmailVerified: true,
          });
        } else {
          // Create new user from Facebook data
          const createUserDto: CreateUserDto = {
            name: facebookUserData.name,
            email: facebookUserData.email,
            password: '', // No password for social login
            role: UserRole.STUDENT, // Default role
            phone: '', // Will be required to complete profile
            countryCode: '+1', // Default country code
            gender: 'other', // Will be required to complete profile
            profileImage: facebookUserData.picture?.data?.url || '',
            identificationType: IdentificationType.CNIC,
            identificationNumber: '',
            facebookId: facebookUserData.id,
            socialProvider: SocialProvider.FACEBOOK,
            isEmailVerified: true,
            isActive: true,
          };

          user = await this.userService.create(createUserDto);
        }
      }

      // Generate JWT token
      const payload = {
        email: user.email,
        sub: String(user.id),
        role: user.role,
      };

      const access_token = this.jwtService.sign(payload);

      return {
        message: 'Facebook login successful',
        access_token,
        user: {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          countryCode: user.countryCode,
          gender: user.gender,
          profileImage: user.profileImage,
          socialProvider: user.socialProvider,
          isEmailVerified: user.isEmailVerified,
        },
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Facebook login failed');
    }
  }

  /**
   * Handle Google login
   */
  async googleLogin(googleLoginDto: GoogleLoginDto) {
    try {
      // Verify Google ID token
      const googleUserData = await this.socialAuthService.verifyGoogleToken(
        googleLoginDto.idToken,
      );

      this.socialAuthService.validateSocialUserData(googleUserData, 'google');

      // Check if user exists by Google ID
      let user = await this.userService.findByGoogleId(googleUserData.sub);

      if (!user) {
        // Check if user exists by email
        user = await this.userService.findByEmail(googleUserData.email);

        if (user) {
          // Link Google account to existing user
          await this.userService.update(String(user.id), {
            googleId: googleUserData.sub,
            socialProvider: SocialProvider.GOOGLE,
            isEmailVerified: googleUserData.email_verified,
          });
        } else {
          // Create new user from Google data
          const createUserDto: CreateUserDto = {
            name: googleUserData.name,
            email: googleUserData.email,
            password: '', // No password for social login
            role: UserRole.STUDENT, // Default role
            phone: '', // Will be required to complete profile
            countryCode: '+1', // Default country code
            gender: 'other', // Will be required to complete profile
            profileImage: googleUserData.picture || '',
            identificationType: IdentificationType.CNIC,
            identificationNumber: '',
            googleId: googleUserData.sub,
            socialProvider: SocialProvider.GOOGLE,
            isEmailVerified: googleUserData.email_verified,
            isActive: true,
          };

          user = await this.userService.create(createUserDto);
        }
      }

      // Generate JWT token
      const payload = {
        email: user.email,
        sub: String(user.id),
        role: user.role,
      };

      const access_token = this.jwtService.sign(payload);

      return {
        message: 'Google login successful',
        access_token,
        user: {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          countryCode: user.countryCode,
          gender: user.gender,
          profileImage: user.profileImage,
          socialProvider: user.socialProvider,
          isEmailVerified: user.isEmailVerified,
        },
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Google login failed');
    }
  }

  async validateUser(userId: string) {
    return this.userService.findOne(userId);
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await this.hashPassword(
      changePasswordDto.newPassword,
    );
    await this.userService.updatePassword(userId, hashedPassword);
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
  }

  private async comparePasswords(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(plainTextPassword, hashedPassword);
    } catch {
      return false;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      // Check if user exists
      const user = await this.userService.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return;
      }

      // Generate reset token
      const resetToken = this.jwtService.sign(
        { email: user.email, type: 'password-reset' },
        { expiresIn: '15m' }, // Token expires in 15 minutes
      );

      // Send password reset email
      await this.emailService.sendPasswordResetEmail(user.email, resetToken);
    } catch (error) {
      // Log error but don't throw to avoid revealing if email exists
      console.error('Error in forgotPassword:', error);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Verify and decode the reset token
      const decoded: ResetTokenPayload = this.jwtService.verify(token);
      if (decoded.type !== 'password-reset') {
        throw new BadRequestException('Invalid token type');
      }

      // Find user by email from token
      const user = await this.userService.findByEmail(decoded.email);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update user password
      const updateUserDto: UpdateUserDto = {
        password: hashedPassword,
      };

      await this.userService.update(user._id as string, updateUserDto);
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === 'JsonWebTokenError' ||
          error.name === 'TokenExpiredError')
      ) {
        throw new BadRequestException('Invalid or expired token');
      }
      throw error;
    }
  }

  async completeStudentRegistration(
    userId: string,
    registrationDto: StudentRegistrationDto,
  ) {
    try {
      // Find the user
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Check if user is a student
      if (user.role !== UserRole.STUDENT) {
        throw new BadRequestException(
          'Only students can complete registration',
        );
      }

      // Check if registration is already complete
      if (user.registrationComplete) {
        throw new BadRequestException('Registration already completed');
      }

      // Update user with registration data
      const updateUserDto: UpdateUserDto = {
        phone: registrationDto.phone,
        countryCode: registrationDto.countryCode,
        gender: registrationDto.gender,
        identificationType: IdentificationType.CNIC, // Default to CNIC for students
        identificationNumber: registrationDto.studentId, // Use studentId as identification
        registrationComplete: true,
      };

      // Add optional fields if provided
      if (registrationDto.university) {
        updateUserDto.university = registrationDto.university;
      }
      if (registrationDto.program) {
        updateUserDto.program = registrationDto.program;
      }
      if (registrationDto.yearOfStudy) {
        updateUserDto.yearOfStudy = registrationDto.yearOfStudy;
      }
      if (registrationDto.dateOfBirth) {
        updateUserDto.dateOfBirth = registrationDto.dateOfBirth;
      }
      if (registrationDto.emergencyContactName) {
        updateUserDto.emergencyContactName =
          registrationDto.emergencyContactName;
      }
      if (registrationDto.emergencyContactPhone) {
        updateUserDto.emergencyContactPhone =
          registrationDto.emergencyContactPhone;
      }
      if (registrationDto.emergencyContactRelationship) {
        updateUserDto.emergencyContactRelationship =
          registrationDto.emergencyContactRelationship;
      }

      const updatedUser = await this.userService.update(userId, updateUserDto);

      return {
        message: 'Student registration completed successfully',
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          registrationComplete: Boolean(updatedUser.registrationComplete),
          phone: updatedUser.phone,
          university: updatedUser.university || undefined,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Registration completion failed',
      );
    }
  }

  async completeLandlordRegistration(
    userId: string,
    registrationDto: LandlordRegistrationDto,
  ) {
    try {
      // Find the user
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Check if user is a landlord
      if (user.role !== UserRole.LANDLORD) {
        throw new BadRequestException(
          'Only landlords can complete this registration',
        );
      }

      // Check if registration is already complete
      if (user.registrationComplete) {
        throw new BadRequestException('Registration already completed');
      }

      // Update user with registration data
      const updateUserDto: UpdateUserDto = {
        phone: registrationDto.phone,
        countryCode: registrationDto.countryCode,
        gender: registrationDto.gender,
        address: registrationDto.address,
        identificationType:
          registrationDto.identificationType as IdentificationType,
        identificationNumber: registrationDto.identificationNumber,
        registrationComplete: true,
      };

      // Add optional fields if provided
      if (registrationDto.businessLicense) {
        updateUserDto.businessLicense = registrationDto.businessLicense;
      }
      if (registrationDto.yearsOfExperience !== undefined) {
        updateUserDto.yearsOfExperience = registrationDto.yearsOfExperience;
      }
      if (registrationDto.propertyTypes) {
        updateUserDto.propertyTypes = registrationDto.propertyTypes;
      }
      if (registrationDto.emergencyContactName) {
        updateUserDto.emergencyContactName =
          registrationDto.emergencyContactName;
      }
      if (registrationDto.emergencyContactPhone) {
        updateUserDto.emergencyContactPhone =
          registrationDto.emergencyContactPhone;
      }
      if (registrationDto.emergencyContactRelationship) {
        updateUserDto.emergencyContactRelationship =
          registrationDto.emergencyContactRelationship;
      }

      const updatedUser = await this.userService.update(userId, updateUserDto);

      return {
        message: 'Landlord registration completed successfully',
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          registrationComplete: Boolean(updatedUser.registrationComplete),
          phone: updatedUser.phone,
          address: updatedUser.address,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Landlord registration completion failed',
      );
    }
  }

  async completeFoodProviderRegistration(
    userId: string,
    registrationDto: FoodProviderRegistrationDto,
  ) {
    try {
      // Find the user
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Check if user is a food provider
      if (user.role !== UserRole.FOOD_PROVIDER) {
        throw new BadRequestException(
          'Only food providers can complete this registration',
        );
      }

      // Check if registration is already complete
      if (user.registrationComplete) {
        throw new BadRequestException('Registration already completed');
      }

      // Update user with registration data
      const updateUserDto: UpdateUserDto = {
        phone: registrationDto.phone,
        countryCode: registrationDto.countryCode,
        gender: registrationDto.gender,
        address: registrationDto.address,
        identificationType:
          registrationDto.identificationType as IdentificationType,
        identificationNumber: registrationDto.identificationNumber,
        businessName: registrationDto.businessName,
        registrationComplete: true,
      };

      // Add optional fields if provided
      if (registrationDto.foodLicense) {
        updateUserDto.foodLicense = registrationDto.foodLicense;
      }
      if (registrationDto.businessRegistration) {
        updateUserDto.businessRegistration =
          registrationDto.businessRegistration;
      }
      if (registrationDto.cuisineTypes) {
        updateUserDto.cuisineTypes = registrationDto.cuisineTypes;
      }
      if (registrationDto.yearsOfExperience !== undefined) {
        updateUserDto.yearsOfExperience = registrationDto.yearsOfExperience;
      }
      if (registrationDto.averageDeliveryTime !== undefined) {
        updateUserDto.averageDeliveryTime = registrationDto.averageDeliveryTime;
      }
      if (registrationDto.minimumOrder !== undefined) {
        updateUserDto.minimumOrder = registrationDto.minimumOrder;
      }
      if (registrationDto.operatingHours) {
        updateUserDto.operatingHours = registrationDto.operatingHours;
      }
      if (registrationDto.emergencyContactName) {
        updateUserDto.emergencyContactName =
          registrationDto.emergencyContactName;
      }
      if (registrationDto.emergencyContactPhone) {
        updateUserDto.emergencyContactPhone =
          registrationDto.emergencyContactPhone;
      }
      if (registrationDto.emergencyContactRelationship) {
        updateUserDto.emergencyContactRelationship =
          registrationDto.emergencyContactRelationship;
      }

      const updatedUser = await this.userService.update(userId, updateUserDto);

      return {
        message: 'Food provider registration completed successfully',
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          registrationComplete: Boolean(updatedUser.registrationComplete),
          phone: updatedUser.phone,
          businessName: updatedUser.businessName,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Food provider registration completion failed',
      );
    }
  }

  async updateUserRole(userId: string, role: string) {
    try {
      const updateUserDto: UpdateUserDto = {
        role: role as UserRole,
      };
      return await this.userService.update(userId, updateUserDto);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to update user role',
      );
    }
  }

  /**
   * Send email verification OTP
   */
  async sendEmailVerification(
    sendVerificationDto: SendVerificationDto,
  ): Promise<{ message: string; remainingTime?: number }> {
    try {
      const { email } = sendVerificationDto;

      // Check if user exists
      const user = await this.userService.findByEmail(email);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Check if email is already verified
      if (user.isEmailVerified) {
        throw new BadRequestException('Email is already verified');
      }

      // Check if there's already a valid OTP
      const hasValidOtp = await this.otpService.hasValidOtp(
        email,
        'email_verification',
      );
      if (hasValidOtp) {
        const remainingTime = await this.otpService.getRemainingTime(
          email,
          'email_verification',
        );
        return {
          message: `Verification code already sent. Please wait ${Math.ceil(remainingTime / 60)} minutes before requesting a new code.`,
          remainingTime,
        };
      }

      // Generate and send new OTP
      const otp = this.otpService.generateOtp();
      await this.otpService.storeOtp(email, otp, 'email_verification');
      await this.emailService.sendEmailVerification(email, otp);

      return {
        message:
          'Verification code sent to your email. Please check your inbox.',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to send verification email');
    }
  }

  /**
   * Verify email with OTP
   */
  async verifyEmail(
    verifyEmailDto: VerifyEmailDto,
  ): Promise<{ message: string; user: any }> {
    try {
      const { email, otp } = verifyEmailDto;

      // Check if user exists
      const user = await this.userService.findByEmail(email);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Check if email is already verified
      if (user.isEmailVerified) {
        throw new BadRequestException('Email is already verified');
      }

      // Verify OTP
      await this.otpService.verifyOtp(email, otp, 'email_verification');

      // Update user's email verification status
      const updateUserDto: UpdateUserDto = {
        isEmailVerified: true,
      };
      await this.userService.update(user._id as string, updateUserDto);

      // Send welcome email
      await this.emailService.sendWelcomeEmail(
        user.email,
        user.name,
        user.role,
      );

      return {
        message:
          'Email verified successfully! You can now log in to your account.',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: true,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to verify email');
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const sendVerificationDto: SendVerificationDto = { email };
    const result = await this.sendEmailVerification(sendVerificationDto);
    return result;
  }
}
