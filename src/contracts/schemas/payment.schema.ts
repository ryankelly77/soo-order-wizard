import { z } from 'zod';

export const paymentStatusSchema = z.enum([
  'pending',
  'processing',
  'succeeded',
  'failed',
  'refunded',
  'cancelled',
]);

export const createPaymentIntentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  amount: z.number().min(100, 'Minimum amount is $1.00'),
  currency: z.string().default('usd'),
});

export const confirmPaymentSchema = z.object({
  paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
  paymentMethodId: z.string().min(1, 'Payment method ID is required'),
});

export const stripeWebhookSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    object: z.object({
      id: z.string(),
      status: z.string(),
      amount: z.number(),
      metadata: z.record(z.string()).optional(),
    }),
  }),
});

export const cardInfoSchema = z.object({
  brand: z.string(),
  last4: z.string().length(4),
  expiryMonth: z.number().min(1).max(12),
  expiryYear: z.number().min(2024),
});

export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;
export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>;
export type StripeWebhookInput = z.infer<typeof stripeWebhookSchema>;
