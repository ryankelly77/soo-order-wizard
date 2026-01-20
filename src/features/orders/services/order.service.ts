import { createClient } from '@/lib/supabase/client';
import type { Order } from '@/contracts/types';
import type { CreateOrderInput } from '@/contracts/schemas';
import { TAX_RATE, DELIVERY_FEE } from '@/contracts/constants';

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in to create an order');

  // Calculate totals
  const subtotal = calculateSubtotal(input);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax + DELIVERY_FEE;

  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      status: 'draft',
      event_details: input.eventDetails,
      breakfast: input.breakfast,
      snacks: input.snacks,
      delivery: input.delivery,
      promotion_code: input.promotionCode,
      subtotal,
      tax,
      delivery_fee: DELIVERY_FEE,
      total,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return mapOrderFromDb(data);
}

export async function getOrder(orderId: string): Promise<Order | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('orders')
    .select('*, lunch_selections(*)')
    .eq('id', orderId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }

  return mapOrderFromDb(data);
}

export async function getOrders(): Promise<Order[]> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in to view orders');

  const { data, error } = await supabase
    .from('orders')
    .select('*, lunch_selections(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return data.map(mapOrderFromDb);
}

export async function updateOrder(
  orderId: string,
  updates: Partial<CreateOrderInput>
): Promise<Order> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('orders')
    .update({
      ...(updates.eventDetails && { event_details: updates.eventDetails }),
      ...(updates.breakfast && { breakfast: updates.breakfast }),
      ...(updates.snacks && { snacks: updates.snacks }),
      ...(updates.delivery && { delivery: updates.delivery }),
      ...(updates.promotionCode !== undefined && { promotion_code: updates.promotionCode }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return mapOrderFromDb(data);
}

export async function cancelOrder(orderId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('orders')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', orderId);

  if (error) throw new Error(error.message);
}

function calculateSubtotal(input: CreateOrderInput): number {
  let subtotal = 0;

  // Add breakfast cost
  if (input.breakfast) {
    const breakfastPrices = { continental: 12.99, hot: 18.99, premium: 24.99 };
    subtotal += breakfastPrices[input.breakfast.packageType] * input.breakfast.headCount;
  }

  // Add snacks cost
  if (input.snacks) {
    const snackPrices = { basic: 6.99, premium: 12.99, custom: 15.99 };
    subtotal += snackPrices[input.snacks.packageType] * input.eventDetails.headCount;
  }

  return subtotal;
}

function mapOrderFromDb(data: Record<string, unknown>): Order {
  return {
    id: data.id as string,
    userId: data.user_id as string | null,
    guestEmail: (data.guest_email as string) || null,
    status: data.status as Order['status'],
    eventDetails: data.event_details as Order['eventDetails'],
    breakfast: data.breakfast as Order['breakfast'],
    lunchSelections: (data.lunch_selections as Record<string, unknown>[])?.map(mapLunchSelectionFromDb) || [],
    snacks: data.snacks as Order['snacks'],
    delivery: data.delivery as Order['delivery'],
    payment: data.payment as Order['payment'] || { method: 'card' },
    subtotal: data.subtotal as number,
    tax: data.tax as number,
    deliveryFee: data.delivery_fee as number,
    total: data.total as number,
    promotionCode: data.promotion_code as string | undefined,
    discountAmount: data.discount_amount as number | undefined,
    shareToken: data.share_token as string | undefined,
    createdAt: new Date(data.created_at as string),
    updatedAt: new Date(data.updated_at as string),
  };
}

function mapLunchSelectionFromDb(data: Record<string, unknown>) {
  return {
    id: data.id as string,
    attendeeId: data.attendee_id as string,
    attendeeName: data.attendee_name as string,
    attendeeEmail: data.attendee_email as string,
    menuItemId: data.menu_item_id as string,
    menuItemName: data.menu_item_name as string,
    specialInstructions: data.special_instructions as string | undefined,
    dietaryRestrictions: data.dietary_restrictions as string[] | undefined,
    selectedAt: new Date(data.selected_at as string),
  };
}
