export type OrderStatus =
  | 'draft'
  | 'pending_payment'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_delivery'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type MealType = 'breakfast' | 'lunch' | 'snacks';

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  specialInstructions?: string;
  dietaryTags?: string[];
}

export interface BreakfastSelection {
  packageType: 'continental' | 'hot' | 'premium';
  headCount: number;
  items: OrderItem[];
}

export interface LunchSelection {
  id: string;
  attendeeId: string;
  attendeeName: string;
  attendeeEmail: string;
  menuItemId: string;
  menuItemName: string;
  specialInstructions?: string;
  dietaryRestrictions?: string[];
  selectedAt: Date;
}

export interface SnackSelection {
  packageType: 'basic' | 'premium' | 'custom';
  items: OrderItem[];
}

export interface Order {
  id: string;
  userId: string | null; // Nullable for guest orders
  guestEmail: string | null; // Set for guest checkout orders
  status: OrderStatus;
  eventDetails: EventDetails;
  breakfast?: BreakfastSelection;
  lunchSelections: LunchSelection[];
  snacks?: SnackSelection;
  delivery: DeliveryInfo;
  payment: PaymentInfo;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  promotionCode?: string;
  discountAmount?: number;
  shareToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Checkout mode for guest vs authenticated users
export type CheckoutMode = 'guest' | 'create-account' | 'sign-in';

export interface GuestCheckoutInfo {
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface EventDetails {
  eventName: string;
  eventDate: Date;
  eventTime: string;
  headCount: number;
  companyName?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  specialRequests?: string;
}

export interface DeliveryInfo {
  address: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  deliveryInstructions?: string;
  preferredDeliveryTime: string;
  breakfastDeliveryTime?: string;
  lunchDeliveryTime?: string;
  contactName?: string;
  contactPhone?: string;
}

export interface PaymentInfo {
  method: 'card' | 'invoice';
  stripePaymentIntentId?: string;
  paidAt?: Date;
  invoiceNumber?: string;
}
