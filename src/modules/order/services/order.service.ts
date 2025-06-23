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
    try {
      // Validate menu items exist and belong to the food provider
      const menuItemIds = createOrderDto.items.map(item => item.menu_item);
      const menuItems = await this.menuItemModel
        .find({
          _id: { $in: menuItemIds },
          food_provider: createOrderDto.food_provider,
        })
        .exec();

      if (menuItems.length !== menuItemIds.length) {
        throw new BadRequestException('One or more menu items are invalid or do not belong to the specified food provider');
      }

      // Calculate total based on actual menu item prices
      let calculatedTotal = 0;
      const orderItems = createOrderDto.items.map((item) => {
        const menuItem = menuItems.find(mi => mi._id.toString() === item.menu_item);
        calculatedTotal += menuItem.price * item.quantity;
        
        return {
          menu_item: item.menu_item,
          quantity: item.quantity,
          price: menuItem.price,
          special_instructions: item.special_instructions,
        };
      });

      // Create order with all required fields
      const orderData = {
        food_provider: createOrderDto.food_provider,
        user: userId,
        items: orderItems,
        delivery_location: {
          coordinates: {
            latitude: createOrderDto.delivery_location.coordinates.latitude,
            longitude: createOrderDto.delivery_location.coordinates.longitude,
          },
          address: createOrderDto.delivery_location.address,
          landmark: createOrderDto.delivery_location.landmark,
        },
        total_price: calculatedTotal,
        status: OrderStatus.PLACED,
        delivery_instructions: createOrderDto.delivery_instructions,
        tracking_history: [{
          location: {
            latitude: 0, // Will be updated by delivery service
            longitude: 0,
          },
          status: OrderStatus.PLACED,
          timestamp: new Date(),
        }],
      };

      console.log('Creating order with data:', JSON.stringify(orderData, null, 2));

      const order = new this.orderModel(orderData);
      const savedOrder = await order.save();

      console.log('Order saved successfully:', savedOrder._id);

      // Populate and return
      const populatedOrder = await this.orderModel
        .findById(savedOrder._id)
        .populate(['user', 'food_provider', 'items.menu_item'])
        .exec();

      return populatedOrder || savedOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      if (error.name === 'ValidationError') {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
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
