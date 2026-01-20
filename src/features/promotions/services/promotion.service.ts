import { createClient } from '@/lib/supabase/client';
import type { Promotion, PromotionValidation } from '@/contracts/types';

export async function validatePromotion(
  code: string,
  orderSubtotal: number,
  userId?: string
): Promise<PromotionValidation> {
  const supabase = createClient();

  // Find the promotion
  const { data: promotion, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('status', 'active')
    .single();

  if (error || !promotion) {
    return {
      isValid: false,
      errorMessage: 'Invalid promotion code',
    };
  }

  const now = new Date();
  const validFrom = new Date(promotion.valid_from);
  const validUntil = new Date(promotion.valid_until);

  // Check date validity
  if (now < validFrom || now > validUntil) {
    return {
      isValid: false,
      errorMessage: 'This promotion has expired',
    };
  }

  // Check usage limit
  if (promotion.usage_limit && promotion.usage_count >= promotion.usage_limit) {
    return {
      isValid: false,
      errorMessage: 'This promotion has reached its usage limit',
    };
  }

  // Check minimum order amount
  if (promotion.minimum_order_amount && orderSubtotal < promotion.minimum_order_amount) {
    return {
      isValid: false,
      errorMessage: `Minimum order of $${promotion.minimum_order_amount} required for this promotion`,
    };
  }

  // Check per-user limit
  if (userId && promotion.per_user_limit) {
    const { count } = await supabase
      .from('promotion_usages')
      .select('*', { count: 'exact', head: true })
      .eq('promotion_id', promotion.id)
      .eq('user_id', userId);

    if (count && count >= promotion.per_user_limit) {
      return {
        isValid: false,
        errorMessage: 'You have already used this promotion',
      };
    }
  }

  // Check first-time customer
  if (promotion.first_time_customer_only && userId) {
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .neq('status', 'cancelled');

    if (count && count > 0) {
      return {
        isValid: false,
        errorMessage: 'This promotion is for first-time customers only',
      };
    }
  }

  // Calculate discount
  const discountAmount = calculateDiscount(mapPromotionFromDb(promotion), orderSubtotal);

  return {
    isValid: true,
    promotion: mapPromotionFromDb(promotion),
    discountAmount,
  };
}

export async function recordPromotionUsage(
  promotionId: string,
  userId: string,
  orderId: string,
  discountAmount: number
): Promise<void> {
  const supabase = createClient();

  await Promise.all([
    // Record usage
    supabase.from('promotion_usages').insert({
      promotion_id: promotionId,
      user_id: userId,
      order_id: orderId,
      discount_amount: discountAmount,
      used_at: new Date().toISOString(),
    }),
    // Increment usage count
    supabase.rpc('increment_promotion_usage', { promotion_id: promotionId }),
  ]);
}

export async function getActivePromotions(): Promise<Promotion[]> {
  const supabase = createClient();

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('status', 'active')
    .lte('valid_from', now)
    .gte('valid_until', now);

  if (error) throw new Error(error.message);

  return data.map(mapPromotionFromDb);
}

function calculateDiscount(promotion: Promotion, subtotal: number): number {
  let discount = 0;

  switch (promotion.type) {
    case 'percentage':
      discount = subtotal * (promotion.value / 100);
      break;
    case 'fixed_amount':
      discount = promotion.value;
      break;
    case 'free_delivery':
      discount = 25; // Delivery fee
      break;
    default:
      discount = 0;
  }

  // Apply maximum discount cap
  if (promotion.maximumDiscount) {
    discount = Math.min(discount, promotion.maximumDiscount);
  }

  return Math.round(discount * 100) / 100;
}

function mapPromotionFromDb(data: Record<string, unknown>): Promotion {
  return {
    id: data.id as string,
    code: data.code as string,
    name: data.name as string,
    description: data.description as string,
    type: data.type as Promotion['type'],
    value: data.value as number,
    minimumOrderAmount: data.minimum_order_amount as number | undefined,
    maximumDiscount: data.maximum_discount as number | undefined,
    usageLimit: data.usage_limit as number | undefined,
    usageCount: data.usage_count as number,
    perUserLimit: data.per_user_limit as number | undefined,
    validFrom: new Date(data.valid_from as string),
    validUntil: new Date(data.valid_until as string),
    status: data.status as Promotion['status'],
    applicableCategories: data.applicable_categories as string[] | undefined,
    excludedItems: data.excluded_items as string[] | undefined,
    firstTimeCustomerOnly: data.first_time_customer_only as boolean,
    createdAt: new Date(data.created_at as string),
    updatedAt: new Date(data.updated_at as string),
  };
}
