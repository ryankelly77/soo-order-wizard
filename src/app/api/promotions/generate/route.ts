import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createHighLevelClient } from '@/lib/highlevel/client';
import { ERROR_CODES, ERROR_MESSAGES } from '@/contracts/constants';
import type { Promotion } from '@/contracts/types';

// Generate a new promo code for a customer
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.AUTH_UNAUTHORIZED,
            message: ERROR_MESSAGES[ERROR_CODES.AUTH_UNAUTHORIZED],
          },
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, type = 'percentage', value = 10 } = body;

    // Validate promotion type and value
    if (!['percentage', 'fixed_amount', 'free_item', 'free_delivery'].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Invalid promotion type',
          },
        },
        { status: 400 }
      );
    }

    if (type === 'percentage' && (value < 1 || value > 100)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Percentage must be between 1 and 100',
          },
        },
        { status: 400 }
      );
    }

    // Get customer info for personalization
    const { data: customer } = await supabase
      .from('customers')
      .select('id, email, first_name, order_count')
      .eq('user_id', user.id)
      .single();

    // Generate unique promo code
    const promoCode = generatePromoCode(type, value);

    // Set validity period (7 days from now)
    const validFrom = new Date();
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 7);

    // Create promotion in database
    const { data: promotion, error: insertError } = await supabase
      .from('promotions')
      .insert({
        code: promoCode,
        name: `Thank You Discount - ${promoCode}`,
        type,
        value,
        description: getPromotionDescription(type, value),
        minimum_order_amount: type === 'fixed_amount' ? value * 2 : null,
        usage_limit: 1,
        usage_count: 0,
        valid_from: validFrom.toISOString(),
        valid_until: validUntil.toISOString(),
        status: 'active',
        first_time_customer_only: false,
        customer_id: customer?.id,
        source_order_id: orderId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Sync to HighLevel CRM if customer exists
    if (customer?.id) {
      try {
        const highlevel = createHighLevelClient();
        await highlevel.addPromoToContact(customer.id, {
          code: promoCode,
          value,
          expiresAt: validUntil.toISOString(),
        });
      } catch (crmError) {
        // Continue - CRM sync failure shouldn't fail the request
      }
    }

    const mappedPromotion: Promotion = {
      id: promotion.id,
      code: promotion.code,
      name: promotion.name,
      type: promotion.type,
      value: promotion.value,
      description: promotion.description,
      minimumOrderAmount: promotion.minimum_order_amount,
      usageLimit: promotion.usage_limit,
      usageCount: promotion.usage_count,
      validFrom: new Date(promotion.valid_from),
      validUntil: new Date(promotion.valid_until),
      status: promotion.status,
      firstTimeCustomerOnly: promotion.first_time_customer_only,
      createdAt: new Date(promotion.created_at),
      updatedAt: new Date(promotion.updated_at),
    };

    return NextResponse.json({
      success: true,
      data: mappedPromotion,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_ERROR,
          message: ERROR_MESSAGES[ERROR_CODES.INTERNAL_ERROR],
        },
      },
      { status: 500 }
    );
  }
}

// Validate a promo code
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const code = request.nextUrl.searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Promo code is required',
          },
        },
        { status: 400 }
      );
    }

    const { data: promotion, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('status', 'active')
      .single();

    if (error || !promotion) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.PROMOTION_INVALID,
            message: ERROR_MESSAGES[ERROR_CODES.PROMOTION_INVALID],
          },
        },
        { status: 404 }
      );
    }

    // Check expiration
    if (new Date(promotion.valid_until) < new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.PROMOTION_EXPIRED,
            message: ERROR_MESSAGES[ERROR_CODES.PROMOTION_EXPIRED],
          },
        },
        { status: 400 }
      );
    }

    // Check usage limit
    if (promotion.usage_limit && promotion.usage_count >= promotion.usage_limit) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.PROMOTION_USAGE_LIMIT,
            message: ERROR_MESSAGES[ERROR_CODES.PROMOTION_USAGE_LIMIT],
          },
        },
        { status: 400 }
      );
    }

    const mappedPromotion: Promotion = {
      id: promotion.id,
      code: promotion.code,
      name: promotion.name,
      type: promotion.type,
      value: promotion.value,
      description: promotion.description,
      minimumOrderAmount: promotion.minimum_order_amount,
      usageLimit: promotion.usage_limit,
      usageCount: promotion.usage_count,
      validFrom: new Date(promotion.valid_from),
      validUntil: new Date(promotion.valid_until),
      status: promotion.status,
      firstTimeCustomerOnly: promotion.first_time_customer_only,
      createdAt: new Date(promotion.created_at),
      updatedAt: new Date(promotion.updated_at),
    };

    return NextResponse.json({
      success: true,
      data: mappedPromotion,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_ERROR,
          message: ERROR_MESSAGES[ERROR_CODES.INTERNAL_ERROR],
        },
      },
      { status: 500 }
    );
  }
}

function generatePromoCode(type: string, value: number): string {
  const prefix = type === 'percentage' ? 'SAVE' : type === 'fixed_amount' ? 'OFF' : 'FREE';
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${value}${suffix}`;
}

function getPromotionDescription(type: string, value: number): string {
  switch (type) {
    case 'percentage':
      return `${value}% off your next order`;
    case 'fixed_amount':
      return `$${value} off your next order`;
    case 'free_item':
      return 'Free item with your next order';
    case 'free_delivery':
      return 'Free delivery on your next order';
    default:
      return 'Special discount';
  }
}
