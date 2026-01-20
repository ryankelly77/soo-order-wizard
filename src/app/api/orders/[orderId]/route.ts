import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ERROR_CODES, ERROR_MESSAGES } from '@/contracts/constants';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const supabase = await createClient();
    const { orderId } = params;

    // Check for share token (public access)
    const token = request.nextUrl.searchParams.get('token');

    if (token) {
      // Public access with share token
      const { data: order, error } = await supabase
        .from('orders')
        .select('*, lunch_selections(*)')
        .eq('id', orderId)
        .eq('share_token', token)
        .gt('share_token_expires_at', new Date().toISOString())
        .single();

      if (error || !order) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: ERROR_CODES.ORDER_NOT_FOUND,
              message: 'Invalid or expired share link',
            },
          },
          { status: 404 }
        );
      }

      // Return limited data for public access
      return NextResponse.json({
        success: true,
        data: {
          id: order.id,
          eventDetails: order.event_details,
          lunchSelections: order.lunch_selections,
        },
      });
    }

    // Authenticated access
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

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, lunch_selections(*)')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
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
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: mapOrderFromDb(order),
    });
  } catch (error) {
    console.error('Get order error:', error);
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const supabase = await createClient();
    const { orderId } = params;

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

    // Check if order exists and belongs to user
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingOrder) {
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

    // Check if order can be modified
    const editableStatuses = ['draft', 'pending_payment'];
    if (!editableStatuses.includes(existingOrder.status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.ORDER_CANNOT_MODIFY,
            message: ERROR_MESSAGES[ERROR_CODES.ORDER_CANNOT_MODIFY],
          },
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.eventDetails) updates.event_details = body.eventDetails;
    if (body.breakfast !== undefined) updates.breakfast = body.breakfast;
    if (body.snacks !== undefined) updates.snacks = body.snacks;
    if (body.delivery) updates.delivery = body.delivery;
    if (body.status) updates.status = body.status;

    const { data: order, error: updateError } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select('*, lunch_selections(*)')
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      data: mapOrderFromDb(order),
    });
  } catch (error) {
    console.error('Update order error:', error);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const supabase = await createClient();
    const { orderId } = params;

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

    // Check if order can be cancelled
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (!existingOrder) {
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

    const cancellableStatuses = ['draft', 'pending_payment', 'confirmed'];
    if (!cancellableStatuses.includes(existingOrder.status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.ORDER_CANNOT_MODIFY,
            message: 'This order cannot be cancelled',
          },
        },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cancel order error:', error);
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

function mapOrderFromDb(data: Record<string, unknown>) {
  return {
    id: data.id,
    userId: data.user_id,
    status: data.status,
    eventDetails: data.event_details,
    breakfast: data.breakfast,
    lunchSelections: (data.lunch_selections as Record<string, unknown>[])?.map((ls) => ({
      id: ls.id,
      attendeeId: ls.attendee_id,
      attendeeName: ls.attendee_name,
      attendeeEmail: ls.attendee_email,
      menuItemId: ls.menu_item_id,
      menuItemName: ls.menu_item_name,
      specialInstructions: ls.special_instructions,
      dietaryRestrictions: ls.dietary_restrictions,
      selectedAt: ls.selected_at,
    })) || [],
    snacks: data.snacks,
    delivery: data.delivery,
    payment: data.payment || { method: 'card' },
    subtotal: data.subtotal,
    tax: data.tax,
    deliveryFee: data.delivery_fee,
    total: data.total,
    promotionCode: data.promotion_code,
    discountAmount: data.discount_amount,
    shareToken: data.share_token,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
