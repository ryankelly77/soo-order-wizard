'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { AdminOrder, OrderStatus } from '@/contracts/types';

interface OrdersTableProps {
  orders: AdminOrder[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onStatusChange: (orderId: string, status: OrderStatus) => Promise<void>;
  isLoading?: boolean;
}

const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-700' },
  pending_payment: { bg: 'bg-amber-100', text: 'text-amber-700' },
  confirmed: { bg: 'bg-blue-100', text: 'text-blue-700' },
  preparing: { bg: 'bg-purple-100', text: 'text-purple-700' },
  ready_for_delivery: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  out_for_delivery: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  delivered: { bg: 'bg-green-100', text: 'text-green-700' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700' },
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Draft',
  pending_payment: 'Pending Payment',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready_for_delivery: 'Ready for Delivery',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_OPTIONS: OrderStatus[] = [
  'draft',
  'pending_payment',
  'confirmed',
  'preparing',
  'ready_for_delivery',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

export function OrdersTable({
  orders,
  total,
  page,
  pageSize,
  onPageChange,
  onStatusChange,
  isLoading,
}: OrdersTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const totalPages = Math.ceil(total / pageSize);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await onStatusChange(orderId, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded" />
          ))}
        </div>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="p-12 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No orders found</h3>
        <p className="mt-2 text-sm text-gray-500">Orders will appear here once customers start placing them.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-soo-bg-light">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-soo-text">Order</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-soo-text">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-soo-text">Event Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-soo-text">Total</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-soo-text">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-soo-text">Created</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-soo-text">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-soo-bg-light/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-soo-dark">#{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.eventDetails?.eventName || 'Untitled Event'}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {order.eventDetails?.eventDate
                      ? formatDate(new Date(order.eventDetails.eventDate))
                      : 'Not set'}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      disabled={updatingId === order.id}
                      className={`rounded-full px-2 py-1 text-xs font-medium border-0 cursor-pointer ${
                        STATUS_COLORS[order.status].bg
                      } ${STATUS_COLORS[order.status].text}`}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} orders
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
