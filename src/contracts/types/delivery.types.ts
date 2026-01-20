export type DeliveryStatus =
  | 'pending'
  | 'assigned'
  | 'picked_up'
  | 'in_transit'
  | 'arriving'
  | 'delivered'
  | 'failed';

export interface DeliveryTracking {
  orderId: string;
  shipdayOrderId?: string;
  status: DeliveryStatus;
  driver?: DriverInfo;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  currentLocation?: GeoLocation;
  trackingUrl?: string;
  statusHistory: DeliveryStatusUpdate[];
}

export interface DriverInfo {
  id: string;
  name: string;
  phone: string;
  photoUrl?: string;
  vehicleInfo?: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  updatedAt: Date;
}

export interface DeliveryStatusUpdate {
  status: DeliveryStatus;
  timestamp: Date;
  note?: string;
  location?: GeoLocation;
}

export interface ShipdayWebhookPayload {
  orderId: string;
  status: string;
  timestamp: string;
  driverInfo?: {
    name: string;
    phone: string;
    latitude?: number;
    longitude?: number;
  };
}
