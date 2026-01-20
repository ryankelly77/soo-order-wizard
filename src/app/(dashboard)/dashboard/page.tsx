'use client';

import Link from 'next/link';
import { useAuth } from '@/features/auth';
import { useOrders } from '@/features/orders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import { PageLoader } from '@/components/shared/loading-spinner';
import { formatCurrency, formatShortDate } from '@/lib/utils/format';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/contracts/constants';

export default function DashboardPage() {
  const { user } = useAuth();
  const { orders, isLoading } = useOrders();

  if (isLoading) {
    return <PageLoader />;
  }

  const recentOrders = orders.slice(0, 5);
  const activeOrders = orders.filter((o) =>
    ['confirmed', 'preparing', 'ready_for_delivery', 'out_for_delivery'].includes(o.status)
  );

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your catering orders and preferences
          </p>
        </div>
        <Link href="/new-order">
          <Button size="lg">New Order</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Orders</CardDescription>
            <CardTitle className="text-3xl">{orders.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Orders</CardDescription>
            <CardTitle className="text-3xl">{activeOrders.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Spent</CardDescription>
            <CardTitle className="text-3xl">
              {formatCurrency(
                orders
                  .filter((o) => o.status !== 'cancelled')
                  .reduce((sum, o) => sum + o.total, 0)
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Link href="/orders">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <EmptyState
              title="No orders yet"
              description="Create your first catering order to get started."
              action={{
                label: 'Create Order',
                onClick: () => (window.location.href = '/new-order'),
              }}
            />
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{order.eventDetails.eventName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatShortDate(order.eventDetails.eventDate)} &middot;{' '}
                      {order.eventDetails.headCount} people
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(order.total)}</p>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium bg-${ORDER_STATUS_COLORS[order.status]}-100 text-${ORDER_STATUS_COLORS[order.status]}-700`}
                    >
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
