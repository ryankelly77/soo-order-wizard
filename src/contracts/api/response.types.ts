import type { Order, User, MenuItem, DeliveryTracking, Promotion } from '../types';
import type { ErrorCode } from '../constants';

// Base response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Order responses
export type CreateOrderResponse = ApiResponse<Order>;
export type GetOrderResponse = ApiResponse<Order>;
export type UpdateOrderResponse = ApiResponse<Order>;
export type GetOrdersResponse = ApiResponse<PaginatedResponse<Order>>;

export interface GenerateShareLinkResponse {
  success: boolean;
  shareUrl?: string;
  token?: string;
  expiresAt?: Date;
  error?: ApiError;
}

// Payment responses
export interface CreatePaymentIntentResponse {
  success: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  error?: ApiError;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  status?: string;
  error?: ApiError;
}

// Auth responses
export interface LoginResponse {
  success: boolean;
  user?: User;
  accessToken?: string;
  error?: ApiError;
}

export interface RegisterResponse {
  success: boolean;
  user?: User;
  accessToken?: string;
  error?: ApiError;
}

// Menu responses
export type GetMenuResponse = ApiResponse<{
  breakfastPackages: MenuItem[];
  lunchItems: MenuItem[];
  snackPackages: MenuItem[];
}>;

// Delivery responses
export type GetDeliveryStatusResponse = ApiResponse<DeliveryTracking>;

// Promotion responses
export interface ValidatePromotionResponse {
  success: boolean;
  isValid: boolean;
  promotion?: Promotion;
  discountAmount?: number;
  error?: ApiError;
}
