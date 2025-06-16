import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from '../schema/payment.schema';
import { JazzcashPaymentAdapter } from '../adapters/jazzcash.adapter';
import { CreditCardPaymentAdapter } from '../adapters/credit-card.adapter';
import { PaymentAnalyticsService } from './payment-analytics.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<Payment>,
    private readonly jazzcashAdapter: JazzcashPaymentAdapter,
    private readonly creditCardAdapter: CreditCardPaymentAdapter,
    private readonly analyticsService: PaymentAnalyticsService,
    private readonly configService: ConfigService,
  ) {}

  private getPaymentAdapter(method: PaymentMethod) {
    switch (method) {
      case PaymentMethod.JAZZCASH:
        return this.jazzcashAdapter;
      case PaymentMethod.CREDIT_CARD:
        return this.creditCardAdapter;
      default:
        throw new BadRequestException('Invalid payment method');
    }
  }

  async processPayment(
    createPaymentDto: CreatePaymentDto,
    userId: string,
  ): Promise<Payment> {
    const adapter = this.getPaymentAdapter(createPaymentDto.method);

    const paymentResponse = await adapter.processPayment(
      createPaymentDto.amount,
      'PKR',
      createPaymentDto.metadata,
    );

    if (!paymentResponse.success) {
      throw new BadRequestException(paymentResponse.message);
    }

    const payment = new this.paymentModel({
      user: userId,
      amount: createPaymentDto.amount,
      method: createPaymentDto.method,
      transaction_id: paymentResponse.transaction_id,
      status: PaymentStatus.COMPLETED,
      gateway_response: paymentResponse.gateway_response,
      metadata: createPaymentDto.metadata,
    });

    const savedPayment = await payment.save();

    // Log payment analytics using our analytics service
    await this.analyticsService.logPaymentEvent(savedPayment);

    return savedPayment;
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentModel.find().populate('user').exec();
  }

  async findByUser(userId: string): Promise<Payment[]> {
    return this.paymentModel.find({ user: userId }).populate('user').exec();
  }

  async verifyPayment(transaction_id: string): Promise<boolean> {
    const payment = await this.paymentModel.findOne({ transaction_id }).exec();
    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    const adapter = this.getPaymentAdapter(payment.method);
    return adapter.verifyPayment(transaction_id);
  }
}
