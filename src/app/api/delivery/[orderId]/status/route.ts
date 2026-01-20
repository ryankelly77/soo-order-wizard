import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createShipdayClient } from '@/lib/shipday/client';
import { ERROR_CODES, ERROR_MESSAGES } from '@/contracts/constants';
import type { DeliveryStatus, DeliveryTracking } from '@/contracts/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const supabase = await createClient();
    const { orderId } = params;

    // Get order with cached tracking data
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, shipday_order_id, delivery_tracking, status, delivery')
      .eq('id', orderId)
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

    // If no Shipday order ID, return basic status
    if (!order.shipday_order_id) {
      const tracking: DeliveryTracking = {
        orderId: order.id,
        status: mapOrderStatusToDeliveryStatus(order.status),
        statusHistory: [],
      };

      return NextResponse.json({
        success: true,
        data: tracking,
      });
    }

    // Check if we have recent cached data (within 30 seconds)
    if (order.delivery_tracking) {
      const tracking = order.delivery_tracking as DeliveryTracking;
      const lastUpdate = tracking.currentLocation?.updatedAt;

      if (lastUpdate) {
        const timeSinceUpdate = Date.now() - new Date(lastUpdate).getTime();
        if (timeSinceUpdate < 30000) {
          return NextResponse.json({
            success: true,
            data: tracking,
          });
        }
      }
    }

    // Fetch fresh status from Shipday
    try {
      const shipday = createShipdayClient();
      const shipdayStatus = await shipday.getOrderStatus(order.shipday_order_id);

      const tracking = mapShipdayResponse(order.id, order.shipday_order_id, shipdayStatus);

      // Cache the tracking data
      await supabase
        .from('orders')
        .update({
          delivery_tracking: tracking,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      return NextResponse.json({
        success: true,
        data: tracking,
      });
    } catch (shipdayError) {
      console.error('Shipday API error:', shipdayError);

      // Return cached data if available
      if (order.delivery_tracking) {
        return NextResponse.json({
          success: true,
          data: order.delivery_tracking,
          cached: true,
        });
      }

      // Return basic status
      return NextResponse.json({
        success: true,
        data: {
          orderId: order.id,
          status: mapOrderStatusToDeliveryStatus(order.status),
          statusHistory: [],
        },
      });
    }
  } catch (error) {
    console.error('Get delivery status error:', error);
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

function mapOrderStatusToDeliveryStatus(orderStatus: string): DeliveryStatus {
  const statusMap: Record<string, DeliveryStatus> = {
    draft: 'pending',
    pending_payment: 'pending',
    confirmed: 'pending',
    preparing: 'pending',
    ready_for_delivery: 'assigned',
    out_for_delivery: 'in_transit',
    delivered: 'delivered',
    cancelled: 'failed',
  };

  return statusMap[orderStatus] || 'pending';
}

function mapShipdayResponse(
  orderId: string,
  shipdayOrderId: string,
  response: unknown
): DeliveryTracking {
  const data = response as {
    orderStatus?: string;
    driver?: {
      id?: string;
      name?: string;
      phone?: string;
      photoUrl?: string;
      vehicleDetails?: string;
      latitude?: number;
      longitude?: number;
    };
    estimatedDeliveryTime?: string;
    actualDeliveryTime?: string;
    trackingLink?: string;
  };

  const statusMap: Record<string, DeliveryStatus> = {
    'PENDING': 'pending',
    'ASSIGNED': 'assigned',
    'STARTED': 'picked_up',
    'PICKED_UP': 'picked_up',
    'ON_THE_WAY': 'in_transit',
    'ARRIVING': 'arriving',
    'ARRIVED': 'arriving',
    'DELIVERED': 'delivered',
    'CANCELLED': 'failed',
    'FAILED': 'failed',
  };

  return {
    orderId,
    shipdayOrderId,
    status: statusMap[data.orderStatus?.toUpperCase() || ''] || 'pending',
    driver: data.driver ? {
      id: data.driver.id || '',
      name: data.driver.name || 'Driver',
      phone: data.driver.phone || '',
      photoUrl: data.driver.photoUrl,
      vehicleInfo: data.driver.vehicleDetails,
    } : undefined,
    currentLocation: data.driver?.latitude && data.driver?.longitude ? {
      latitude: data.driver.latitude,
      longitude: data.driver.longitude,
      updatedAt: new Date(),
    } : undefined,
    estimatedDeliveryTime: data.estimatedDeliveryTime
      ? new Date(data.estimatedDeliveryTime)
      : undefined,
    actualDeliveryTime: data.actualDeliveryTime
      ? new Date(data.actualDeliveryTime)
      : undefined,
    trackingUrl: data.trackingLink,
    statusHistory: [],
  };
}
