'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useOrder } from '@/features/orders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderSummary } from '@/components/order/order-summary';
import { AttendeeList } from '@/components/order/attendee-list';
import { PageLoader } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { formatDate, formatPhoneNumber } from '@/lib/utils/format';
import { ORDER_STATUS_LABELS, CANCELLABLE_ORDER_STATUSES } from '@/contracts/constants';
import type { OrderStatus } from '@/contracts/types';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const { order, isLoading, error, cancelOrder } = useOrder(orderId);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleGenerateShareLink = async () => {
    setIsGeneratingLink(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/share`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        setShareUrl(data.shareUrl);
      }
    } catch {
      // Handle error
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleCopyLink = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    setIsCancelling(true);
    try {
      await cancelOrder();
      router.refresh();
    } catch {
      // Handle error
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (error || !order) {
    return (
      <EmptyState
        title="Order Not Found"
        description="This order doesn't exist or you don't have access to it."
        action={{
          label: 'Back to Orders',
          onClick: () => router.push('/orders'),
        }}
      />
    );
  }

  const canCancel = CANCELLABLE_ORDER_STATUSES.includes(order.status);
  const showShareLink = ['draft', 'pending_payment', 'confirmed'].includes(order.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{order.eventDetails.eventName}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-muted-foreground">
            Order #{order.id.slice(-8).toUpperCase()}
          </p>
        </div>
        <div className="flex gap-2">
          {canCancel && (
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={isCancelling}
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Order'}
            </Button>
          )}
          {order.status === 'out_for_delivery' && (
            <Link href={`/track/${order.id}`}>
              <Button>Track Delivery</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="font-medium">
                    {formatDate(order.eventDetails.eventDate)} at{' '}
                    {order.eventDetails.eventTime}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Head Count</p>
                  <p className="font-medium">{order.eventDetails.headCount} people</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-medium">{order.eventDetails.contactName}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.eventDetails.contactEmail}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatPhoneNumber(order.eventDetails.contactPhone)}
                  </p>
                </div>
                {order.eventDetails.companyName && (
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium">{order.eventDetails.companyName}</p>
                  </div>
                )}
              </div>
              {order.eventDetails.specialRequests && (
                <div>
                  <p className="text-sm text-muted-foreground">Special Requests</p>
                  <p>{order.eventDetails.specialRequests}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery Info */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{order.delivery.address}</p>
              {order.delivery.addressLine2 && <p>{order.delivery.addressLine2}</p>}
              <p>
                {order.delivery.city}, {order.delivery.state} {order.delivery.zipCode}
              </p>
              <p className="text-sm text-muted-foreground">
                Preferred time: {order.delivery.preferredDeliveryTime}
              </p>
              {order.delivery.deliveryInstructions && (
                <p className="text-sm text-muted-foreground">
                  Instructions: {order.delivery.deliveryInstructions}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Menu Selections */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Menu Selections</CardTitle>
                  <CardDescription>
                    {order.lunchSelections?.length || 0} of {order.eventDetails.headCount}{' '}
                    attendees have selected
                  </CardDescription>
                </div>
                {showShareLink && (
                  <div className="flex gap-2">
                    {shareUrl ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyLink}
                      >
                        {isCopied ? 'Copied!' : 'Copy Link'}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateShareLink}
                        disabled={isGeneratingLink}
                      >
                        {isGeneratingLink ? 'Generating...' : 'Generate Share Link'}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {order.breakfast && (
                <div className="mb-4 rounded-lg bg-muted p-4">
                  <p className="font-medium">
                    {order.breakfast.packageType.charAt(0).toUpperCase() +
                      order.breakfast.packageType.slice(1)}{' '}
                    Breakfast Package
                  </p>
                  <p className="text-sm text-muted-foreground">
                    For {order.breakfast.headCount} people
                  </p>
                </div>
              )}

              {order.lunchSelections && order.lunchSelections.length > 0 ? (
                <AttendeeList
                  selections={order.lunchSelections}
                  headCount={order.eventDetails.headCount}
                />
              ) : (
                <p className="text-center text-muted-foreground">
                  No lunch selections yet. Share the link with attendees to collect
                  their choices.
                </p>
              )}

              {order.snacks && (
                <div className="mt-4 rounded-lg bg-muted p-4">
                  <p className="font-medium">
                    {order.snacks.packageType.charAt(0).toUpperCase() +
                      order.snacks.packageType.slice(1)}{' '}
                    Snack Package
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <OrderSummary order={order} />

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent>
              {order.payment?.paidAt ? (
                <div className="space-y-2">
                  <p className="text-sm text-green-600">
                    Paid on {formatDate(order.payment.paidAt)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Method: {order.payment.method === 'card' ? 'Credit Card' : 'Invoice'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Payment pending</p>
                  {order.status === 'pending_payment' && (
                    <Link href={`/new-order?step=payment&orderId=${order.id}`}>
                      <Button className="w-full">Complete Payment</Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
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
      className={`rounded-full px-3 py-1 text-sm font-medium ${colorMap[status]}`}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
