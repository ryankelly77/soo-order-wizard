'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useOrders } from '@/features/orders';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/shared/empty-state';
import { PageLoader } from '@/components/shared/loading-spinner';
import { formatCurrency, formatShortDate } from '@/lib/utils/format';
import { ORDER_STATUS_LABELS } from '@/contracts/constants';
import type { OrderStatus } from '@/contracts/types';

const STATUS_FILTERS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Preparing', value: 'preparing' },
  { label: 'Out for Delivery', value: 'out_for_delivery' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function OrdersPage() {
  const { orders, isLoading } = useOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.eventDetails.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            View and manage your catering orders
          </p>
        </div>
        <Link href="/new-order">
          <Button>New Order</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {STATUS_FILTERS.map((filter) => (
                <Button
                  key={filter.value}
                  variant={statusFilter === filter.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          title={orders.length === 0 ? 'No orders yet' : 'No matching orders'}
          description={
            orders.length === 0
              ? 'Create your first catering order to get started.'
              : 'Try adjusting your search or filter criteria.'
          }
          action={
            orders.length === 0
              ? {
                  label: 'Create Order',
                  onClick: () => (window.location.href = '/new-order'),
                }
              : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">
                          {order.eventDetails.eventName}
                        </h3>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatShortDate(order.eventDetails.eventDate)} &middot;{' '}
                        {order.eventDetails.headCount} people
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        {formatCurrency(order.total)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.lunchSelections?.length || 0} /{' '}
                        {order.eventDetails.headCount} selections
                      </p>
                    </div>
                  </div>

                  {/* Progress bar for lunch selections */}
                  {order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Lunch selections</span>
                        <span>
                          {Math.round(
                            ((order.lunchSelections?.length || 0) /
                              order.eventDetails.headCount) *
                              100
                          )}
                          %
                        </span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width: `${
                              ((order.lunchSelections?.length || 0) /
                                order.eventDetails.headCount) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const colorMap: Record<OrderStatus, string> = {
    draft: 'bg-gray-100 text-gray-700',
    pending_payment: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    preparing: 'bg-indigo-100 text-indigo-700',
    ready_for_delivery: 'bg-purple-100 text-purple-700',
    out_for_delivery: 'bg-orange-100 text-orange-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${colorMap[status]}`}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
