import type { DeliveryStatus } from '../types';

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  pending: 'Pending',
  assigned: 'Driver Assigned',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  arriving: 'Arriving Soon',
  delivered: 'Delivered',
  failed: 'Delivery Failed',
};

export const DELIVERY_STATUS_COLORS: Record<DeliveryStatus, string> = {
  pending: 'gray',
  assigned: 'blue',
  picked_up: 'indigo',
  in_transit: 'purple',
  arriving: 'orange',
  delivered: 'green',
  failed: 'red',
};

export const DELIVERY_STATUS_ICONS: Record<DeliveryStatus, string> = {
  pending: 'clock',
  assigned: 'user',
  picked_up: 'package',
  in_transit: 'truck',
  arriving: 'map-pin',
  delivered: 'check-circle',
  failed: 'x-circle',
};
