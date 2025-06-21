import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import * as CryptoJS from 'crypto-js';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../schema/user.schema';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';

@Injectable()
export class UserService {
  private readonly encryptionKey: string;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {
    this.encryptionKey =
      this.configService.get<string>('ENCRYPTION_KEY') || 'default-key-12345';
  }

  private encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, this.encryptionKey).toString();
  }

  private decrypt(ciphertext: string): string {
    const bytes = CryptoJS.AES.decrypt(ciphertext, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  private getCacheKey(id: string): string {
    return `user:${id}`;
  }

  private async clearCache(id: string): Promise<void> {
    await this.cacheManager.del(this.getCacheKey(id));
    await this.cacheManager.del('users:all');
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const encryptedData = {
      ...createUserDto,
      phone: createUserDto.phone
        ? this.encrypt(createUserDto.phone)
        : undefined,
      address: createUserDto.address
        ? this.encrypt(createUserDto.address)
        : undefined,
    };

    const user = new this.userModel(encryptedData);
    await user.save();
    await this.clearCache(user._id as string);
    return user;
  }

  async findAll(role?: UserRole, search?: string): Promise<User[]> {
    const query: Record<string, any> = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    // Get users from cache or database
    const cacheKey =
      'users:all' + (role ? `:${role}` : '') + (search ? `:${search}` : '');
    const cached = await this.cacheManager.get<User[]>(cacheKey);

    if (cached) {
      return cached.map((user) => this.decryptUserData(user));
    }

    const users = await this.userModel
      .find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .exec();

    await this.cacheManager.set(cacheKey, users, 60 * 5); // Cache for 5 minutes

    const decryptedUsers = users.map((user) => this.decryptUserData(user));
    return decryptedUsers;
  }

  async findOne(id: string): Promise<User> {
    const cacheKey = this.getCacheKey(id);
    const cached = await this.cacheManager.get<User>(cacheKey);

    if (cached) {
      return this.decryptUserData(cached);
    }

    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.cacheManager.set(cacheKey, user);
    return this.decryptUserData(user);
  }

  async findById(userId: string): Promise<User> {
    const cacheKey = this.getCacheKey(userId);
    const cached = await this.cacheManager.get<User>(cacheKey);

    if (cached) {
      return cached;
    }

    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    await this.cacheManager.set(cacheKey, user);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const encryptedData = {
      ...updateUserDto,
      phone: updateUserDto.phone
        ? this.encrypt(updateUserDto.phone)
        : undefined,
      address: updateUserDto.address
        ? this.encrypt(updateUserDto.address)
        : undefined,
      // Password should not be encrypted, it should be stored as hashed value
      password: updateUserDto.password || undefined,
    };

    // Remove undefined values
    Object.keys(encryptedData).forEach((key) => {
      if (encryptedData[key] === undefined) {
        delete encryptedData[key];
      }
    });

    const user = await this.userModel
      .findByIdAndUpdate(
        id,
        { ...encryptedData, updatedAt: new Date() },
        { new: true },
      )
      .exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.clearCache(id);
    return this.decryptUserData(user);
  }

  async delete(id: string): Promise<void> {
    const result = await this.userModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.clearCache(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    const cacheKey = `user:email:${email}`;
    const cached = await this.cacheManager.get<User>(cacheKey);

    if (cached) {
      return this.decryptUserData(cached);
    }

    const user = await this.userModel.findOne({ email }).exec();
    if (user) {
      await this.cacheManager.set(cacheKey, user);
      return this.decryptUserData(user);
    }
    return null;
  }

  async findByFacebookId(facebookId: string): Promise<User | null> {
    const cacheKey = `user:facebook:${facebookId}`;
    const cached = await this.cacheManager.get<User>(cacheKey);

    if (cached) {
      return this.decryptUserData(cached);
    }

    const user = await this.userModel.findOne({ facebookId }).exec();
    if (user) {
      await this.cacheManager.set(cacheKey, user);
      return this.decryptUserData(user);
    }
    return null;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const cacheKey = `user:google:${googleId}`;
    const cached = await this.cacheManager.get<User>(cacheKey);

    if (cached) {
      return this.decryptUserData(cached);
    }

    const user = await this.userModel.findOne({ googleId }).exec();
    if (user) {
      await this.cacheManager.set(cacheKey, user);
      return this.decryptUserData(user);
    }
    return null;
  }

  private decryptUserData(user: User): User {
    try {
      const userObject = user.toObject() as Record<string, any>;
      return {
        ...userObject,
        phone: userObject.phone
          ? this.decrypt(String(userObject.phone))
          : undefined,
        address: userObject.address
          ? this.decrypt(String(userObject.address))
          : undefined,
      } as User;
    } catch (error) {
      console.error('Error decrypting user data:', error);
      // Return user data without decryption if decryption fails
      const userObject = user.toObject() as Record<string, any>;
      return {
        ...userObject,
        phone: (userObject.phone as string) || undefined,
        address: (userObject.address as string) || undefined,
      } as User;
    }
  }

  // FCM token management
  async addFcmToken(userId: string, token: string): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Add token if it doesn't exist
    if (!user.fcmTokens.includes(token)) {
      user.fcmTokens.push(token);
      await user.save();
      await this.clearCache(userId);
    }

    return this.decryptUserData(user);
  }

  async removeFcmToken(userId: string, token: string): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Remove token if it exists
    const tokenIndex = user.fcmTokens.indexOf(token);
    if (tokenIndex > -1) {
      user.fcmTokens.splice(tokenIndex, 1);
      await user.save();
      await this.clearCache(userId);
    }

    return this.decryptUserData(user);
  }

  async getUserFcmTokens(userId: string): Promise<string[]> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user.fcmTokens;
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<User> {
    // Find user first
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if user has a password field
    if (!user.password) {
      throw new BadRequestException(
        'User password not set. Please contact administrator.',
      );
    }

    // Verify old password
    const isPasswordMatching = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password,
    );
    if (!isPasswordMatching) {
      throw new BadRequestException('Old password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      10,
    );

    // Clear cache BEFORE updating
    await this.clearCache(userId);
    await this.cacheManager.del(`user:email:${user.email}`);

    // Update password using direct model update
    const updateResult = await this.userModel
      .updateOne(
        { _id: userId },
        {
          $set: {
            password: hashedNewPassword,
            updatedAt: new Date(),
          },
        },
      )
      .exec();

    if (updateResult.modifiedCount === 0) {
      throw new BadRequestException('Failed to update password');
    }

    // Get updated user
    const updatedUser = await this.userModel.findById(userId).exec();
    if (!updatedUser) {
      throw new NotFoundException(
        `User with ID ${userId} not found after update`,
      );
    }

    // Clear cache again after update
    await this.clearCache(userId);
    await this.cacheManager.del(`user:email:${user.email}`);

    return this.decryptUserData(updatedUser);
  }

  async getUserCounts(): Promise<any> {
    const cacheKey = 'users:counts';
    const cachedCounts = await this.cacheManager.get(cacheKey);

    if (cachedCounts) {
      return cachedCounts;
    }

    const totalUsers = await this.userModel.countDocuments();
    const students = await this.userModel.countDocuments({
      role: UserRole.STUDENT,
    });
    const landlords = await this.userModel.countDocuments({
      role: UserRole.LANDLORD,
    });
    const foodProviders = await this.userModel.countDocuments({
      role: UserRole.FOOD_PROVIDER,
    });
    const admins = await this.userModel.countDocuments({
      role: UserRole.ADMIN,
    });
    const activeUsers = await this.userModel.countDocuments({
      isActive: true,
    });
    const inactiveUsers = await this.userModel.countDocuments({
      isActive: false,
    });

    const counts = {
      total: totalUsers,
      byRole: {
        [UserRole.STUDENT]: students,
        [UserRole.LANDLORD]: landlords,
        [UserRole.FOOD_PROVIDER]: foodProviders,
        [UserRole.ADMIN]: admins,
      },
      byStatus: {
        active: activeUsers,
        inactive: inactiveUsers,
      },
    };

    await this.cacheManager.set(cacheKey, counts, 60 * 5); // Cache for 5 minutes

    return counts;
  }

  async updateUserRole(id: string, role: UserRole): Promise<User> {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = role;
    const updatedUser = await user.save();

    // Clear cache
    await this.clearCache(id);
    await this.cacheManager.del('users:all');
    await this.cacheManager.del('users:counts');

    return updatedUser;
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<User> {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = isActive;
    const updatedUser = await user.save();

    // Clear cache
    await this.clearCache(id);
    await this.cacheManager.del('users:all');
    await this.cacheManager.del('users:counts');

    return updatedUser;
  }

  // Admin methods for user security management
  async deactivateUser(userId: string, reason: string, adminId: string) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.role === UserRole.ADMIN) {
      throw new ForbiddenException('Cannot deactivate admin users');
    }

    user.isActive = false;
    user.deactivatedBy = adminId;
    user.deactivatedAt = new Date();
    user.deactivationReason = reason;

    await user.save();

    return {
      message: 'User account deactivated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        deactivatedAt: user.deactivatedAt,
        deactivationReason: user.deactivationReason,
      },
    };
  }

  async reactivateUser(userId: string) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    user.isActive = true;
    user.deactivatedBy = undefined;
    user.deactivatedAt = undefined;
    user.deactivationReason = undefined;
    user.failedLoginAttempts = 0;

    await user.save();

    return {
      message: 'User account reactivated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    };
  }

  async getUserActivityLog(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('deactivatedBy', 'name email')
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Get additional activity data from related models
    const activityLog = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        failedLoginAttempts: user.failedLoginAttempts,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      deactivation: user.deactivatedAt
        ? {
            deactivatedAt: user.deactivatedAt,
            deactivatedBy: user.deactivatedBy,
            reason: user.deactivationReason,
          }
        : null,
    };

    return activityLog;
  }

  async getSuspiciousUsers() {
    const suspiciousUsers = await this.userModel
      .find({
        $or: [
          { failedLoginAttempts: { $gte: 5 } },
          { isActive: false },
          { deactivatedAt: { $ne: null } },
        ],
      })
      .populate('deactivatedBy', 'name email')
      .select('-password')
      .sort({ failedLoginAttempts: -1, updatedAt: -1 })
      .exec();

    return {
      suspiciousUsers: suspiciousUsers.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        failedLoginAttempts: user.failedLoginAttempts,
        lastLoginAt: user.lastLoginAt,
        deactivatedAt: user.deactivatedAt,
        deactivatedBy: user.deactivatedBy,
        deactivationReason: user.deactivationReason,
        createdAt: user.createdAt,
      })),
      totalCount: suspiciousUsers.length,
    };
  }

  async updateLastLogin(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, {
      lastLoginAt: new Date(),
      failedLoginAttempts: 0,
    });
  }

  async incrementFailedLogin(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, {
      $inc: { failedLoginAttempts: 1 },
    });
  }

  // Landlord specific methods
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getLandlordBookings(_landlordId: string): Promise<any[]> {
    // This would require integration with booking service
    // For now, return mock data
    // TODO: Implement actual booking integration with landlordId
    return Promise.resolve([]);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getLandlordStatistics(_landlordId: string): Promise<any> {
    // This would require integration with booking service
    // For now, return mock data
    // TODO: Implement actual statistics calculation with landlordId
    return Promise.resolve({
      totalBookings: 0,
      activeBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      totalRevenue: 0,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getLandlordRevenue(_landlordId: string): Promise<any> {
    // This would require integration with booking service
    // For now, return mock data
    // TODO: Implement actual revenue calculation with landlordId
    return Promise.resolve({
      monthlyRevenue: [],
      totalRevenue: 0,
      averageBookingValue: 0,
    });
  }

  async getLandlordProfile(landlordId: string): Promise<any> {
    const user = await this.userModel
      .findById(landlordId)
      .select('-password -refreshTokens')
      .exec();

    if (!user) {
      throw new NotFoundException('Landlord not found');
    }

    return user;
  }

  async getUserProfile(userId: string): Promise<any> {
    try {
      const user = await this.userModel
        .findById(userId)
        .select('-password')
        .exec();

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      return this.decryptUserData(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to get user profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async updateUserProfile(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<any> {
    try {
      const user = await this.userModel.findById(userId).exec();

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Validate email if provided
      if (updateUserDto.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updateUserDto.email)) {
          throw new BadRequestException('Invalid email format');
        }

        // Check if email is already in use by another user
        const existingUser = await this.userModel
          .findOne({
            email: updateUserDto.email,
            _id: { $ne: userId },
          })
          .exec();

        if (existingUser) {
          throw new BadRequestException(
            'Email is already in use by another user',
          );
        }
      }

      // Validate phone format if provided
      if (updateUserDto.phone) {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(updateUserDto.phone.replace(/[\s-()]/g, ''))) {
          throw new BadRequestException('Invalid phone number format');
        }
      }

      // Encrypt sensitive data
      const encryptedData = { ...updateUserDto };
      if (updateUserDto.phone) {
        encryptedData.phone = this.encrypt(updateUserDto.phone);
      }
      if (updateUserDto.address) {
        encryptedData.address = this.encrypt(updateUserDto.address);
      }

      // Update using findByIdAndUpdate for better reliability
      const updatedUser = await this.userModel
        .findByIdAndUpdate(userId, { $set: encryptedData }, { new: true })
        .select('-password')
        .exec();

      if (!updatedUser) {
        throw new NotFoundException(
          `User with ID ${userId} not found during update`,
        );
      }

      await this.clearCache(userId);

      return {
        message: 'User profile updated successfully',
        user: this.decryptUserData(updatedUser),
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async updateFcmToken(userId: string, fcmToken: string): Promise<any> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Add the token to the array if it doesn't already exist
    if (!user.fcmTokens) {
      user.fcmTokens = [];
    }

    if (!user.fcmTokens.includes(fcmToken)) {
      user.fcmTokens.push(fcmToken);
    }

    await this.userModel.findByIdAndUpdate(userId, {
      fcmTokens: user.fcmTokens,
    });
    await this.clearCache(userId);

    return {
      message: 'FCM token updated successfully',
    };
  }
}
