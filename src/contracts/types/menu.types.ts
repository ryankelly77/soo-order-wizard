export type MenuCategory =
  | 'breakfast'
  | 'lunch_entree'
  | 'lunch_side'
  | 'lunch_salad'
  | 'lunch_sandwich'
  | 'snacks'
  | 'beverages';

export type DietaryTag =
  | 'vegetarian'
  | 'vegan'
  | 'gluten-free'
  | 'dairy-free'
  | 'nut-free'
  | 'halal'
  | 'kosher';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: MenuCategory;
  price: number;
  imageUrl?: string;
  dietaryTags: DietaryTag[];
  allergens: string[];
  isAvailable: boolean;
  isPopular?: boolean;
  servingSize?: string;
  calories?: number;
  preparationTime?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BreakfastPackage {
  id: string;
  name: string;
  type: 'continental' | 'hot' | 'premium';
  description: string;
  pricePerPerson: number;
  minimumHeadCount: number;
  includedItems: string[];
  imageUrl?: string;
}

export interface SnackPackage {
  id: string;
  name: string;
  type: 'basic' | 'premium' | 'custom';
  description: string;
  pricePerPerson: number;
  minimumHeadCount: number;
  includedItems: string[];
  imageUrl?: string;
}

export interface Menu {
  breakfastPackages: BreakfastPackage[];
  lunchItems: MenuItem[];
  snackPackages: SnackPackage[];
}
