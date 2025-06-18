import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import * as CryptoJS from 'crypto-js';
import * as bcrypt from 'bcrypt';
import { User } from '../schema/user.schema';
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

  async findAll(): Promise<User[]> {
    const cacheKey = 'users:all';
    const cached = await this.cacheManager.get<User[]>(cacheKey);

    if (cached) {
      return cached.map((user) => this.decryptUserData(user));
    }

    const users = await this.userModel.find().exec();
    const decryptedUsers = users.map((user) => this.decryptUserData(user));
    await this.cacheManager.set(cacheKey, users);
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

  private decryptUserData(user: User): User {
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
}
