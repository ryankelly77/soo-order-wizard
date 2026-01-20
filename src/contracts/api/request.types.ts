import type { EventDetails, DeliveryInfo } from '../types';

// Order API requests
export interface CreateOrderRequest {
  eventDetails: EventDetails;
  breakfast?: {
    packageType: 'continental' | 'hot' | 'premium';
    headCount: number;
  };
  snacks?: {
    packageType: 'basic' | 'premium' | 'custom';
  };
  delivery: DeliveryInfo;
  promotionCode?: string;
}

export interface UpdateOrderRequest {
  eventDetails?: Partial<EventDetails>;
  breakfast?: {
    packageType: 'continental' | 'hot' | 'premium';
    headCount: number;
  };
  snacks?: {
    packageType: 'basic' | 'premium' | 'custom';
  };
  delivery?: Partial<DeliveryInfo>;
  promotionCode?: string;
}

export interface AddLunchSelectionRequest {
  attendeeName: string;
  attendeeEmail: string;
  menuItemId: string;
  specialInstructions?: string;
  dietaryRestrictions?: string[];
}

// Payment API requests
export interface CreatePaymentIntentRequest {
  orderId: string;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  paymentMethodId: string;
}

// Auth API requests
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  companyName?: string;
}

// Share link requests
export interface GenerateShareLinkRequest {
  orderId: string;
  expirationDays?: number;
}

// Promotion requests
export interface ValidatePromotionRequest {
  code: string;
  orderSubtotal: number;
}
