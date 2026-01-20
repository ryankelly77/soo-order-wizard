import type { Order, EventDetails, DeliveryInfo } from '../types';

export const mockEventDetails: EventDetails = {
  eventName: 'Q1 Team Meeting',
  eventDate: new Date('2024-03-15'),
  eventTime: '12:00 PM',
  headCount: 25,
  companyName: 'Acme Corp',
  contactName: 'John Smith',
  contactEmail: 'john.smith@acme.com',
  contactPhone: '512-555-1234',
  specialRequests: 'Please set up in conference room A',
};

export const mockDeliveryInfo: DeliveryInfo = {
  address: '123 Business Blvd',
  addressLine2: 'Suite 400',
  city: 'Austin',
  state: 'TX',
  zipCode: '78701',
  deliveryInstructions: 'Enter through main lobby, take elevator to 4th floor',
  preferredDeliveryTime: '11:30 AM',
};

export const mockOrder: Order = {
  id: 'order-123',
  userId: 'user-456',
  guestEmail: null,
  status: 'confirmed',
  eventDetails: mockEventDetails,
  breakfast: {
    packageType: 'continental',
    headCount: 25,
    items: [],
  },
  lunchSelections: [
    {
      id: 'ls-1',
      attendeeId: 'att-1',
      attendeeName: 'Alice Johnson',
      attendeeEmail: 'alice@acme.com',
      menuItemId: 'lunch-1',
      menuItemName: 'Grilled Chicken Caesar Salad',
      dietaryRestrictions: ['gluten-free'],
      selectedAt: new Date(),
    },
    {
      id: 'ls-2',
      attendeeId: 'att-2',
      attendeeName: 'Bob Williams',
      attendeeEmail: 'bob@acme.com',
      menuItemId: 'lunch-2',
      menuItemName: 'Turkey Club Sandwich',
      selectedAt: new Date(),
    },
  ],
  snacks: {
    packageType: 'premium',
    items: [],
  },
  delivery: mockDeliveryInfo,
  payment: {
    method: 'card',
    stripePaymentIntentId: 'pi_123456',
    paidAt: new Date(),
  },
  subtotal: 850.0,
  tax: 70.13,
  deliveryFee: 25.0,
  total: 945.13,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockOrders: Order[] = [
  mockOrder,
  {
    ...mockOrder,
    id: 'order-124',
    status: 'pending_payment',
    eventDetails: {
      ...mockEventDetails,
      eventName: 'Product Launch',
      eventDate: new Date('2024-03-20'),
      headCount: 50,
    },
    payment: {
      method: 'card',
    },
    total: 1890.26,
  },
];
