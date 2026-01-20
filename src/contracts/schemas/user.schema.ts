import { z } from 'zod';

export const userRoleSchema = z.enum(['customer', 'admin', 'staff']);

export const deliveryAddressSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State must be 2 characters'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  isDefault: z.boolean(),
});

export const communicationPreferencesSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  marketingEmails: z.boolean(),
});

export const userPreferencesSchema = z.object({
  defaultDeliveryAddress: deliveryAddressSchema.optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  favoriteMenuItems: z.array(z.string()).optional(),
  communicationPreferences: communicationPreferencesSchema,
});

export const createUserSchema = z.object({
  email: z.string().email('Valid email is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  preferences: userPreferencesSchema.optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const attendeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  dietaryRestrictions: z.array(z.string()).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AttendeeInput = z.infer<typeof attendeeSchema>;
