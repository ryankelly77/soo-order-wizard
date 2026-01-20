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
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build orders query
    let ordersQuery = supabase
      .from('orders')
      .select('id, total, status, created_at');

    if (dateFrom) {
      ordersQuery = ordersQuery.gte('created_at', dateFrom);
    }
    if (dateTo) {
      ordersQuery = ordersQuery.lte('created_at', dateTo);
    }

    const { data: orders, error: ordersError } = await ordersQuery;

    if (ordersError) throw ordersError;

    // Calculate stats
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
      .limit(500);

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
        totalRevenue: 0,
      }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalOrders,
          totalRevenue,
          pendingOrders,
          ordersToday,
          averageOrderValue,
          topSellingItems,
        },
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
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
