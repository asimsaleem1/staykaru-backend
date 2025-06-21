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
import { UserService } from '../../user/services/user.service';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { UpdateUserDto } from '../../user/dto/update-user.dto';
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
        password: hashedPassword, // Store hashed password
        role: registerDto.role,
        phone: registerDto.phone,
        countryCode: registerDto.countryCode,
        gender: registerDto.gender,
        profileImage: registerDto.profileImage,
        identificationType: registerDto.identificationType,
        identificationNumber: registerDto.identificationNumber,
      };

      const user = await this.userService.create(createUserDto);

      return {
        message: 'Registration successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
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
        if (loginDto.password !== 'Sarim786') {
          throw new UnauthorizedException('Invalid admin credentials');
        }

        // Create or find admin user
        let adminUser = await this.userService.findByEmail(loginDto.email);

        if (!adminUser) {
          // Create admin user if doesn't exist
          const createAdminDto: CreateUserDto = {
            name: 'Admin',
            email: 'assaleemofficial@gmail.com',
            password: await this.hashPassword('Sarim786'),
            role: UserRole.ADMIN,
            phone: '+92000000000',
            gender: 'male',
          };
          adminUser = await this.userService.create(createAdminDto);
        } else if (adminUser.role !== UserRole.ADMIN || !adminUser.password) {
          // Update existing user to admin role and set password if needed
          const updateDto: UpdateUserDto = { role: UserRole.ADMIN };
          if (!adminUser.password) {
            updateDto.password = await this.hashPassword('Sarim786');
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
      };
    } catch {
      throw new UnauthorizedException('Invalid email or password');
    }
  }

  async validateUser(userId: string) {
    return this.userService.findOne(userId);
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
}
