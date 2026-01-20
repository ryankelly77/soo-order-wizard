'use client';

import { useEffect, useState } from 'react';
import { StatsCards, TopItemsCard } from '@/components/admin';
import type { AdminStats } from '@/contracts/types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error?.message || 'Failed to fetch stats');
        }

        setStats(data.data.stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-soo-dark">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your catering business</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <StatsCards stats={stats} isLoading={isLoading} />

      <div className="grid gap-6 md:grid-cols-2">
        <TopItemsCard items={stats?.topSellingItems || []} isLoading={isLoading} />

        {/* Quick Actions */}
        <div className="rounded-lg border bg-white p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a
              href="/admin/menu/new"
              className="flex items-center gap-3 rounded-lg bg-soo-bg-light p-3 hover:bg-soo-gray/50 transition-colors"
            >
              <div className="rounded-full bg-soo-red p-2">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-soo-dark">Add Menu Item</p>
                <p className="text-sm text-muted-foreground">Create a new menu item</p>
              </div>
            </a>

            <a
              href="/admin/orders?status=pending_payment"
              className="flex items-center gap-3 rounded-lg bg-soo-bg-light p-3 hover:bg-soo-gray/50 transition-colors"
            >
              <div className="rounded-full bg-amber-500 p-2">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-soo-dark">Pending Orders</p>
                <p className="text-sm text-muted-foreground">View orders awaiting action</p>
              </div>
            </a>

            <a
              href="/admin/menu"
              className="flex items-center gap-3 rounded-lg bg-soo-bg-light p-3 hover:bg-soo-gray/50 transition-colors"
            >
              <div className="rounded-full bg-blue-500 p-2">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-soo-dark">Manage Menu</p>
                <p className="text-sm text-muted-foreground">Edit menu items and packages</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
