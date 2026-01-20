export * from './order-status';
export * from './delivery-status';
export * from './menu-categories';
export * from './error-codes';

// Pricing constants
export const MINIMUM_ORDER_AMOUNT = 150; // $150 minimum
export const DELIVERY_FEE = 25; // $25 flat delivery fee
export const TAX_RATE = 0.0825; // 8.25% Texas tax rate

// Time constants
export const MINIMUM_ORDER_LEAD_TIME_HOURS = 24;
export const LUNCH_SELECTION_DEADLINE_HOURS = 48;

// Head count limits
export const MINIMUM_HEAD_COUNT = 10;
export const MAXIMUM_HEAD_COUNT = 500;

// Share link expiration
export const SHARE_LINK_EXPIRATION_DAYS = 7;
