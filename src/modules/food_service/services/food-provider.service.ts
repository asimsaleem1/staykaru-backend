import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { FoodProvider } from '../schema/food-provider.schema';
import { CreateFoodProviderDto } from '../dto/create-food-provider.dto';
import { UpdateFoodProviderDto } from '../dto/update-food-provider.dto';
import { User } from '../../user/schema/user.schema';

@Injectable()
export class FoodProviderService {
  constructor(
    @InjectModel(FoodProvider.name)
    private readonly foodProviderModel: Model<FoodProvider>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private getCacheKey(id: string): string {
    return `food-provider:${id}`;
  }

  private async clearCache(id: string): Promise<void> {
    await this.cacheManager.del(this.getCacheKey(id));
    await this.cacheManager.del('food-providers:all');
  }

  async create(
    createFoodProviderDto: CreateFoodProviderDto,
    owner: User,
  ): Promise<FoodProvider> {
    const foodProvider = new this.foodProviderModel({
      ...createFoodProviderDto,
      owner: owner._id,
    });
    const savedProvider = await (
      await foodProvider.save()
    ).populate(['location', 'owner']);
    await this.cacheManager.del('food-providers:all');
    return savedProvider;
  }

  async findAll(): Promise<FoodProvider[]> {
    const cached =
      await this.cacheManager.get<FoodProvider[]>('food-providers:all');
    if (cached) {
      return cached;
    }

    const providers = await this.foodProviderModel
      .find()
      .populate(['location', 'owner'])
      .exec();

    await this.cacheManager.set('food-providers:all', providers);
    return providers;
  }

  async findOne(id: string): Promise<FoodProvider> {
    const cacheKey = this.getCacheKey(id);
    const cached = await this.cacheManager.get<FoodProvider>(cacheKey);

    if (cached) {
      return cached;
    }

    const foodProvider = await this.foodProviderModel
      .findById(id)
      .populate(['location', 'owner'])
      .exec();

    if (!foodProvider) {
      throw new NotFoundException(`Food provider with ID ${id} not found`);
    }

    await this.cacheManager.set(cacheKey, foodProvider);
    return foodProvider;
  }

  async update(
    id: string,
    updateFoodProviderDto: UpdateFoodProviderDto,
    userId: string,
  ): Promise<FoodProvider> {
    const foodProvider = await this.foodProviderModel.findById(id);

    if (!foodProvider) {
      throw new NotFoundException(`Food provider with ID ${id} not found`);
    }

    if (foodProvider.owner.toString() !== userId) {
      throw new ForbiddenException(
        'You can only update your own food provider profile',
      );
    }

    const updated = await this.foodProviderModel
      .findByIdAndUpdate(id, updateFoodProviderDto, { new: true })
      .populate(['location', 'owner'])
      .exec();

    await this.clearCache(id);
    return updated;
  }

  async remove(id: string, userId: string): Promise<void> {
    const foodProvider = await this.foodProviderModel.findById(id);

    if (!foodProvider) {
      throw new NotFoundException(`Food provider with ID ${id} not found`);
    }

    if (foodProvider.owner.toString() !== userId) {
      throw new ForbiddenException(
        'You can only delete your own food provider profile',
      );
    }

    await this.foodProviderModel.findByIdAndDelete(id).exec();
    await this.clearCache(id);
  }
}
