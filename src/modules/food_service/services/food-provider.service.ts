import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
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
import { City } from '../../location/schema/city.schema';

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
    @InjectModel(City.name)
    private readonly cityModel: Model<City>,
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
    // Validate that location exists before creating the food provider
    try {
      // First check if the location ID is a valid ObjectId format
      if (!createFoodProviderDto.location || createFoodProviderDto.location.length !== 24) {
        throw new BadRequestException(`Invalid location ID format: ${createFoodProviderDto.location}`);
      }
      
      // Try to find the city with the provided ID
      const city = await this.cityModel.findById(createFoodProviderDto.location).exec();
      if (!city) {
        throw new BadRequestException(`Location with ID ${createFoodProviderDto.location} not found`);
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      // If it's a MongoDB CastError (invalid ObjectId), convert to BadRequestException
      if (error.name === 'CastError') {
        throw new BadRequestException(`Invalid location ID format: ${createFoodProviderDto.location}`);
      }
      // Any other error
      throw new BadRequestException(`Invalid location ID: ${createFoodProviderDto.location}`);
    }

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

    // Convert both to string for comparison to handle ObjectId vs string
    if (foodProvider.owner.toString() !== userId.toString()) {
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
    try {
      console.log(`Attempting to delete food provider ${id} by user ${userId}`);
      
      // First check if the food provider exists
      const foodProvider = await this.foodProviderModel.findById(id).exec();
      
      if (!foodProvider) {
        console.log(`Food provider ${id} not found`);
        throw new NotFoundException(`Food provider with ID ${id} not found`);
      }
      
      console.log(`Food provider found. Owner: ${foodProvider.owner.toString()}, User: ${userId}`);
      
      // Check if the user is the owner of the food provider
      if (foodProvider.owner.toString() !== userId.toString()) {
        console.log(`Authorization failed. User ${userId} is not the owner of food provider ${id}`);
        throw new ForbiddenException(
          'You can only delete your own food provider profile',
        );
      }
      
      console.log(`Authorization passed. Deleting menu items for provider ${id}`);
      
      // Delete associated menu items
      const menuItemsResult = await this.menuItemModel.deleteMany({ provider: id }).exec();
      console.log(`Deleted ${menuItemsResult.deletedCount} menu items`);
      
      // Delete the food provider
      console.log(`Deleting food provider ${id}`);
      const deleteResult = await this.foodProviderModel.findByIdAndDelete(id).exec();
      
      if (!deleteResult) {
        console.log(`Food provider ${id} not found during deletion`);
        throw new NotFoundException(`Food provider with ID ${id} not found during deletion`);
      }
      
      console.log(`Food provider ${id} deleted successfully`);
      
      // Clear cache
      await this.clearCache(id);
      console.log(`Cache cleared for ${id}`);
    } catch (error) {
      // Log the error
      console.error(`Error deleting food provider ${id}: ${error.message}`);
      console.error(error.stack);
      
      // If error is already a NestJS HTTP exception, rethrow it
      if (error.status) {
        throw error;
      }
      
      // Otherwise wrap it in a BadRequestException
      throw new BadRequestException(`Failed to delete food provider: ${error.message}`);
    }
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

  async createMenuItem(
    providerId: string,
    menuItemDto: any,
  ): Promise<MenuItem> {
    // Verify provider exists and user owns it
    const provider = await this.foodProviderModel.findById(providerId);
    if (!provider) {
      throw new NotFoundException(
        `Food provider with ID ${providerId} not found`,
      );
    }

    const menuItem = new this.menuItemModel({
      ...menuItemDto,
      provider: providerId,
    });

    const savedMenuItem = await menuItem.save();
    await this.cacheManager.del(`menu-items:provider:${providerId}`);
    return savedMenuItem;
  }

  async updateMenuItem(
    itemId: string,
    providerId: string,
    menuItemDto: any,
  ): Promise<MenuItem> {
    const menuItem = await this.menuItemModel.findById(itemId);

    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${itemId} not found`);
    }

    if (menuItem.provider.toString() !== providerId) {
      throw new ForbiddenException(
        'You can only update menu items for your own food provider',
      );
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
      throw new ForbiddenException(
        'You can only delete menu items for your own food provider',
      );
    }

    await this.menuItemModel.findByIdAndDelete(itemId).exec();
    await this.cacheManager.del(`menu-items:provider:${providerId}`);
  }

  async getProviderOrders(providerId: string): Promise<Order[]> {
    // First check if the provider exists
    const provider = await this.foodProviderModel.findById(providerId);
    if (!provider) {
      throw new NotFoundException(`Food provider with ID ${providerId} not found`);
    }

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

    const providerIds = providers.map((provider) => provider._id);

    // Get total orders for all providers
    const totalOrders = await this.orderModel.countDocuments({
      food_provider: { $in: providerIds },
    });

    // Get active orders (placed or preparing status)
    const activeOrders = await this.orderModel.countDocuments({
      food_provider: { $in: providerIds },
      status: { $in: [OrderStatus.PLACED, OrderStatus.PREPARING] },
    });

    // Get order statistics by status
    const ordersByStatus = await this.orderModel.aggregate([
      { $match: { food_provider: { $in: providerIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Get total menu items
    const totalMenuItems = await this.menuItemModel.countDocuments({
      provider: { $in: providerIds },
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
      providers: providers.map((provider) => ({
        _id: provider._id,
        name: provider.name,
        location: provider.location,
      })),
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
          days,
        },
      };
    }

    const providerIds = providers.map((provider) => provider._id);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get orders within date range
    const orders = await this.orderModel
      .find({
        food_provider: { $in: providerIds },
        createdAt: { $gte: startDate, $lte: endDate },
      })
      .exec();

    // Group orders by date
    const ordersByDate = {};
    orders.forEach((order) => {
      const dateStr = order['createdAt'].toISOString().split('T')[0];
      if (!ordersByDate[dateStr]) {
        ordersByDate[dateStr] = 0;
      }
      ordersByDate[dateStr]++;
    });

    // Group orders by provider
    const ordersByProvider = await this.orderModel.aggregate([
      { $match: { food_provider: { $in: providerIds } } },
      { $group: { _id: '$food_provider', count: { $sum: 1 } } },
    ]);

    // Get provider details for each ID
    const providerDetails = await Promise.all(
      ordersByProvider.map(async (item) => {
        const provider = await this.foodProviderModel.findById(item._id);
        return {
          _id: provider._id,
          name: provider.name,
          orders: item.count,
        };
      }),
    );

    return {
      totalOrders: orders.length,
      ordersByDate,
      ordersByProvider: providerDetails,
      timeframe: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days,
      },
    };
  }

  // Admin methods for food provider management
  async getPendingFoodProviders() {
    return this.foodProviderModel
      .find({ approvalStatus: 'pending' })
      .populate(['location', 'owner'])
      .sort({ createdAt: -1 })
      .exec();
  }

  async getAllForAdmin() {
    return this.foodProviderModel
      .find({})
      .populate(['location', 'owner', 'approvedBy'])
      .sort({ createdAt: -1 })
      .exec();
  }

  async approveFoodProvider(providerId: string, adminId: string) {
    const provider = await this.foodProviderModel.findById(providerId);
    
    if (!provider) {
      throw new NotFoundException(`Food provider with ID ${providerId} not found`);
    }

    provider.approvalStatus = 'approved';
    provider.is_active = true;
    provider.approvedBy = adminId as any;
    provider.approvedAt = new Date();
    provider.rejectionReason = undefined;

    await provider.save();
    await this.clearCache(providerId);

    return {
      message: 'Food provider approved successfully',
      provider: await provider.populate(['location', 'owner', 'approvedBy']),
    };
  }

  async rejectFoodProvider(providerId: string, reason: string, adminId: string) {
    const provider = await this.foodProviderModel.findById(providerId);
    
    if (!provider) {
      throw new NotFoundException(`Food provider with ID ${providerId} not found`);
    }

    provider.approvalStatus = 'rejected';
    provider.is_active = false;
    provider.approvedBy = adminId as any;
    provider.approvedAt = new Date();
    provider.rejectionReason = reason;

    await provider.save();
    await this.clearCache(providerId);

    return {
      message: 'Food provider rejected successfully',
      provider: await provider.populate(['location', 'owner', 'approvedBy']),
    };
  }

  async toggleActiveStatus(providerId: string) {
    const provider = await this.foodProviderModel.findById(providerId);
    
    if (!provider) {
      throw new NotFoundException(`Food provider with ID ${providerId} not found`);
    }

    // Only allow toggling if provider is approved
    if (provider.approvalStatus !== 'approved') {
      throw new ForbiddenException('Can only toggle status of approved food providers');
    }

    provider.is_active = !provider.is_active;
    await provider.save();
    await this.clearCache(providerId);

    return {
      message: `Food provider ${provider.is_active ? 'activated' : 'deactivated'} successfully`,
      provider: await provider.populate(['location', 'owner']),
    };
  }

  async getFoodProviderForAdmin(providerId: string) {
    const provider = await this.foodProviderModel
      .findById(providerId)
      .populate(['location', 'owner', 'approvedBy'])
      .exec();

    if (!provider) {
      throw new NotFoundException(`Food provider with ID ${providerId} not found`);
    }

    // Get additional statistics for admin review
    const stats = await this.getFoodProviderStats(providerId);

    return {
      provider,
      stats,
    };
  }

  private async getFoodProviderStats(providerId: string) {
    // Get order statistics
    const totalOrders = await this.orderModel.countDocuments({
      food_provider: providerId,
    });

    const activeOrders = await this.orderModel.countDocuments({
      food_provider: providerId,
      status: OrderStatus.PLACED,
    });

    const completedOrders = await this.orderModel.countDocuments({
      food_provider: providerId,
      status: OrderStatus.DELIVERED,
    });

    const totalMenuItems = await this.menuItemModel.countDocuments({
      provider: providerId,
    });

    const activeMenuItems = await this.menuItemModel.countDocuments({
      provider: providerId,
      isActive: true,
      approvalStatus: 'approved',
    });

    return {
      totalOrders,
      activeOrders,
      completedOrders,
      totalMenuItems,
      activeMenuItems,
    };
  }

  // Admin methods for menu item management
  async getPendingMenuItems() {
    return this.menuItemModel
      .find({ approvalStatus: 'pending' })
      .populate(['provider'])
      .sort({ createdAt: -1 })
      .exec();
  }

  async approveMenuItem(menuItemId: string, adminId: string) {
    const menuItem = await this.menuItemModel.findById(menuItemId);
    
    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${menuItemId} not found`);
    }

    menuItem.approvalStatus = 'approved';
    menuItem.isActive = true;
    menuItem.approvedBy = adminId as any;
    menuItem.approvedAt = new Date();
    menuItem.rejectionReason = undefined;

    await menuItem.save();

    return {
      message: 'Menu item approved successfully',
      menuItem: await menuItem.populate(['provider']),
    };
  }

  async rejectMenuItem(menuItemId: string, reason: string, adminId: string) {
    const menuItem = await this.menuItemModel.findById(menuItemId);
    
    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${menuItemId} not found`);
    }

    menuItem.approvalStatus = 'rejected';
    menuItem.isActive = false;
    menuItem.approvedBy = adminId as any;
    menuItem.approvedAt = new Date();
    menuItem.rejectionReason = reason;

    await menuItem.save();

    return {
      message: 'Menu item rejected successfully',
      menuItem: await menuItem.populate(['provider']),
    };
  }

  async toggleMenuItemStatus(menuItemId: string) {
    const menuItem = await this.menuItemModel.findById(menuItemId);
    
    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${menuItemId} not found`);
    }

    // Only allow toggling if menu item is approved
    if (menuItem.approvalStatus !== 'approved') {
      throw new ForbiddenException('Can only toggle status of approved menu items');
    }

    menuItem.isActive = !menuItem.isActive;
    await menuItem.save();

    return {
      message: `Menu item ${menuItem.isActive ? 'activated' : 'deactivated'} successfully`,
      menuItem: await menuItem.populate(['provider']),
    };
  }
}
