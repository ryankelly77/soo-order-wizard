import { createClient } from '@/lib/supabase/client';
import type {
  AdminStats,
  AdminOrder,
  OrderFilters,
  OrdersResponse,
  MenuItemFormData,
  BreakfastPackageFormData,
  SnackPackageFormData,
} from '@/contracts/types';
import type { MenuItem, BreakfastPackage, SnackPackage } from '@/contracts/types';

// =============================================================================
// ADMIN AUTH
// =============================================================================

export async function checkIsAdmin(): Promise<boolean> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  return profile?.is_admin === true;
}

// =============================================================================
// ADMIN STATS
// =============================================================================

export async function getAdminStats(dateFrom?: Date, dateTo?: Date): Promise<AdminStats> {
  const supabase = createClient();

  let ordersQuery = supabase
    .from('orders')
    .select('id, total, status, created_at');

  if (dateFrom) {
    ordersQuery = ordersQuery.gte('created_at', dateFrom.toISOString());
  }
  if (dateTo) {
    ordersQuery = ordersQuery.lte('created_at', dateTo.toISOString());
  }

  const { data: orders, error } = await ordersQuery;

  if (error) throw new Error(error.message);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0;
  const pendingOrders = orders?.filter(o =>
    ['draft', 'pending_payment', 'confirmed', 'preparing'].includes(o.status)
  ).length || 0;
  const ordersToday = orders?.filter(o =>
    new Date(o.created_at) >= today
  ).length || 0;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Get top selling items from lunch_selections
  const { data: selections } = await supabase
    .from('lunch_selections')
    .select('menu_item_id, menu_item_name')
    .limit(100);

  const itemCounts: Record<string, { name: string; count: number }> = {};
  selections?.forEach(s => {
    if (!itemCounts[s.menu_item_id]) {
      itemCounts[s.menu_item_id] = { name: s.menu_item_name, count: 0 };
    }
    itemCounts[s.menu_item_id].count++;
  });

  const topSellingItems = Object.entries(itemCounts)
    .map(([id, { name, count }]) => ({
      itemId: id,
      itemName: name,
      totalQuantity: count,
      totalRevenue: 0, // Would need to join with menu_items for price
    }))
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 5);

  return {
    totalOrders,
    totalRevenue,
    pendingOrders,
    ordersToday,
    averageOrderValue,
    topSellingItems,
  };
}

// =============================================================================
// ADMIN ORDERS
// =============================================================================

export async function getAdminOrders(
  filters?: OrderFilters,
  page = 1,
  pageSize = 20
): Promise<OrdersResponse> {
  const supabase = createClient();

  let query = supabase
    .from('orders')
    .select(`
      *,
      profiles:user_id (
        first_name,
        last_name,
        phone
      )
    `, { count: 'exact' });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.dateFrom) {
    query = query.gte('created_at', filters.dateFrom.toISOString());
  }
  if (filters?.dateTo) {
    query = query.lte('created_at', filters.dateTo.toISOString());
  }
  if (filters?.customerId) {
    query = query.eq('user_id', filters.customerId);
  }

  const offset = (page - 1) * pageSize;
  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  const orders: AdminOrder[] = (data || []).map(order => ({
    id: order.id,
    userId: order.user_id,
    guestEmail: order.guest_email || null,
    status: order.status,
    eventDetails: order.event_details,
    breakfast: order.breakfast,
    lunchSelections: [],
    snacks: order.snacks,
    delivery: order.delivery,
    payment: order.payment || {},
    subtotal: Number(order.subtotal),
    tax: Number(order.tax),
    deliveryFee: Number(order.delivery_fee),
    total: Number(order.total),
    promotionCode: order.promotion_code,
    discountAmount: order.discount_amount ? Number(order.discount_amount) : undefined,
    shareToken: order.share_token,
    createdAt: new Date(order.created_at),
    updatedAt: new Date(order.updated_at),
    customerName: `${order.profiles?.first_name || ''} ${order.profiles?.last_name || ''}`.trim() || 'Unknown',
    customerEmail: order.event_details?.contactEmail || '',
    customerPhone: order.profiles?.phone,
  }));

  return {
    orders,
    total: count || 0,
    page,
    pageSize,
  };
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) throw new Error(error.message);
}

// =============================================================================
// MENU ITEMS
// =============================================================================

export async function getAllMenuItems(): Promise<MenuItem[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('category')
    .order('name');

  if (error) throw new Error(error.message);

  return (data || []).map(mapMenuItemFromDb);
}

