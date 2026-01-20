import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ERROR_CODES, ERROR_MESSAGES } from '@/contracts/constants';

async function checkAdminAuth(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { authorized: false, userId: null };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  return {
    authorized: profile?.is_admin === true,
    userId: user.id,
  };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { authorized } = await checkAdminAuth(supabase);
    if (!authorized) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.AUTH_UNAUTHORIZED,
            message: 'Admin access required',
          },
        },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build query
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

    if (status) {
      query = query.eq('status', status);
    }
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    const offset = (page - 1) * pageSize;
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    const { data: orders, error, count } = await query;

    if (error) throw error;

    const mappedOrders = (orders || []).map(order => ({
      id: order.id,
      userId: order.user_id,
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
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      customerName: `${order.profiles?.first_name || ''} ${order.profiles?.last_name || ''}`.trim() || 'Unknown',
      customerEmail: order.event_details?.contactEmail || '',
      customerPhone: order.profiles?.phone,
    }));

    return NextResponse.json({
      success: true,
      data: {
        orders: mappedOrders,
        total: count || 0,
        page,
        pageSize,
      },
    });
  } catch (error) {
    console.error('Get admin orders error:', error);
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

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { authorized } = await checkAdminAuth(supabase);
    if (!authorized) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.AUTH_UNAUTHORIZED,
            message: 'Admin access required',
          },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Order ID and status are required',
          },
        },
        { status: 400 }
      );
    }

    const validStatuses = [
      'draft',
      'pending_payment',
      'confirmed',
      'preparing',
      'ready_for_delivery',
      'out_for_delivery',
      'delivered',
      'cancelled',
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.ORDER_INVALID_STATUS,
            message: 'Invalid order status',
          },
        },
        { status: 400 }
      );
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
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
      data: order,
    });
  } catch (error) {
    console.error('Update order status error:', error);
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
