import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { shipdayWebhookSchema } from '@/contracts/schemas';
import type { DeliveryStatus } from '@/contracts/types';

const SHIPDAY_WEBHOOK_SECRET = process.env.SHIPDAY_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const signature = headersList.get('x-shipday-signature');

    // Verify webhook signature if secret is configured
    if (SHIPDAY_WEBHOOK_SECRET && signature) {
      // Implement signature verification based on Shipday's documentation
      // This is a placeholder - actual implementation depends on Shipday's auth method
    }

    const body = await request.json();
    const result = shipdayWebhookSchema.safeParse(body);

    if (!result.success) {
      console.error('Invalid webhook payload:', result.error);
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { orderId, status, driverInfo } = result.data;

    const supabase = createAdminClient();

    // Find order by Shipday order ID
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('shipday_order_id', orderId)
      .single();

    if (fetchError || !order) {
      console.error('Order not found for Shipday ID:', orderId);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Map Shipday status to our status
    const statusMap: Record<string, DeliveryStatus> = {
      'PENDING': 'pending',
      'ASSIGNED': 'assigned',
      'PICKED_UP': 'picked_up',
      'ON_THE_WAY': 'in_transit',
      'ARRIVING': 'arriving',
      'DELIVERED': 'delivered',
      'CANCELLED': 'failed',
      'FAILED': 'failed',
    };

    const mappedStatus = statusMap[status.toUpperCase()] || 'pending';

    // Build delivery tracking object
    const deliveryTracking = {
      orderId: order.id,
      shipdayOrderId: orderId,
      status: mappedStatus,
      driver: driverInfo ? {
        id: '',
        name: driverInfo.name,
        phone: driverInfo.phone,
      } : undefined,
      currentLocation: driverInfo?.latitude && driverInfo?.longitude ? {
        latitude: driverInfo.latitude,
        longitude: driverInfo.longitude,
        updatedAt: new Date().toISOString(),
      } : undefined,
      statusHistory: [],
    };

    // Update order status based on delivery status
    let orderStatus = order.status;
    if (mappedStatus === 'picked_up') {
      orderStatus = 'out_for_delivery';
    } else if (mappedStatus === 'delivered') {
      orderStatus = 'delivered';
    }

    // Update order
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: orderStatus,
        delivery_tracking: deliveryTracking,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('Failed to update order:', updateError);
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    console.log(`Order ${order.id} updated: delivery status ${mappedStatus}`);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Shipday webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
