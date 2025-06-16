import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MenuItem } from '../schema/menu-item.schema';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';
import { UpdateMenuItemDto } from '../dto/update-menu-item.dto';
import { FoodProvider } from '../schema/food-provider.schema';

@Injectable()
export class MenuItemService {
  constructor(
    @InjectModel(MenuItem.name)
    private readonly menuItemModel: Model<MenuItem>,
    @InjectModel(FoodProvider.name)
    private readonly foodProviderModel: Model<FoodProvider>,
  ) {}

  async create(
    createMenuItemDto: CreateMenuItemDto,
    userId: string,
  ): Promise<MenuItem> {
    const foodProvider = await this.foodProviderModel.findById(
      createMenuItemDto.provider,
    );

    if (!foodProvider) {
      throw new NotFoundException('Food provider not found');
    }

    if (foodProvider.owner.toString() !== userId) {
      throw new ForbiddenException(
        'You can only add menu items to your own food provider',
      );
    }

    const menuItem = new this.menuItemModel(createMenuItemDto);
    return (await menuItem.save()).populate('provider');
  }

  async findAll(): Promise<MenuItem[]> {
    return this.menuItemModel.find().populate('provider').exec();
  }

  async findOne(id: string): Promise<MenuItem> {
    const menuItem = await this.menuItemModel
      .findById(id)
      .populate('provider')
      .exec();

    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    return menuItem;
  }

  async update(
    id: string,
    updateMenuItemDto: UpdateMenuItemDto,
    userId: string,
  ): Promise<MenuItem> {
    const menuItem = await this.menuItemModel
      .findById(id)
      .populate('provider')
      .exec();

    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    if (menuItem.provider.owner.toString() !== userId) {
      throw new ForbiddenException(
        'You can only update menu items from your own food provider',
      );
    }

    return this.menuItemModel
      .findByIdAndUpdate(id, updateMenuItemDto, { new: true })
      .populate('provider')
      .exec();
  }

  async remove(id: string, userId: string): Promise<void> {
    const menuItem = await this.menuItemModel
      .findById(id)
      .populate('provider')
      .exec();

    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    if (menuItem.provider.owner.toString() !== userId) {
      throw new ForbiddenException(
        'You can only delete menu items from your own food provider',
      );
    }

    await this.menuItemModel.findByIdAndDelete(id).exec();
  }
}
