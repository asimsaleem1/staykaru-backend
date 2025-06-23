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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RoleBasedAccessGuard } from '../../auth/guards/role-based-access.guard';
import { AuthenticatedRequest } from '../../../interfaces/request.interface';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RoleBasedAccessGuard)
@ApiBearerAuth('JWT-auth')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order successfully created' })
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user._id;
    return this.orderService.create(createOrderDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: 200, description: 'Return all orders' })
  async findAll() {
    return this.orderService.findAll();
  }

  @Get('my-orders')
  @ApiOperation({ summary: "Get user's orders (Students only)" })
  @ApiResponse({ status: 200, description: "Return user's orders" })
  async findMyOrders(@Request() req: AuthenticatedRequest) {
    const userId = req.user._id;
    return this.orderService.findByUser(userId);
  }

  @Get('provider-orders')
  @ApiOperation({ summary: "Get food provider's orders (Food Providers only)" })
  @ApiResponse({ status: 200, description: "Return food provider's orders" })
  async findProviderOrders(@Request() req: AuthenticatedRequest) {
    const providerId = req.user._id;
    return this.orderService.findByFoodProvider(providerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by id' })
  @ApiResponse({ status: 200, description: 'Return an order' })
  async findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({
    status: 200,
    description: 'Order status successfully updated',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.orderService.updateStatus(
      id,
      updateOrderStatusDto,
      req.user._id,
    );
  }
}
