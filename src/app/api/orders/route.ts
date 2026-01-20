import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createOrderSchema } from '@/contracts/schemas';
import { TAX_RATE, DELIVERY_FEE } from '@/contracts/constants';
import { ERROR_CODES, ERROR_MESSAGES } from '@/contracts/constants';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
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

    // Parse and validate request body
    const body = await request.json();
    const result = createOrderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR],
            details: result.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const input = result.data;

    // Calculate totals
    let subtotal = 0;

    if (input.breakfast) {
      const prices = { continental: 12.99, hot: 18.99, premium: 24.99 };
      subtotal += prices[input.breakfast.packageType] * input.breakfast.headCount;
    }

    if (input.snacks) {
      const prices = { basic: 6.99, premium: 12.99, custom: 15.99 };
      subtotal += prices[input.snacks.packageType] * input.eventDetails.headCount;
    }

    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax + DELIVERY_FEE;

    // Create order
    const { data: order, error: createError } = await supabase
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

    if (createError) {
      throw createError;
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Create order error:', error);
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

export async function GET() {
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

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, lunch_selections(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Get orders error:', error);
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
