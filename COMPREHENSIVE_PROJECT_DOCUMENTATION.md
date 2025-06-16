# StayKaru Backend - Comprehensive Project Documentation

## 📑 Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Module Documentation](#module-documentation)
   - [Authentication Module](#authentication-module)
   - [User Module](#user-module)
   - [Location Module](#location-module)
   - [Accommodation Module](#accommodation-module)
   - [Booking Module](#booking-module)
   - [Food Service Module](#food-service-module)
   - [Order Module](#order-module)
   - [Payment Module](#payment-module)
   - [Review Module](#review-module)
   - [Notification Module](#notification-module)
   - [Analytics Module](#analytics-module)
   - [Cache Module](#cache-module)
6. [Configuration](#configuration)
7. [API Documentation](#api-documentation)
8. [Authentication Flow](#authentication-flow)
9. [Database Schema](#database-schema)
10. [WebSocket Implementation](#websocket-implementation)
11. [Deployment Guide](#deployment-guide)
12. [Testing](#testing)
13. [Best Practices](#best-practices)
14. [MongoDB Authentication Implementation Guide](#mongodb-authentication-implementation-guide)

## Project Overview

StayKaru is a comprehensive platform designed to facilitate student accommodations and related services. The system allows students to find and book accommodations, order food from local providers, and review services. Landlords can list and manage their properties, while food providers can manage their menus and process orders.

### Key Features

- Student, landlord, and food provider user roles
- Firebase authentication system
- Accommodation listings with location-based search
- Booking management for accommodations
- Food service listings and ordering
- Payment processing
- Real-time notifications using WebSockets
- Caching system for improved performance
- Analytics for tracking user behavior and system usage

## System Architecture

The StayKaru backend is built on NestJS, a progressive Node.js framework. The architecture follows a modular approach with clear separation of concerns. Each business domain is encapsulated in its own module with controllers, services, DTOs, and schemas.

### Key Architectural Components:

1. **Controllers**: Handle HTTP requests and define API endpoints
2. **Services**: Contain business logic and interact with repositories
3. **DTOs**: Define data transfer objects for request validation
4. **Schemas**: Define MongoDB document structures
5. **Guards**: Protect routes based on authentication and authorization rules
6. **WebSocket Gateways**: Enable real-time communication

The system uses MongoDB as the primary database and Redis for caching. Firebase is used for authentication and user management.

## Technology Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Database**: MongoDB (with Mongoose ODM)
- **Caching**: Redis (via cache-manager)
- **Authentication**: Firebase Auth
- **API Documentation**: Swagger/OpenAPI
- **Real-time Communication**: Socket.IO
- **Validation**: class-validator
- **Data Transformation**: class-transformer
- **Encryption**: crypto-js
- **Geospatial Functions**: Google Maps Services
- **HTTP Client**: Axios

## Project Structure

The project follows a modular architecture with each module containing its own components:

```
src/
├── app.module.ts          # Main application module
├── app.controller.ts      # Main application controller
├── app.service.ts         # Main application service
├── main.ts                # Application entry point
├── config/                # Configuration files
│   ├── database.config.ts # Database configuration
│   ├── firebase.config.ts # Firebase configuration
│   └── cache.config.ts    # Caching configuration
└── modules/               # Feature modules
    ├── auth/              # Authentication module
    ├── user/              # User management module
    ├── location/          # Location module
    ├── accommodation/     # Accommodation module
    ├── booking/           # Booking module
    ├── food_service/      # Food service module
    ├── order/             # Order module
    ├── payment/           # Payment module
    ├── review/            # Review module
    ├── notification/      # Notification module
    ├── analytics/         # Analytics module
    └── cache/             # Caching module
```

Each module typically follows this structure:

```
module-name/
├── module-name.module.ts       # Module definition
├── controller/                 # Controllers
├── services/                   # Services
├── dto/                        # Data Transfer Objects
├── schema/                     # MongoDB schemas
├── guards/                     # Guards (optional)
├── decorators/                 # Custom decorators (optional)
└── interfaces/                 # TypeScript interfaces (optional)
```

## Module Documentation

### Authentication Module

The Authentication module handles user authentication using MongoDB for credential storage and JWT tokens for session management.

#### Key Components:

- **AuthService**: Handles authentication logic, user registration, login, and token generation/validation
- **AuthController**: Exposes authentication endpoints for registration, login, and token verification
- **JwtStrategy**: Implements Passport strategy for JWT validation
- **AuthGuard**: Protects routes requiring authentication

#### Authentication Flow:

1. User submits registration data (email, password, mobile, name, gender)
2. Backend validates input data and checks for existing email
3. If valid, user is created in MongoDB with plain text password
4. For login, user submits email/password credentials
5. Backend validates credentials against MongoDB records
6. If valid, backend generates and returns JWT token with user data
7. Frontend stores token in AsyncStorage for persistence
8. For protected routes, token is included in Authorization header

### User Module

The User module manages user profiles, roles, and permissions. It stores user data in MongoDB and provides CRUD operations for user management.

#### Schema:

```typescript
// User Schema
export enum UserRole {
  STUDENT = 'student',
  LANDLORD = 'landlord',
  FOOD_PROVIDER = 'food_provider',
  ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;  // Plain text password

  @Prop({ required: true, enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @Prop({ required: true })
  phone: string;

  @Prop()
  address: string;

  @Prop({ required: true })
  gender: string;

  @Prop({ type: [String], default: [] })
  fcmTokens: string[]; // For push notifications
}
```

#### Key Features:

- User creation and management
- Role-based access control
- Simple email/password authentication
- Caching for improved performance

### Location Module

The Location module manages geographical information including countries, cities, and coordinates. It provides services for location-based searches and geocoding.

#### Key Components:

- **LocationService**: Manages location data and provides geocoding services
- **GeocodingAdapter**: Interfaces with Google Maps API for geocoding
- **City and Country schemas**: Define location data structure

#### Features:

- City and country management
- Geocoding and reverse geocoding
- Location-based searches
- Geospatial indexing

### Accommodation Module

The Accommodation module manages property listings, searches, and related operations. It allows landlords to create and manage accommodations and students to search for them.

#### Schema:

```typescript
@Schema({ timestamps: true })
export class Accommodation extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'City', required: true })
  city: City;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  })
  coordinates: {
    type: string;
    coordinates: number[];
  };

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ type: [String], default: [] })
  amenities: string[];

  @Prop({ type: [Date], default: [] })
  availability: Date[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  landlord: User;
}
```

#### Key Features:

- Accommodation creation and management
- Location-based search (nearby accommodations)
- Price and amenity filtering
- Availability management
- Caching for improved performance
- Owner-only updates and deletions

### Booking Module

The Booking module manages accommodation reservations, including creating, updating, and tracking bookings.

#### Schema:

```typescript
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class Booking extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Accommodation', required: true })
  accommodation: Accommodation;

  @Prop({ required: true })
  start_date: Date;

  @Prop({ required: true })
  end_date: Date;

  @Prop({ type: String, enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;
}
```

#### Key Features:

- Booking creation and management
- Status updates (pending, confirmed, cancelled)
- Date availability checking
- Real-time updates using WebSockets
- Analytics tracking for bookings
- User and landlord booking views

### Food Service Module

The Food Service module manages food providers, menus, and related operations. It allows food providers to create and manage their offerings and students to browse them.

#### Key Features:

- Food provider profiles
- Menu management
- Category and cuisine filtering
- Pricing and availability
- Operating hours
- Delivery area restrictions

### Order Module

The Order module manages food orders, including creation, status updates, and tracking.

#### Key Features:

- Order creation
- Status updates (pending, preparing, delivering, completed, cancelled)
- Order tracking
- Order history
- Real-time updates using WebSockets

### Payment Module

The Payment module handles payment processing for both accommodation bookings and food orders.

#### Key Features:

- Payment method management
- Payment processing
- Transaction history
- Receipt generation
- Payment status tracking

### Review Module

The Review module manages user reviews for accommodations and food services.

#### Key Features:

- Review creation
- Rating system
- Review moderation
- Helpful votes
- Average rating calculation

### Notification Module

The Notification module provides real-time notifications to users via WebSockets. It stores notification history and manages user preferences.

#### Schema:

```typescript
@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  data: Record<string, any>;

  @Prop({ default: false })
  read: boolean;
}
```

#### Key Features:

- Real-time notifications using Socket.IO
- Notification history
- Read/unread status
- Notification types (booking, order, system)
- Push notification integration (FCM tokens)

### Analytics Module

The Analytics module tracks user behavior and system usage for reporting and optimization.

#### Key Features:

- Event tracking
- User activity logging
- Booking and order analytics
- Search analytics
- Performance metrics

### Cache Module

The Cache module provides caching services to improve performance and reduce database load.

#### Key Features:

- Redis-based caching
- TTL (Time-To-Live) configuration
- Cache invalidation strategies
- Query result caching
- User data caching

## Configuration

The project uses NestJS's ConfigModule for configuration management. Configuration is loaded from environment variables and structured into logical groups.

### Database Configuration

```typescript
// database.config.ts
export default registerAs('database', () => ({
  mongoUri: process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster0.example.mongodb.net/',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    directConnection: false,
  }
}));
```

### Firebase Configuration

This configuration has been removed as the project now uses MongoDB-based authentication.

### JWT Configuration

```typescript
// jwt.config.ts
export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'default-secret-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
}));
```

### Cache Configuration

```typescript
// cache.config.ts
export default registerAs('cache', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  ttl: parseInt(process.env.CACHE_TTL || '300', 10), // 5 minutes default
}));
```

## API Documentation

The API is documented using Swagger/OpenAPI. The documentation is available at the `/api` endpoint when the application is running.

Key API sections:

- **Auth**: Authentication endpoints
- **Users**: User management endpoints
- **Locations**: Location management endpoints
- **Accommodations**: Accommodation management endpoints
- **Bookings**: Booking management endpoints
- **Food-providers**: Food provider management endpoints
- **Orders**: Order management endpoints
- **Payments**: Payment management endpoints
- **Reviews**: Review management endpoints
- **Analytics**: Analytics endpoints

## Authentication Flow

1. **Registration**:
   - User submits registration data (email, password, mobile, name, gender)
   - Backend validates input and checks for email uniqueness
   - User is created in MongoDB with plain text password
   - Success response returned with user data

2. **Login**:
   - User submits email and password
   - Backend validates credentials against MongoDB records
   - If valid, JWT token is generated and returned with user data
   - Frontend stores token in AsyncStorage

3. **Session Management**:
   - On app startup, check AsyncStorage for existing token
   - If token exists, user is set as logged in
   - For protected routes, token is included in Authorization header
   - JWT middleware validates token for each protected request

4. **Logout**:
   - Clear token from AsyncStorage
   - Reset authentication state
   - Navigate to login screen

## Database Schema

The application uses MongoDB with Mongoose ODM (Object Document Mapper). Each module defines its own schemas with appropriate validation and relationships.

Key schema relationships:

- **User** is related to **Accommodation** (as landlord)
- **User** is related to **Booking** (as student)
- **Accommodation** is related to **City**
- **City** is related to **Country**
- **Booking** relates **User** to **Accommodation**
- **Order** relates **User** to **FoodItem**
- **Review** can be for **Accommodation** or **FoodService**

## WebSocket Implementation

The application uses Socket.IO for real-time communication. WebSocket connections are authenticated using Firebase tokens.

Key WebSocket features:

- Real-time notifications
- Booking status updates
- Order status updates
- Chat functionality

## Deployment Guide

The application is configured for deployment on Heroku or other cloud platforms.

### Environment Variables

Required environment variables:

```
# Database
MONGODB_URI=mongodb+srv://username:password@cluster0.example.mongodb.net/

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Redis (optional)
REDIS_HOST=your-redis-host
REDIS_PORT=6379
CACHE_TTL=300

# Server
PORT=3001
NODE_ENV=production
```

## Testing

The project includes various test types:

- **Unit tests**: Test individual components
- **Integration tests**: Test component interactions
- **E2E tests**: Test complete workflows

Run tests using:

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Best Practices

### Code Organization

- Follow the modular architecture
- Keep controllers thin, move business logic to services
- Use DTOs for input validation
- Use interfaces to define service contracts

### Performance Optimization

- Use caching for frequently accessed data
- Implement database indexing for common queries
- Use projection to limit returned fields
- Implement pagination for large result sets

### Security

- Always validate user input
- Encrypt sensitive data (phone numbers, addresses)
- Use appropriate guards for route protection
- Implement rate limiting for public endpoints
- Follow the principle of least privilege

### Error Handling

- Use appropriate HTTP status codes
- Provide meaningful error messages
- Log errors with sufficient context
- Implement global exception filters

### Maintainability

- Write clear comments and documentation
- Follow consistent naming conventions
- Keep functions and classes focused on single responsibilities
- Write tests for critical functionality

## MongoDB Authentication Implementation Guide

This section provides detailed implementation steps to replace Firebase authentication with MongoDB-based authentication as per the requirements.

### 1. Update Dependencies

Add the following dependencies to your project:

```bash
npm install --save @nestjs/jwt passport passport-jwt bcrypt
npm install --save-dev @types/passport-jwt @types/bcrypt
```

### 2. Create JWT Configuration

Create a new configuration file for JWT:

```typescript
// src/config/jwt.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'default-secret-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
}));
```

### 3. Update User Schema

Update the user schema to include password field:

```typescript
// src/modules/user/schema/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  STUDENT = 'student',
  LANDLORD = 'landlord',
  FOOD_PROVIDER = 'food_provider',
  ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;  // Plain text password as per requirement

  @Prop({ required: true, enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @Prop({ required: true })
  phone: string;

  @Prop()
  address: string;

  @Prop({ required: true })
  gender: string;

  @Prop({ type: [String], default: [] })
  fcmTokens: string[]; // For push notifications
}

export const UserSchema = SchemaFactory.createForClass(User);
```

### 4. Create DTOs for Authentication

Create DTOs for login and registration:

```typescript
// src/modules/auth/dto/register.dto.ts
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../user/schema/user.schema';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Password123' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ example: '+1234567890' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: 'male', enum: ['male', 'female', 'other'] })
  @IsNotEmpty()
  @IsString()
  gender: string;

  @ApiProperty({ enum: UserRole, example: UserRole.STUDENT })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}
```

```typescript
// src/modules/auth/dto/login.dto.ts
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Password123' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
```

### 5. Update Auth Module

Update the auth module:

```typescript
// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './services/auth.service';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: { expiresIn: configService.get('jwt.expiresIn') },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

### 6. Create JWT Strategy

Create a strategy for JWT authentication:

```typescript
// src/modules/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/services/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret'),
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findOne(payload.sub);
    return user;
  }
}
```

### 7. Implement Auth Service

Update the auth service for MongoDB-based authentication:

```typescript
// src/modules/auth/services/auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/services/user.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { CreateUserDto } from '../../user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // Create user with plain text password as per requirement
    const createUserDto: CreateUserDto = {
      name: registerDto.name,
      email: registerDto.email,
      password: registerDto.password, // Store plain text password
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
  }

  async login(loginDto: LoginDto) {
    // Find user by email
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Compare plain text passwords as per requirement
    if (user.password !== loginDto.password) {
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
      },
    };
  }

  async validateUser(userId: string) {
    return this.userService.findOne(userId);
  }
}
```

### 8. Update Auth Controller

Update the auth controller to use MongoDB authentication:

```typescript
// src/modules/auth/controller/auth.controller.ts
import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

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
          id: '507f1f77bcf86cd799439011',
          email: 'john@example.com',
          name: 'John Doe',
          role: 'student',
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
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '507f1f77bcf86cd799439011',
          email: 'john@example.com',
          name: 'John Doe',
          role: 'student',
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
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req) {
    return {
      user: req.user,
    };
  }
}
```

### 9. Create JWT Auth Guard

Create a guard for JWT authentication:

```typescript
// src/modules/auth/guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

### 10. Update User Service

Update the user service to support the new authentication system:

```typescript
// src/modules/user/services/user.service.ts
// Add these methods to the existing UserService

async findByEmail(email: string): Promise<User | null> {
  return this.userModel.findOne({ email }).exec();
}

async create(createUserDto: CreateUserDto): Promise<User> {
  const user = new this.userModel({
    ...createUserDto,
  });

  const savedUser = await user.save();
  return savedUser;
}
```

### 11. Update User DTO

Update the create user DTO:

```typescript
// src/modules/user/dto/create-user.dto.ts
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../schema/user.schema';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Password123' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ example: '+1234567890' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: 'male', enum: ['male', 'female', 'other'] })
  @IsNotEmpty()
  @IsString()
  gender: string;

  @ApiProperty({ enum: UserRole, example: UserRole.STUDENT })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}
```

### 12. Update App Module

Update the app module to load JWT configuration:

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
// ... other imports

import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import cacheConfig from './config/cache.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, jwtConfig, cacheConfig],
      isGlobal: true,
    }),
    // ... other imports and modules
  ],
  // ... controllers and providers
})
export class AppModule {}
```

### 13. Frontend Integration (React Native)

Here's how to integrate the new authentication system in the React Native frontend:

```javascript
// auth/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://192.168.100.84:5000/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const register = async (name, email, password, phone, gender, role) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
        phone,
        gender,
        role
      });
      
      setIsLoading(false);
      return response.data;
    } catch (error) {
      setIsLoading(false);
      throw error.response?.data || { message: 'Registration failed' };
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      
      const { access_token, user } = response.data;
      
      setUserToken(access_token);
      setUserInfo(user);
      
      // Store user info and token in AsyncStorage
      await AsyncStorage.setItem('userToken', access_token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(user));
      
      setIsLoading(false);
      return response.data;
    } catch (error) {
      setIsLoading(false);
      throw error.response?.data || { message: 'Login failed' };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setUserToken(null);
    setUserInfo(null);
    
    // Remove user info and token from AsyncStorage
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userInfo');
    setIsLoading(false);
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      
      // Get token and user info from AsyncStorage
      const userToken = await AsyncStorage.getItem('userToken');
      const userInfo = await AsyncStorage.getItem('userInfo');
      
      if (userToken) {
        setUserToken(userToken);
        setUserInfo(JSON.parse(userInfo));
      }
      
      setIsLoading(false);
    } catch (error) {
      console.log('isLoggedIn error', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        userToken,
        userInfo,
        register,
        login,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 14. API Client Setup

Create an API client with authentication:

```javascript
// utils/apiClient.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.100.84:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
```

## Best Practices for MongoDB Authentication

When implementing MongoDB-based authentication, keep these best practices in mind:

1. **Password Security**: Although the requirements specify plain text password storage, in a production environment, it's strongly recommended to use bcrypt or another hashing algorithm to protect user passwords.

2. **Token Management**: Set appropriate expiration times for JWT tokens and implement token refresh mechanisms for longer sessions.

3. **Error Handling**: Provide clear error messages without exposing sensitive information or details that could aid attackers.

4. **Input Validation**: Always validate user inputs on both client and server sides to prevent injection attacks.

5. **Logging**: Implement proper logging for authentication attempts, especially failed ones, to detect potential security threats.

6. **Rate Limiting**: Implement rate limiting on authentication endpoints to prevent brute force attacks.

7. **HTTPS**: Always use HTTPS in production to secure data transmission, especially authentication credentials.

## Frontend Implementation Checklist

- [ ] Create login screen with email and password fields
- [ ] Add registration form with all required fields
- [ ] Implement form validation using Formik and Yup
- [ ] Create AuthContext for state management
- [ ] Implement token storage in AsyncStorage
- [ ] Add loading screens during authentication
- [ ] Create protected route navigation
- [ ] Implement logout functionality
- [ ] Add error handling and user feedback
