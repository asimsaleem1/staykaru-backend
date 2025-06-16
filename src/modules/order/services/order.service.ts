import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Order, OrderStatus } from '../schema/order.schema';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { MenuItem } from '../../food_service/schema/menu-item.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    @InjectModel(MenuItem.name) private readonly menuItemModel: Model<MenuItem>,
    private readonly configService: ConfigService,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: string): Promise<Order> {
    // Calculate total price and validate menu items
    let totalPrice = 0;
    const validatedItems = await Promise.all(
      createOrderDto.items.map(async (item) => {
        const menuItem = await this.menuItemModel.findById(item.menu_item);
        if (!menuItem) {
          throw new NotFoundException(`Menu item ${item.menu_item} not found`);
        }
        if (menuItem.provider.toString() !== createOrderDto.food_provider) {
          throw new BadRequestException(
            'All items must be from the same food provider',
          );
        }
        totalPrice += menuItem.price * item.quantity;
        return item;
      }),
    );

    const order = new this.orderModel({
      ...createOrderDto,
      items: validatedItems,
      total_price: totalPrice,
      user: userId,
      status: OrderStatus.PLACED,
    });

    const savedOrder = await (
      await order.save()
    ).populate(['user', 'food_provider', 'items.menu_item']);

    // Log order analytics using MongoDB
    try {
      await this.orderModel.db.collection('order_analytics').insertOne({
        orderId: savedOrder._id.toString(),
        userId: userId,
        providerId: createOrderDto.food_provider,
        status: savedOrder.status,
        totalAmount: totalPrice,
        itemCount: createOrderDto.items.length,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Error logging order analytics:', error);
    }

    // Notify food provider about the new order using MongoDB
    try {
      await this.orderModel.db.collection('order_notifications').insertOne({
        order_id: savedOrder._id.toString(),
        user_id: savedOrder.food_provider.owner.toString(),
        message: `New order received worth ${totalPrice}`,
        createdAt: new Date(),
        read: false,
      });
    } catch (error) {
      console.error('Error creating order notification:', error);
    }

    return savedOrder;
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel
      .find()
      .populate(['user', 'food_provider', 'items.menu_item'])
      .exec();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel
      .findById(id)
      .populate(['user', 'food_provider', 'items.menu_item'])
      .exec();

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.orderModel
      .find({ user: userId })
      .populate(['user', 'food_provider', 'items.menu_item'])
      .exec();
  }

  async findByFoodProvider(foodProviderId: string): Promise<Order[]> {
    return this.orderModel
      .find({ food_provider: foodProviderId })
      .populate(['user', 'food_provider', 'items.menu_item'])
      .exec();
  }

  async updateStatus(
    id: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
    providerId: string,
  ): Promise<Order> {
    const order = await this.orderModel
      .findById(id)
      .populate(['user', 'food_provider', 'items.menu_item'])
      .exec();

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (order.food_provider._id.toString() !== providerId) {
      throw new BadRequestException(
        'You can only update orders for your own food service',
      );
    }

    order.status = updateOrderStatusDto.status;
    const updatedOrder = await order.save();

    // Notify the student about the order status change using MongoDB
    try {
      await this.orderModel.db.collection('order_notifications').insertOne({
        orderId: order._id.toString(),
        userId: order.user.toString(),
        message: `Your order status has been updated to ${updateOrderStatusDto.status}`,
        createdAt: new Date(),
        read: false,
      });
    } catch (error) {
      console.error('Error creating order notification:', error);
    }

    return updatedOrder;
  }
}
