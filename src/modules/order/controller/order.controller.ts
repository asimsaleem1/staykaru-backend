import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { FoodProviderGuard } from '../../food_service/guards/food-provider.guard';

@ApiTags('orders')
@Controller('orders')
// @UseGuards(AuthGuard) // Temporarily disabled for testing
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order successfully created' })
  async create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    // For testing without authentication, use a dummy user ID
    const userId = req.user?._id || '507f1f77bcf86cd799439011';
    return this.orderService.create(createOrderDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: 200, description: 'Return all orders' })
  async findAll() {
    return this.orderService.findAll();
  }

  @Get('my-orders')
  @ApiOperation({ summary: 'Get user\'s orders' })
  @ApiResponse({ status: 200, description: 'Return user\'s orders' })
  async findMyOrders(@Request() req) {
    return this.orderService.findByUser(req.user._id);
  }

  @Get('provider-orders')
  // @UseGuards(FoodProviderGuard) // Temporarily disabled for testing
  @ApiOperation({ summary: 'Get food provider\'s orders' })
  @ApiResponse({ status: 200, description: 'Return food provider\'s orders' })
  async findProviderOrders(@Request() req) {
    return this.orderService.findByFoodProvider(req.user._id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by id' })
  @ApiResponse({ status: 200, description: 'Return an order' })
  async findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Put(':id/status')
  // @UseGuards(FoodProviderGuard) // Temporarily disabled for testing
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: 200, description: 'Order status successfully updated' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @Request() req,
  ) {
    return this.orderService.updateStatus(id, updateOrderStatusDto, req.user._id);
  }
}