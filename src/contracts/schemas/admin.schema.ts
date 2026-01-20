import { z } from 'zod';
import { menuCategorySchema, dietaryTagSchema } from './menu.schema';

// Menu Item Form Schema
export const menuItemFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be 500 characters or less'),
  category: menuCategorySchema,
  price: z.number().min(0, 'Price must be positive').max(1000, 'Price seems too high'),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  dietaryTags: z.array(dietaryTagSchema).default([]),
  allergens: z.array(z.string()).default([]),
  servingSize: z.string().max(50).optional(),
  isAvailable: z.boolean().default(true),
  isPopular: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
  calories: z.number().int().min(0).max(5000).optional(),
  preparationTime: z.number().int().min(0).max(480).optional(),
});

// Breakfast Package Form Schema
export const breakfastPackageFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(['continental', 'hot', 'premium']),
  description: z.string().min(1, 'Description is required').max(500),
  pricePerPerson: z.number().min(0, 'Price must be positive').max(100),
  minimumHeadCount: z.number().int().min(1, 'Minimum head count must be at least 1'),
  includedItems: z.array(z.string().min(1)).min(1, 'At least one item is required'),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  isAvailable: z.boolean().default(true),
});

// Snack Package Form Schema
export const snackPackageFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(['basic', 'premium', 'custom']),
  description: z.string().min(1, 'Description is required').max(500),
  pricePerPerson: z.number().min(0, 'Price must be positive').max(100),
  minimumHeadCount: z.number().int().min(1, 'Minimum head count must be at least 1'),
  includedItems: z.array(z.string().min(1)).min(1, 'At least one item is required'),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  isAvailable: z.boolean().default(true),
});

// Order Filters Schema
export const orderFiltersSchema = z.object({
  status: z.enum([
    'draft',
    'pending_payment',
    'confirmed',
    'preparing',
    'ready_for_delivery',
    'out_for_delivery',
    'delivered',
    'cancelled',
  ]).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  customerId: z.string().uuid().optional(),
  searchTerm: z.string().max(100).optional(),
});

// Pagination Schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

// Sort Schema
export const sortSchema = z.object({
  column: z.string(),
  direction: z.enum(['asc', 'desc']).default('desc'),
});

// Admin Stats Query Schema
export const statsQuerySchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

// Update Order Status Schema
export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'draft',
    'pending_payment',
    'confirmed',
    'preparing',
    'ready_for_delivery',
    'out_for_delivery',
    'delivered',
    'cancelled',
  ]),
});

// Inferred types
export type MenuItemFormInput = z.infer<typeof menuItemFormSchema>;
export type BreakfastPackageFormInput = z.infer<typeof breakfastPackageFormSchema>;
export type SnackPackageFormInput = z.infer<typeof snackPackageFormSchema>;
export type OrderFiltersInput = z.infer<typeof orderFiltersSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SortInput = z.infer<typeof sortSchema>;
export type StatsQueryInput = z.infer<typeof statsQuerySchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
