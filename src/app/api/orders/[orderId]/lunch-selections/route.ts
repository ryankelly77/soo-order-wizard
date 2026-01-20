import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ERROR_CODES, ERROR_MESSAGES } from '@/contracts/constants';

// Get lunch selections for an order
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const supabase = await createClient();
    const { orderId } = params;
    const token = request.nextUrl.searchParams.get('token');

    // Allow public access with valid token
    if (token) {
      const { data: order } = await supabase
        .from('orders')
        .select('share_token, share_token_expires_at')
        .eq('id', orderId)
        .single();

      if (
        !order ||
        order.share_token !== token ||
        new Date(order.share_token_expires_at) < new Date()
      ) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: ERROR_CODES.AUTH_UNAUTHORIZED,
              message: 'Invalid or expired share token',
            },
          },
          { status: 401 }
        );
      }
    } else {
      // Require authentication for non-token access
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

      // Verify order belongs to user
      const { data: order } = await supabase
        .from('orders')
        .select('user_id')
        .eq('id', orderId)
        .single();

      if (!order || order.user_id !== user.id) {
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
    }

    const { data: selections, error } = await supabase
      .from('lunch_selections')
      .select('*')
      .eq('order_id', orderId)
      .order('selected_at', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: selections.map(mapSelectionFromDb),
    });
  } catch (error) {
    console.error('Get lunch selections error:', error);
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

// Add a lunch selection (public with token)
export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const token = request.nextUrl.searchParams.get('token');

    // Use admin client for public submissions
    const supabase = token ? createAdminClient() : await createClient();

    // Validate share token for public access
    if (token) {
      const { data: order } = await supabase
        .from('orders')
        .select('share_token, share_token_expires_at, event_details, status')
        .eq('id', orderId)
        .single();

      if (
        !order ||
        order.share_token !== token ||
        new Date(order.share_token_expires_at) < new Date()
      ) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: ERROR_CODES.AUTH_UNAUTHORIZED,
              message: 'Invalid or expired share link',
            },
          },
          { status: 401 }
        );
      }

      // Check if selections are still allowed
      const allowedStatuses = ['draft', 'pending_payment', 'confirmed', 'preparing'];
      if (!allowedStatuses.includes(order.status)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: ERROR_CODES.ORDER_INVALID_STATUS,
              message: 'Lunch selections are no longer being accepted for this order',
            },
          },
          { status: 400 }
        );
      }
    } else {
      // Require auth for non-public access
      const regularSupabase = await createClient();
      const { data: { user }, error: authError } = await regularSupabase.auth.getUser();
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
    }

    const body = await request.json();

    // Validate input
    if (!body.attendeeName || !body.attendeeEmail || !body.menuItemId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Name, email, and menu selection are required',
          },
        },
        { status: 400 }
      );
    }

    // Check if this email already submitted
    const { data: existing } = await supabase
      .from('lunch_selections')
      .select('id')
      .eq('order_id', orderId)
      .eq('attendee_email', body.attendeeEmail.toLowerCase())
      .single();

    if (existing) {
      // Update existing selection
      const { data: updated, error: updateError } = await supabase
        .from('lunch_selections')
        .update({
          attendee_name: body.attendeeName,
          menu_item_id: body.menuItemId,
          menu_item_name: body.menuItemName,
          special_instructions: body.specialInstructions,
          dietary_restrictions: body.dietaryRestrictions,
          selected_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      return NextResponse.json({
        success: true,
        data: mapSelectionFromDb(updated),
        updated: true,
      });
    }

    // Create new selection
    const { data: selection, error: insertError } = await supabase
      .from('lunch_selections')
      .insert({
        order_id: orderId,
        attendee_name: body.attendeeName,
        attendee_email: body.attendeeEmail.toLowerCase(),
        menu_item_id: body.menuItemId,
        menu_item_name: body.menuItemName,
        special_instructions: body.specialInstructions,
        dietary_restrictions: body.dietaryRestrictions,
        selected_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      data: mapSelectionFromDb(selection),
    });
  } catch (error) {
    console.error('Add lunch selection error:', error);
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

// Delete a lunch selection
export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const supabase = await createClient();
    const { orderId } = params;
    const selectionId = request.nextUrl.searchParams.get('selectionId');

    if (!selectionId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Selection ID is required',
          },
        },
        { status: 400 }
      );
    }

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

    // Verify order belongs to user
    const { data: order } = await supabase
      .from('orders')
      .select('user_id')
      .eq('id', orderId)
      .single();

    if (!order || order.user_id !== user.id) {
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

    const { error: deleteError } = await supabase
      .from('lunch_selections')
      .delete()
      .eq('id', selectionId)
      .eq('order_id', orderId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete lunch selection error:', error);
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

function mapSelectionFromDb(data: Record<string, unknown>) {
  return {
    id: data.id,
    attendeeId: data.attendee_id,
    attendeeName: data.attendee_name,
    attendeeEmail: data.attendee_email,
    menuItemId: data.menu_item_id,
    menuItemName: data.menu_item_name,
    specialInstructions: data.special_instructions,
    dietaryRestrictions: data.dietary_restrictions,
    selectedAt: data.selected_at,
  };
}
