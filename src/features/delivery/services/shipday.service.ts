import { createShipdayClient, type ShipdayOrderPayload } from '@/lib/shipday/client';
import { createClient } from '@/lib/supabase/client';
import type { Order, DeliveryTracking, DeliveryStatus } from '@/contracts/types';

export async function createDeliveryOrder(order: Order): Promise<string> {
  const shipday = createShipdayClient();

  const payload: ShipdayOrderPayload = {
    orderNumber: order.id,
    customerName: order.eventDetails.contactName,
    customerAddress: formatAddress(order.delivery),
    customerEmail: order.eventDetails.contactEmail,
    customerPhoneNumber: order.eventDetails.contactPhone,
    restaurantName: 'SOO Catering',
    deliveryInstruction: order.delivery.deliveryInstructions,
    totalOrderCost: order.total,
    expectedDeliveryDate: order.eventDetails.eventDate.toISOString().split('T')[0],
    expectedDeliveryTime: order.delivery.preferredDeliveryTime,
    orderItems: getOrderItems(order),
  };

  const response = await shipday.createOrder(payload);
  const shipdayOrderId = (response as { orderId: string }).orderId;

  // Store Shipday order ID
  const supabase = createClient();
  await supabase
    .from('orders')
    .update({ shipday_order_id: shipdayOrderId })
    .eq('id', order.id);

  return shipdayOrderId;
}

export async function getDeliveryStatus(orderId: string): Promise<DeliveryTracking | null> {
  const supabase = createClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select('shipday_order_id, delivery_tracking')
    .eq('id', orderId)
    .single();

  if (error || !order?.shipday_order_id) return null;

  // Return cached tracking if recent
  if (order.delivery_tracking) {
    const tracking = order.delivery_tracking as DeliveryTracking;
    return tracking;
  }

  // Fetch fresh status from Shipday
  const shipday = createShipdayClient();
  const status = await shipday.getOrderStatus(order.shipday_order_id);

  const tracking = mapShipdayStatus(orderId, order.shipday_order_id, status);

  // Cache the tracking data
  await supabase
    .from('orders')
    .update({ delivery_tracking: tracking })
    .eq('id', orderId);

  return tracking;
}

export async function cancelDelivery(orderId: string): Promise<void> {
  const supabase = createClient();

  const { data: order } = await supabase
    .from('orders')
    .select('shipday_order_id')
    .eq('id', orderId)
    .single();

  if (order?.shipday_order_id) {
    const shipday = createShipdayClient();
    await shipday.cancelOrder(order.shipday_order_id);
  }
}

function formatAddress(delivery: Order['delivery']): string {
  const parts = [
    delivery.address,
    delivery.addressLine2,
    delivery.city,
    delivery.state,
    delivery.zipCode,
  ].filter(Boolean);
  return parts.join(', ');
}

function getOrderItems(order: Order) {
  const items: { name: string; quantity: number; unitPrice: number }[] = [];

  if (order.breakfast) {
    items.push({
      name: `${order.breakfast.packageType} Breakfast Package`,
      quantity: order.breakfast.headCount,
      unitPrice: order.breakfast.packageType === 'continental' ? 12.99 :
                 order.breakfast.packageType === 'hot' ? 18.99 : 24.99,
    });
  }

  order.lunchSelections.forEach((selection) => {
    items.push({
      name: selection.menuItemName,
      quantity: 1,
      unitPrice: 14.99,
    });
  });

  if (order.snacks) {
    items.push({
      name: `${order.snacks.packageType} Snack Package`,
      quantity: order.eventDetails.headCount,
      unitPrice: order.snacks.packageType === 'basic' ? 6.99 :
                 order.snacks.packageType === 'premium' ? 12.99 : 15.99,
    });
  }

  return items;
}

function mapShipdayStatus(
  orderId: string,
  shipdayOrderId: string,
  status: unknown
): DeliveryTracking {
  const statusData = status as {
    status: string;
    driver?: {
      name: string;
      phone: string;
      latitude?: number;
      longitude?: number;
    };
    estimatedDeliveryTime?: string;
  };

  const statusMap: Record<string, DeliveryStatus> = {
    'PENDING': 'pending',
    'ASSIGNED': 'assigned',
    'PICKED_UP': 'picked_up',
    'IN_TRANSIT': 'in_transit',
    'ARRIVING': 'arriving',
    'DELIVERED': 'delivered',
    'FAILED': 'failed',
  };

  return {
    orderId,
    shipdayOrderId,
    status: statusMap[statusData.status] || 'pending',
    driver: statusData.driver ? {
      id: '',
      name: statusData.driver.name,
      phone: statusData.driver.phone,
    } : undefined,
    currentLocation: statusData.driver?.latitude ? {
      latitude: statusData.driver.latitude,
      longitude: statusData.driver.longitude!,
      updatedAt: new Date(),
    } : undefined,
    estimatedDeliveryTime: statusData.estimatedDeliveryTime
      ? new Date(statusData.estimatedDeliveryTime)
      : undefined,
    statusHistory: [],
  };
}
