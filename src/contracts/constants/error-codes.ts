export const ERROR_CODES = {
  // Auth errors
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_EMAIL_EXISTS: 'AUTH_EMAIL_EXISTS',
  AUTH_SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',

  // Order errors
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  ORDER_INVALID_STATUS: 'ORDER_INVALID_STATUS',
  ORDER_CANNOT_MODIFY: 'ORDER_CANNOT_MODIFY',
  ORDER_MINIMUM_NOT_MET: 'ORDER_MINIMUM_NOT_MET',

  // Payment errors
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_CARD_DECLINED: 'PAYMENT_CARD_DECLINED',
  PAYMENT_INSUFFICIENT_FUNDS: 'PAYMENT_INSUFFICIENT_FUNDS',

  // Delivery errors
  DELIVERY_ADDRESS_INVALID: 'DELIVERY_ADDRESS_INVALID',
  DELIVERY_OUT_OF_RANGE: 'DELIVERY_OUT_OF_RANGE',

  // Promotion errors
  PROMOTION_INVALID: 'PROMOTION_INVALID',
  PROMOTION_EXPIRED: 'PROMOTION_EXPIRED',
  PROMOTION_USAGE_LIMIT: 'PROMOTION_USAGE_LIMIT',
  PROMOTION_MINIMUM_NOT_MET: 'PROMOTION_MINIMUM_NOT_MET',

  // Menu errors
  MENU_ITEM_UNAVAILABLE: 'MENU_ITEM_UNAVAILABLE',

  // General errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password',
  [ERROR_CODES.AUTH_EMAIL_EXISTS]: 'An account with this email already exists',
  [ERROR_CODES.AUTH_SESSION_EXPIRED]: 'Your session has expired. Please log in again',
  [ERROR_CODES.AUTH_UNAUTHORIZED]: 'You are not authorized to perform this action',
  [ERROR_CODES.ORDER_NOT_FOUND]: 'Order not found',
  [ERROR_CODES.ORDER_INVALID_STATUS]: 'Invalid order status',
  [ERROR_CODES.ORDER_CANNOT_MODIFY]: 'This order cannot be modified',
  [ERROR_CODES.ORDER_MINIMUM_NOT_MET]: 'Order minimum not met',
  [ERROR_CODES.PAYMENT_FAILED]: 'Payment failed. Please try again',
  [ERROR_CODES.PAYMENT_CARD_DECLINED]: 'Your card was declined',
  [ERROR_CODES.PAYMENT_INSUFFICIENT_FUNDS]: 'Insufficient funds',
  [ERROR_CODES.DELIVERY_ADDRESS_INVALID]: 'Invalid delivery address',
  [ERROR_CODES.DELIVERY_OUT_OF_RANGE]: 'Delivery address is out of our service range',
  [ERROR_CODES.PROMOTION_INVALID]: 'Invalid promotion code',
  [ERROR_CODES.PROMOTION_EXPIRED]: 'This promotion has expired',
  [ERROR_CODES.PROMOTION_USAGE_LIMIT]: 'This promotion has reached its usage limit',
  [ERROR_CODES.PROMOTION_MINIMUM_NOT_MET]: 'Order minimum not met for this promotion',
  [ERROR_CODES.MENU_ITEM_UNAVAILABLE]: 'This menu item is currently unavailable',
  [ERROR_CODES.VALIDATION_ERROR]: 'Please check your input and try again',
  [ERROR_CODES.INTERNAL_ERROR]: 'Something went wrong. Please try again later',
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please wait and try again',
};
