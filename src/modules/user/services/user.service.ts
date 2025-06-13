import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import * as CryptoJS from 'crypto-js';
import { User } from '../schema/user.schema';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserService {
  private readonly encryptionKey: string;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {
    this.encryptionKey = this.configService.get<string>('ENCRYPTION_KEY') || 'default-key-12345';
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

  async create(createUserDto: CreateUserDto, supabaseUserId: string): Promise<User> {
    const encryptedData = {
      ...createUserDto,
      phone: createUserDto.phone ? this.encrypt(createUserDto.phone) : undefined,
      address: createUserDto.address ? this.encrypt(createUserDto.address) : undefined,
    };

    const user = new this.userModel({
      ...encryptedData,
      supabaseUserId,
    });

    const savedUser = await user.save();
    await this.cacheManager.del('users:all');
    return this.decryptUserData(savedUser);
  }

  async findAll(): Promise<User[]> {
    const cached = await this.cacheManager.get<User[]>('users:all');
    if (cached) {
      return cached.map(user => this.decryptUserData(user));
    }

    const users = await this.userModel.find().exec();
    const decryptedUsers = users.map(user => this.decryptUserData(user));
    await this.cacheManager.set('users:all', users);
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
      phone: updateUserDto.phone ? this.encrypt(updateUserDto.phone) : undefined,
      address: updateUserDto.address ? this.encrypt(updateUserDto.address) : undefined,
    };

    const user = await this.userModel
      .findByIdAndUpdate(id, encryptedData, { new: true })
      .exec();
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.clearCache(id);
    return this.decryptUserData(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.clearCache(id);
  }

  async findBySupabaseUserId(supabaseUserId: string): Promise<User | null> {
    const cacheKey = `user:supabase:${supabaseUserId}`;
    const cached = await this.cacheManager.get<User>(cacheKey);
    
    if (cached) {
      return this.decryptUserData(cached);
    }

    const user = await this.userModel.findOne({ supabaseUserId }).exec();
    if (user) {
      await this.cacheManager.set(cacheKey, user);
      return this.decryptUserData(user);
    }
    return null;
  }

  private decryptUserData(user: User): User {
    const userObject = user.toObject();
    return {
      ...userObject,
      phone: userObject.phone ? this.decrypt(userObject.phone) : undefined,
      address: userObject.address ? this.decrypt(userObject.address) : undefined,
    };
  }
}