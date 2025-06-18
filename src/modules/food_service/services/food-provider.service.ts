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
import { MenuItem } from '../schema/menu-item.schema';
import { Order, OrderStatus } from '../../order/schema/order.schema';

@Injectable()
export class FoodProviderService {
  constructor(
    @InjectModel(FoodProvider.name)
    private readonly foodProviderModel: Model<FoodProvider>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectModel(MenuItem.name)
    private readonly menuItemModel: Model<MenuItem>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
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

  // Food Provider Dashboard Methods
  async findByOwner(ownerId: string): Promise<FoodProvider[]> {
    const cacheKey = `food-providers:owner:${ownerId}`;
    const cached = await this.cacheManager.get<FoodProvider[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const providers = await this.foodProviderModel
      .find({ owner: ownerId })
      .populate(['location', 'owner'])
      .exec();

    await this.cacheManager.set(cacheKey, providers, 3600);
    return providers;
  }

  async getMenuItems(providerId: string): Promise<MenuItem[]> {
    const cacheKey = `menu-items:provider:${providerId}`;
    const cached = await this.cacheManager.get<MenuItem[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const menuItems = await this.menuItemModel
      .find({ provider: providerId })
      .exec();

    await this.cacheManager.set(cacheKey, menuItems, 3600);
    return menuItems;
  }

  async createMenuItem(providerId: string, menuItemDto: any): Promise<MenuItem> {
    // Verify provider exists and user owns it
    const provider = await this.foodProviderModel.findById(providerId);
    if (!provider) {
      throw new NotFoundException(`Food provider with ID ${providerId} not found`);
    }

    const menuItem = new this.menuItemModel({
      ...menuItemDto,
      provider: providerId,
    });

    const savedMenuItem = await menuItem.save();
    await this.cacheManager.del(`menu-items:provider:${providerId}`);
    return savedMenuItem;
  }

  async updateMenuItem(itemId: string, providerId: string, menuItemDto: any): Promise<MenuItem> {
    const menuItem = await this.menuItemModel.findById(itemId);
    
    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${itemId} not found`);
    }
    
    if (menuItem.provider.toString() !== providerId) {
      throw new ForbiddenException('You can only update menu items for your own food provider');
    }
    
    const updated = await this.menuItemModel
      .findByIdAndUpdate(itemId, menuItemDto, { new: true })
      .exec();
      
    await this.cacheManager.del(`menu-items:provider:${providerId}`);
    return updated;
  }

  async deleteMenuItem(itemId: string, providerId: string): Promise<void> {
    const menuItem = await this.menuItemModel.findById(itemId);
    
    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${itemId} not found`);
    }
    
    if (menuItem.provider.toString() !== providerId) {
      throw new ForbiddenException('You can only delete menu items for your own food provider');
    }
    
    await this.menuItemModel.findByIdAndDelete(itemId).exec();
    await this.cacheManager.del(`menu-items:provider:${providerId}`);
  }

  async getProviderOrders(providerId: string): Promise<Order[]> {
    const orders = await this.orderModel
      .find({ food_provider: providerId })
      .populate(['user', 'food_provider'])
      .sort({ createdAt: -1 })
      .exec();
      
    return orders;
  }

  async getProviderDashboard(ownerId: string) {
    // Get all food providers owned by this user
    const providers = await this.findByOwner(ownerId);
    
    if (providers.length === 0) {
      return {
        totalProviders: 0,
        totalOrders: 0,
        activeOrders: 0,
        menuItems: 0,
        recentOrders: [],
      };
    }
    
    const providerIds = providers.map(provider => provider._id);
    
    // Get total orders for all providers
    const totalOrders = await this.orderModel.countDocuments({
      food_provider: { $in: providerIds }
    });
    
    // Get active orders (placed or preparing status)
    const activeOrders = await this.orderModel.countDocuments({
      food_provider: { $in: providerIds },
      status: { $in: [OrderStatus.PLACED, OrderStatus.PREPARING] }
    });
    
    // Get order statistics by status
    const ordersByStatus = await this.orderModel.aggregate([
      { $match: { food_provider: { $in: providerIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Get total menu items
    const totalMenuItems = await this.menuItemModel.countDocuments({
      provider: { $in: providerIds }
    });
    
    // Get recent orders
    const recentOrders = await this.orderModel
      .find({ food_provider: { $in: providerIds } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate(['user', 'food_provider'])
      .exec();
    
    return {
      totalProviders: providers.length,
      totalOrders,
      activeOrders,
      menuItems: totalMenuItems,
      ordersByStatus: ordersByStatus.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      recentOrders,
      providers: providers.map(provider => ({
        _id: provider._id,
        name: provider.name,
        location: provider.location,
      }))
    };
  }

  async getProviderAnalytics(ownerId: string, days = 30) {
    // Get all food providers owned by this user
    const providers = await this.findByOwner(ownerId);
    
    if (providers.length === 0) {
      return {
        totalOrders: 0,
        ordersByDate: {},
        ordersByProvider: [],
        timeframe: {
          start: new Date().toISOString(),
          end: new Date().toISOString(),
          days
        }
      };
    }
    
    const providerIds = providers.map(provider => provider._id);
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get orders within date range
    const orders = await this.orderModel
      .find({
        food_provider: { $in: providerIds },
        createdAt: { $gte: startDate, $lte: endDate }
      })
      .exec();
    
    // Group orders by date
    const ordersByDate = {};
    orders.forEach(order => {
      const dateStr = order['createdAt'].toISOString().split('T')[0];
      if (!ordersByDate[dateStr]) {
        ordersByDate[dateStr] = 0;
      }
      ordersByDate[dateStr]++;
    });
    
    // Group orders by provider
    const ordersByProvider = await this.orderModel.aggregate([
      { $match: { food_provider: { $in: providerIds } } },
      { $group: { _id: '$food_provider', count: { $sum: 1 } } }
    ]);
    
    // Get provider details for each ID
    const providerDetails = await Promise.all(
      ordersByProvider.map(async item => {
        const provider = await this.foodProviderModel.findById(item._id);
        return {
          _id: provider._id,
          name: provider.name,
          orders: item.count
        };
      })
    );
    
    return {
      totalOrders: orders.length,
      ordersByDate,
      ordersByProvider: providerDetails,
      timeframe: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days
      }
    };
  }
}
