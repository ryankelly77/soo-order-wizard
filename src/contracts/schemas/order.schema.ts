import { z } from 'zod';

export const orderStatusSchema = z.enum([
  'draft',
  'pending_payment',
  'confirmed',
  'preparing',
  'ready_for_delivery',
  'out_for_delivery',
  'delivered',
  'cancelled',
]);

export const eventDetailsSchema = z.object({
  eventName: z.string().min(1, 'Event name is required'),
  eventDate: z.coerce.date(),
  eventTime: z.string().min(1, 'Event time is required'),
  headCount: z.number().min(1, 'At least 1 person required'),
  companyName: z.string().optional(),
  contactName: z.string().min(1, 'Contact name is required'),
  contactEmail: z.string().email('Valid email is required'),
  contactPhone: z.string().min(10, 'Valid phone number is required'),
  specialRequests: z.string().optional(),
});

export const deliveryInfoSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State must be 2 characters'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  deliveryInstructions: z.string().optional(),
  preferredDeliveryTime: z.string().min(1, 'Delivery time is required'),
});

export const orderItemSchema = z.object({
  id: z.string(),
  menuItemId: z.string(),
  name: z.string(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  specialInstructions: z.string().optional(),
  dietaryTags: z.array(z.string()).optional(),
});

export const lunchSelectionSchema = z.object({
  id: z.string(),
  attendeeId: z.string(),
  attendeeName: z.string().min(1, 'Name is required'),
  attendeeEmail: z.string().email('Valid email is required'),
  menuItemId: z.string().min(1, 'Menu selection is required'),
  menuItemName: z.string(),
  specialInstructions: z.string().optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  selectedAt: z.coerce.date(),
});

export const guestCheckoutSchema = z.object({
  email: z.string().email('Valid email is required'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const createOrderSchema = z.object({
  eventDetails: eventDetailsSchema,
  breakfast: z
    .object({
      packageType: z.enum(['continental', 'hot', 'premium']),
      headCount: z.number().min(1),
      items: z.array(orderItemSchema),
    })
    .optional(),
  lunchSelections: z.array(lunchSelectionSchema).optional(),
  snacks: z
    .object({
      packageType: z.enum(['basic', 'premium', 'custom']),
      items: z.array(orderItemSchema),
    })
    .optional(),
  delivery: deliveryInfoSchema,
  promotionCode: z.string().optional(),
  // Guest checkout fields
  isGuest: z.boolean().optional(),
  guestEmail: z.string().email().optional(),
}).refine(
  (data) => {
    // If isGuest is true, guestEmail is required
    if (data.isGuest && !data.guestEmail) {
      return false;
    }
    return true;
  },
  {
    message: 'Guest email is required for guest checkout',
    path: ['guestEmail'],
  }
);

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type EventDetailsInput = z.infer<typeof eventDetailsSchema>;
export type DeliveryInfoInput = z.infer<typeof deliveryInfoSchema>;
export type LunchSelectionInput = z.infer<typeof lunchSelectionSchema>;
export type GuestCheckoutInput = z.infer<typeof guestCheckoutSchema>;
