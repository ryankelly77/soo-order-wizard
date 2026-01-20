import { z } from 'zod';

export const menuCategorySchema = z.enum([
  'breakfast',
  'lunch_entree',
  'lunch_side',
  'lunch_salad',
  'lunch_sandwich',
  'snacks',
  'beverages',
]);

export const dietaryTagSchema = z.enum([
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'nut-free',
  'halal',
  'kosher',
]);

export const menuItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  category: menuCategorySchema,
  price: z.number().min(0, 'Price must be positive'),
  imageUrl: z.string().url().optional(),
  dietaryTags: z.array(dietaryTagSchema),
  allergens: z.array(z.string()),
  isAvailable: z.boolean(),
  isPopular: z.boolean().optional(),
  servingSize: z.string().optional(),
  calories: z.number().optional(),
  preparationTime: z.number().optional(),
});

export const breakfastPackageSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: z.enum(['continental', 'hot', 'premium']),
  description: z.string(),
  pricePerPerson: z.number().min(0),
  minimumHeadCount: z.number().min(1),
  includedItems: z.array(z.string()),
  imageUrl: z.string().url().optional(),
});

export const snackPackageSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: z.enum(['basic', 'premium', 'custom']),
  description: z.string(),
  pricePerPerson: z.number().min(0),
  minimumHeadCount: z.number().min(1),
  includedItems: z.array(z.string()),
  imageUrl: z.string().url().optional(),
});

export type MenuItemInput = z.infer<typeof menuItemSchema>;
export type BreakfastPackageInput = z.infer<typeof breakfastPackageSchema>;
export type SnackPackageInput = z.infer<typeof snackPackageSchema>;
