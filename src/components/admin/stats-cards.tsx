'use client';

import { Card } from '@/components/ui/card';
import type { AdminStats } from '@/contracts/types';

interface StatsCardsProps {
  stats: AdminStats | null;
  isLoading?: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const cards = [
    {
      label: 'Total Orders',
      value: stats?.totalOrders ?? 0,
      format: 'number',
      icon: (
        <svg className="h-6 w-6 text-soo-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      label: 'Total Revenue',
      value: stats?.totalRevenue ?? 0,
      format: 'currency',
      icon: (
        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Pending Orders',
      value: stats?.pendingOrders ?? 0,
      format: 'number',
      icon: (
        <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Orders Today',
      value: stats?.ordersToday ?? 0,
      format: 'number',
      icon: (
        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  const formatValue = (value: number, format: string) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);
    }
    return value.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-32" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
              <p className="text-2xl font-bold text-soo-dark">
                {formatValue(card.value, card.format)}
              </p>
            </div>
            <div className="rounded-full bg-soo-bg-light p-3">
              {card.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

interface TopItemsCardProps {
  items: AdminStats['topSellingItems'];
  isLoading?: boolean;
}

export function TopItemsCard({ items, isLoading }: TopItemsCardProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top Selling Items</h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Top Selling Items</h3>
      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">No sales data yet</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li key={item.itemId} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-soo-bg-light text-xs font-medium">
                  {index + 1}
                </span>
                <span className="text-sm font-medium">{item.itemName}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {item.totalQuantity} sold
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