export async function createMenuItem(input: MenuItemFormData): Promise<MenuItem> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('menu_items')
    .insert({
      name: input.name,
      description: input.description,
      category: input.category,
      price: input.price,
      image_url: input.imageUrl || null,
      dietary_tags: input.dietaryTags,
      allergens: input.allergens,
      serving_size: input.servingSize || null,
      is_available: input.isAvailable,
      is_popular: input.isPopular || false,
      calories: input.calories || null,
      preparation_time: input.preparationTime || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return mapMenuItemFromDb(data);
}

export async function updateMenuItem(itemId: string, input: Partial<MenuItemFormData>): Promise<MenuItem> {
  const supabase = createClient();

  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.category !== undefined) updateData.category = input.category;
  if (input.price !== undefined) updateData.price = input.price;
  if (input.imageUrl !== undefined) updateData.image_url = input.imageUrl || null;
  if (input.dietaryTags !== undefined) updateData.dietary_tags = input.dietaryTags;
  if (input.allergens !== undefined) updateData.allergens = input.allergens;
  if (input.servingSize !== undefined) updateData.serving_size = input.servingSize || null;
  if (input.isAvailable !== undefined) updateData.is_available = input.isAvailable;
  if (input.isPopular !== undefined) updateData.is_popular = input.isPopular;
  if (input.calories !== undefined) updateData.calories = input.calories || null;
  if (input.preparationTime !== undefined) updateData.preparation_time = input.preparationTime || null;

  const { data, error } = await supabase
    .from('menu_items')
    .update(updateData)
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return mapMenuItemFromDb(data);
}

export async function deleteMenuItem(itemId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', itemId);

  if (error) throw new Error(error.message);
}

// =============================================================================
// BREAKFAST PACKAGES
// =============================================================================

export async function getAllBreakfastPackages(): Promise<BreakfastPackage[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('breakfast_packages')
    .select('*')
    .order('price_per_person');

  if (error) throw new Error(error.message);

  return (data || []).map(mapBreakfastPackageFromDb);
}

export async function createBreakfastPackage(input: BreakfastPackageFormData): Promise<BreakfastPackage> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('breakfast_packages')
    .insert({
      name: input.name,
      type: input.type,
      description: input.description,
      price_per_person: input.pricePerPerson,
      minimum_head_count: input.minimumHeadCount,
      included_items: input.includedItems,
      image_url: input.imageUrl || null,
      is_available: input.isAvailable,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return mapBreakfastPackageFromDb(data);
}

export async function updateBreakfastPackage(
  packageId: string,
  input: Partial<BreakfastPackageFormData>
): Promise<BreakfastPackage> {
  const supabase = createClient();

  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.type !== undefined) updateData.type = input.type;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.pricePerPerson !== undefined) updateData.price_per_person = input.pricePerPerson;
  if (input.minimumHeadCount !== undefined) updateData.minimum_head_count = input.minimumHeadCount;
  if (input.includedItems !== undefined) updateData.included_items = input.includedItems;
  if (input.imageUrl !== undefined) updateData.image_url = input.imageUrl || null;
  if (input.isAvailable !== undefined) updateData.is_available = input.isAvailable;

  const { data, error } = await supabase
    .from('breakfast_packages')
    .update(updateData)
    .eq('id', packageId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return mapBreakfastPackageFromDb(data);
}

export async function deleteBreakfastPackage(packageId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('breakfast_packages')
    .delete()
    .eq('id', packageId);

  if (error) throw new Error(error.message);
}

// =============================================================================
// SNACK PACKAGES
// =============================================================================

export async function getAllSnackPackages(): Promise<SnackPackage[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('snack_packages')
    .select('*')
    .order('price_per_person');

  if (error) throw new Error(error.message);

  return (data || []).map(mapSnackPackageFromDb);
}

export async function createSnackPackage(input: SnackPackageFormData): Promise<SnackPackage> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('snack_packages')
    .insert({
      name: input.name,
      type: input.type,
      description: input.description,
      price_per_person: input.pricePerPerson,
      minimum_head_count: input.minimumHeadCount,
      included_items: input.includedItems,
      image_url: input.imageUrl || null,
      is_available: input.isAvailable,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return mapSnackPackageFromDb(data);
}

export async function updateSnackPackage(
  packageId: string,
  input: Partial<SnackPackageFormData>
): Promise<SnackPackage> {
  const supabase = createClient();

  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.type !== undefined) updateData.type = input.type;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.pricePerPerson !== undefined) updateData.price_per_person = input.pricePerPerson;
  if (input.minimumHeadCount !== undefined) updateData.minimum_head_count = input.minimumHeadCount;
  if (input.includedItems !== undefined) updateData.included_items = input.includedItems;
  if (input.imageUrl !== undefined) updateData.image_url = input.imageUrl || null;
  if (input.isAvailable !== undefined) updateData.is_available = input.isAvailable;

  const { data, error } = await supabase
    .from('snack_packages')
    .update(updateData)
    .eq('id', packageId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return mapSnackPackageFromDb(data);
}

export async function deleteSnackPackage(packageId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('snack_packages')
    .delete()
    .eq('id', packageId);

  if (error) throw new Error(error.message);
}

// =============================================================================
// MAPPERS
// =============================================================================

function mapMenuItemFromDb(data: Record<string, unknown>): MenuItem {
  return {
    id: data.id as string,
    name: data.name as string,
    description: data.description as string,
    category: data.category as MenuItem['category'],
    price: Number(data.price),
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
    pricePerPerson: Number(data.price_per_person),
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
    pricePerPerson: Number(data.price_per_person),
    minimumHeadCount: data.minimum_head_count as number,
    includedItems: (data.included_items as string[]) || [],
    imageUrl: data.image_url as string | undefined,
  };
}
