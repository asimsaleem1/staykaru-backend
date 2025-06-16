export interface PaymentGatewayResponse {
  success: boolean;
  transaction_id: string;
  message: string;
  gateway_response?: any;
}

export interface PaymentGateway {
  processPayment(
    amount: number,
    currency: string,
    metadata: any,
  ): Promise<PaymentGatewayResponse>;
  verifyPayment(transaction_id: string): Promise<boolean>;
  refundPayment(transaction_id: string): Promise<boolean>;
}
