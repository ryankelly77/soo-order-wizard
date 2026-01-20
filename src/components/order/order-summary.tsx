'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/format';
import type { Order } from '@/contracts/types';
import { calculateOrderTotal } from '@/features/orders';

interface OrderSummaryProps {
  order: Partial<Order>;
  showDetails?: boolean;
}

export function OrderSummary({ order, showDetails = true }: OrderSummaryProps) {
  const totals = calculateOrderTotal(order);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showDetails && (
          <>
            {order.breakfast && (
              <div className="flex justify-between text-sm">
                <span>
                  {order.breakfast.packageType.charAt(0).toUpperCase() +
                    order.breakfast.packageType.slice(1)}{' '}
                  Breakfast ({order.breakfast.headCount} people)
                </span>
                <span>
                  {formatCurrency(
                    order.breakfast.headCount *
                      (order.breakfast.packageType === 'continental'
                        ? 12.99
                        : order.breakfast.packageType === 'hot'
                        ? 18.99
                        : 24.99)
                  )}
                </span>
              </div>
            )}

            {order.lunchSelections && order.lunchSelections.length > 0 && (
              <div className="flex justify-between text-sm">
                <span>Lunch ({order.lunchSelections.length} selections)</span>
                <span>
                  {formatCurrency(order.lunchSelections.length * 14.99)}
                </span>
              </div>
            )}

            {order.snacks && (
              <div className="flex justify-between text-sm">
                <span>
                  {order.snacks.packageType.charAt(0).toUpperCase() +
                    order.snacks.packageType.slice(1)}{' '}
                  Snacks ({order.eventDetails?.headCount} people)
                </span>
                <span>
                  {formatCurrency(
                    (order.eventDetails?.headCount || 0) *
                      (order.snacks.packageType === 'basic'
                        ? 6.99
                        : order.snacks.packageType === 'premium'
                        ? 12.99
                        : 15.99)
                  )}
                </span>
              </div>
            )}

            <div className="border-t pt-4" />
          </>
        )}

        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{formatCurrency(totals.subtotal)}</span>
        </div>

        {totals.discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount</span>
            <span>-{formatCurrency(totals.discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span>Tax (8.25%)</span>
          <span>{formatCurrency(totals.tax)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Delivery Fee</span>
          <span>{formatCurrency(totals.deliveryFee)}</span>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatCurrency(totals.total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
