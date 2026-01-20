import { TAX_RATE, DELIVERY_FEE, MINIMUM_ORDER_AMOUNT } from '@/contracts/constants';
import type { Order, BreakfastSelection, SnackSelection } from '@/contracts/types';

const BREAKFAST_PRICES = {
  continental: 12.99,
  hot: 18.99,
  premium: 24.99,
} as const;

const SNACK_PRICES = {
  basic: 6.99,
  premium: 12.99,
  custom: 15.99,
} as const;

const LUNCH_PRICE_PER_PERSON = 14.99;

export function calculateBreakfastTotal(breakfast: BreakfastSelection | undefined): number {
  if (!breakfast) return 0;
  return BREAKFAST_PRICES[breakfast.packageType] * breakfast.headCount;
}

export function calculateLunchTotal(lunchCount: number): number {
  return LUNCH_PRICE_PER_PERSON * lunchCount;
}

export function calculateSnacksTotal(
  snacks: SnackSelection | undefined,
  headCount: number
): number {
  if (!snacks) return 0;
  return SNACK_PRICES[snacks.packageType] * headCount;
}

export function calculateSubtotal(
  breakfast: BreakfastSelection | undefined,
  lunchCount: number,
  snacks: SnackSelection | undefined,
  headCount: number
): number {
  return (
    calculateBreakfastTotal(breakfast) +
    calculateLunchTotal(lunchCount) +
    calculateSnacksTotal(snacks, headCount)
  );
}

export function calculateTax(subtotal: number): number {
  return subtotal * TAX_RATE;
}

export function calculateTotal(subtotal: number, discountAmount: number = 0): number {
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const tax = calculateTax(afterDiscount);
  return afterDiscount + tax + DELIVERY_FEE;
}

export function calculateOrderTotal(order: Partial<Order>): {
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discountAmount: number;
  total: number;
} {
  const subtotal = calculateSubtotal(
    order.breakfast,
    order.lunchSelections?.length || 0,
    order.snacks,
    order.eventDetails?.headCount || 0
  );

  const discountAmount = order.discountAmount || 0;
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const tax = calculateTax(afterDiscount);
  const total = afterDiscount + tax + DELIVERY_FEE;

  return {
    subtotal,
    tax,
    deliveryFee: DELIVERY_FEE,
    discountAmount,
    total,
  };
}

export function meetsMinimumOrder(subtotal: number): boolean {
  return subtotal >= MINIMUM_ORDER_AMOUNT;
}

export function getMinimumOrderShortfall(subtotal: number): number {
  return Math.max(0, MINIMUM_ORDER_AMOUNT - subtotal);
}

export function formatLineItem(
  name: string,
  quantity: number,
  unitPrice: number
): string {
  const total = quantity * unitPrice;
  return `${name} (x${quantity}) - $${total.toFixed(2)}`;
}
