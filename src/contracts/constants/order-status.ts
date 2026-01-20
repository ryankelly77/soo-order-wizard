import type { OrderStatus } from '../types';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Draft',
  pending_payment: 'Pending Payment',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready_for_delivery: 'Ready for Delivery',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  draft: 'gray',
  pending_payment: 'yellow',
  confirmed: 'blue',
  preparing: 'indigo',
  ready_for_delivery: 'purple',
  out_for_delivery: 'orange',
  delivered: 'green',
  cancelled: 'red',
};

export const EDITABLE_ORDER_STATUSES: OrderStatus[] = [
  'draft',
  'pending_payment',
];

export const CANCELLABLE_ORDER_STATUSES: OrderStatus[] = [
  'draft',
  'pending_payment',
  'confirmed',
];
