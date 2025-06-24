import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../../../interfaces/request.interface';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Process a new payment' })
  @ApiResponse({ status: 201, description: 'Payment successfully processed' })
  async processPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user._id;
    return this.paymentService.processPayment(createPaymentDto, userId);
  }

  @Get('methods')
  @ApiOperation({ summary: 'Get available payment methods' })
  @ApiResponse({ status: 200, description: 'Payment methods retrieved successfully' })
  async getPaymentMethods() {
    return {
      success: true,
      paymentMethods: [
        {
          id: 'cash_on_delivery',
          name: 'Cash on Delivery',
          description: 'Pay when your order is delivered',
          icon: 'cash',
          enabled: true,
          fee: 0
        },
        {
          id: 'jazzcash',
          name: 'JazzCash',
          description: 'Pay using JazzCash mobile wallet',
          icon: 'jazzcash',
          enabled: true,
          fee: 0
        },
        {
          id: 'easypaisa',
          name: 'EasyPaisa',
          description: 'Pay using EasyPaisa mobile wallet',
          icon: 'easypaisa',
          enabled: true,
          fee: 0
        },
        {
          id: 'credit_card',
          name: 'Credit Card',
          description: 'Pay using Visa/MasterCard',
          icon: 'credit-card',
          enabled: true,
          fee: 25
        },
        {
          id: 'debit_card',
          name: 'Debit Card',
          description: 'Pay using your bank debit card',
          icon: 'debit-card',
          enabled: true,
          fee: 15
        },
        {
          id: 'bank_transfer',
          name: 'Bank Transfer',
          description: 'Direct bank transfer',
          icon: 'bank',
          enabled: true,
          fee: 0
        },
        {
          id: 'mobile_wallet',
          name: 'Mobile Wallet',
          description: 'Other mobile wallet services',
          icon: 'mobile',
          enabled: true,
          fee: 10
        }
      ]
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({ status: 200, description: 'Return all payments' })
  async findAll() {
    return this.paymentService.findAll();
  }

  @Get('my-payments')
  @ApiOperation({ summary: "Get user's payments" })
  @ApiResponse({ status: 200, description: "Return user's payments" })
  async findMyPayments(@Request() req: AuthenticatedRequest) {
    const userId = req.user._id;
    return this.paymentService.findByUser(userId);
  }

  @Get('verify/:transaction_id')
  @ApiOperation({ summary: 'Verify a payment' })
  @ApiResponse({ status: 200, description: 'Payment verification status' })
  async verifyPayment(@Param('transaction_id') transaction_id: string) {
    return {
      verified: await this.paymentService.verifyPayment(transaction_id),
    };
  }
}
