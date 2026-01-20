import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe, formatAmountForStripe } from '@/lib/stripe/client';
import { createPaymentIntentSchema } from '@/contracts/schemas';
import { ERROR_CODES, ERROR_MESSAGES } from '@/contracts/constants';

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
    const result = createPaymentIntentSchema.safeParse(body);

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

    const { orderId, amount } = result.data;

    // Verify order belongs to user and is in correct status
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, total, user_id')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.ORDER_NOT_FOUND,
            message: ERROR_MESSAGES[ERROR_CODES.ORDER_NOT_FOUND],
          },
        },
        { status: 404 }
      );
    }

    if (!['draft', 'pending_payment'].includes(order.status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.ORDER_INVALID_STATUS,
            message: 'This order has already been paid or cannot accept payment',
          },
        },
        { status: 400 }
      );
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(amount),
      currency: 'usd',
      metadata: {
        orderId,
        userId: user.id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update order with payment intent ID and status
    await supabase
      .from('orders')
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        status: 'pending_payment',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ERROR_CODES.PAYMENT_FAILED,
          message: ERROR_MESSAGES[ERROR_CODES.PAYMENT_FAILED],
        },
      },
      { status: 500 }
    );
  }
}
