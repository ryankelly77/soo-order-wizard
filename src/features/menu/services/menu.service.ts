import { createClient } from '@/lib/supabase/client';
import type { MenuItem, BreakfastPackage, SnackPackage, Menu } from '@/contracts/types';

export async function getMenu(): Promise<Menu> {
  const supabase = createClient();

  const [breakfastRes, lunchRes, snacksRes] = await Promise.all([
    supabase.from('breakfast_packages').select('*').eq('is_available', true),
    supabase.from('menu_items').select('*').eq('is_available', true),
    supabase.from('snack_packages').select('*').eq('is_available', true),
  ]);

  if (breakfastRes.error) throw new Error(breakfastRes.error.message);
  if (lunchRes.error) throw new Error(lunchRes.error.message);
  if (snacksRes.error) throw new Error(snacksRes.error.message);

  return {
    breakfastPackages: breakfastRes.data.map(mapBreakfastPackageFromDb),
    lunchItems: lunchRes.data.map(mapMenuItemFromDb),
    snackPackages: snacksRes.data.map(mapSnackPackageFromDb),
  };
}

export async function getBreakfastPackages(): Promise<BreakfastPackage[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('breakfast_packages')
    .select('*')
    .eq('is_available', true)
    .order('price_per_person', { ascending: true });

  if (error) throw new Error(error.message);

  return data.map(mapBreakfastPackageFromDb);
}

export async function getLunchItems(): Promise<MenuItem[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('is_available', true)
    .in('category', ['lunch_entree', 'lunch_side', 'lunch_salad', 'lunch_sandwich'])
    .order('is_popular', { ascending: false });

  if (error) throw new Error(error.message);

  return data.map(mapMenuItemFromDb);
}

export async function getSnackPackages(): Promise<SnackPackage[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('snack_packages')
    .select('*')
    .eq('is_available', true)
    .order('price_per_person', { ascending: true });

  if (error) throw new Error(error.message);

  return data.map(mapSnackPackageFromDb);
}

export async function getMenuItem(itemId: string): Promise<MenuItem | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', itemId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }

  return mapMenuItemFromDb(data);
}

function mapMenuItemFromDb(data: Record<string, unknown>): MenuItem {
  return {
    id: data.id as string,
    name: data.name as string,
    description: data.description as string,
    category: data.category as MenuItem['category'],
    price: data.price as number,
    imageUrl: data.image_url as string | undefined,
    dietaryTags: (data.dietary_tags as MenuItem['dietaryTags']) || [],
    allergens: (data.allergens as string[]) || [],
    isAvailable: data.is_available as boolean,
    isPopular: data.is_popular as boolean | undefined,
    servingSize: data.serving_size as string | undefined,
    calories: data.calories as number | undefined,
    preparationTime: data.preparation_time as number | undefined,
    createdAt: new Date(data.created_at as string),
    updatedAt: new Date(data.updated_at as string),
  };
}

function mapBreakfastPackageFromDb(data: Record<string, unknown>): BreakfastPackage {
  return {
    id: data.id as string,
    name: data.name as string,
    type: data.type as BreakfastPackage['type'],
    description: data.description as string,
    pricePerPerson: data.price_per_person as number,
    minimumHeadCount: data.minimum_head_count as number,
    includedItems: (data.included_items as string[]) || [],
    imageUrl: data.image_url as string | undefined,
  };
}

function mapSnackPackageFromDb(data: Record<string, unknown>): SnackPackage {
  return {
    id: data.id as string,
    name: data.name as string,
    type: data.type as SnackPackage['type'],
    description: data.description as string,
    pricePerPerson: data.price_per_person as number,
    minimumHeadCount: data.minimum_head_count as number,
    includedItems: (data.included_items as string[]) || [],
    imageUrl: data.image_url as string | undefined,
  };
}
