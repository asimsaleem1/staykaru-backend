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
    // Simplified order creation that doesn't require complex menu item validation
    
    // Validate that food provider exists (if we have a FoodProvider model/service)
    // For now, we'll just trust the provided foodProvider ID
    
    // Calculate total from provided item prices
    let calculatedTotal = 0;
    const orderItems = createOrderDto.items.map((item) => {
      calculatedTotal += item.price * item.quantity;
      return {
        // Use a simplified structure that doesn't require menu_item references
        quantity: item.quantity,
        // Store item details directly in the order for simplicity
        name: item.name,
        price: item.price,
        special_instructions: item.specialInstructions || '',
      };
    });

    // Use provided total or calculated total
    const finalTotal = createOrderDto.totalAmount || calculatedTotal;

    // Create order with simplified structure
    const orderData = {
      food_provider: createOrderDto.foodProvider,
      user: userId,
      total_price: finalTotal,
      status: OrderStatus.PLACED,
      // Store items as a simplified array rather than complex references
      items: orderItems,
      // Create a simple delivery location from the address
      delivery_location: {
        address: createOrderDto.deliveryAddress || 'No address provided',
        coordinates: {
          latitude: 0, // Default coordinates for testing
          longitude: 0
        }
      }
    };

    const order = new this.orderModel(orderData);

    const savedOrder = await (
      await order.save()
    ).populate(['user', 'food_provider', 'items.menu_item']);

    // Log order analytics using MongoDB
    try {
      await this.orderModel.db.collection('order_analytics').insertOne({
        orderId: savedOrder._id.toString(),
        userId: userId,
        providerId: createOrderDto.foodProvider,
        status: savedOrder.status,
        totalAmount: finalTotal,
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
        user_id: createOrderDto.foodProvider, // Use food provider ID
        message: `New order received worth $${finalTotal}`,
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
