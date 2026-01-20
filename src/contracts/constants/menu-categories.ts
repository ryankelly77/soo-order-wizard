import type { MenuCategory, DietaryTag } from '../types';

export const MENU_CATEGORY_LABELS: Record<MenuCategory, string> = {
  breakfast: 'Breakfast',
  lunch_entree: 'Entrees',
  lunch_side: 'Sides',
  lunch_salad: 'Salads',
  lunch_sandwich: 'Sandwiches',
  snacks: 'Snacks',
  beverages: 'Beverages',
};

export const MENU_CATEGORY_ORDER: MenuCategory[] = [
  'breakfast',
  'lunch_entree',
  'lunch_sandwich',
  'lunch_salad',
  'lunch_side',
  'snacks',
  'beverages',
];

export const DIETARY_TAG_LABELS: Record<DietaryTag, string> = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  'gluten-free': 'Gluten-Free',
  'dairy-free': 'Dairy-Free',
  'nut-free': 'Nut-Free',
  halal: 'Halal',
  kosher: 'Kosher',
};

export const DIETARY_TAG_ICONS: Record<DietaryTag, string> = {
  vegetarian: 'leaf',
  vegan: 'seedling',
  'gluten-free': 'wheat-off',
  'dairy-free': 'milk-off',
  'nut-free': 'nut-off',
  halal: 'badge-check',
  kosher: 'badge-check',
};
