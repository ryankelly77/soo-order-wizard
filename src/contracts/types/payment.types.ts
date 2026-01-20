export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export interface PaymentIntent {
  id: string;
  orderId: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  clientSecret?: string;
  paymentMethodId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  stripePaymentMethodId: string;
  type: 'card';
  card: CardInfo;
  isDefault: boolean;
  createdAt: Date;
}

export interface CardInfo {
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
}

export interface StripeWebhookPayload {
  id: string;
  type: string;
  data: {
    object: {
      id: string;
      status: string;
      amount: number;
      metadata?: Record<string, string>;
    };
  };
}

export interface Invoice {
  id: string;
  orderId: string;
  userId: string;
  invoiceNumber: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  paidAt?: Date;
  createdAt: Date;
}
