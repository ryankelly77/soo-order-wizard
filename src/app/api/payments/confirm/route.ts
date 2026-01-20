import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/client';
import { confirmPaymentSchema } from '@/contracts/schemas';
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
    const result = confirmPaymentSchema.safeParse(body);

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

    const { paymentIntentId } = result.data;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent.metadata.orderId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.PAYMENT_FAILED,
            message: 'Invalid payment intent',
          },
        },
        { status: 400 }
      );
    }

    // Verify order belongs to user
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id')
      .eq('id', paymentIntent.metadata.orderId)
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

    // Check payment status
    if (paymentIntent.status === 'succeeded') {
      // Update order status
      await supabase
        .from('orders')
        .update({
          status: 'confirmed',
          payment: {
            method: 'card',
            stripePaymentIntentId: paymentIntentId,
            paidAt: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      return NextResponse.json({
        success: true,
        status: 'succeeded',
      });
    } else if (paymentIntent.status === 'requires_payment_method') {
      return NextResponse.json({
        success: false,
        status: 'requires_payment_method',
        error: {
          code: ERROR_CODES.PAYMENT_FAILED,
          message: 'Payment method required. Please try again with a valid card.',
        },
      });
    } else if (paymentIntent.status === 'requires_action') {
      return NextResponse.json({
        success: false,
        status: 'requires_action',
        clientSecret: paymentIntent.client_secret,
      });
    } else {
      return NextResponse.json({
        success: false,
        status: paymentIntent.status,
        error: {
          code: ERROR_CODES.PAYMENT_FAILED,
          message: `Payment status: ${paymentIntent.status}`,
        },
      });
    }
  } catch (error) {
    console.error('Confirm payment error:', error);
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
