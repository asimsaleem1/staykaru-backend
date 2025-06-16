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
        gender: registerDto.gender,
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
      // Find user by email
      const user = await this.userService.findByEmail(loginDto.email);
      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
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
      const payload = { email: user.email, sub: user._id, role: user.role };

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
    } catch (error) {
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
