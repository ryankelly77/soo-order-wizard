'use client';

import { useParams } from 'next/navigation';
import { useDeliveryTracking } from '@/features/delivery';
import { DeliveryTracker } from '@/components/tracking/delivery-tracker';
import { ShipdayMap } from '@/components/tracking/shipday-map';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLoader } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { formatPhoneNumber } from '@/lib/utils/format';
import { DELIVERY_STATUS_LABELS } from '@/contracts/constants';

export default function TrackDeliveryPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const {
    tracking,
    isLoading,
    error,
    isDeliveryComplete,
    isDeliveryFailed,
  } = useDeliveryTracking(orderId);

  if (isLoading) {
    return <PageLoader />;
  }

  if (error || !tracking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <EmptyState
          title="Tracking Not Available"
          description={error || 'Unable to load tracking information for this order.'}
          icon={<span className="text-4xl">📦</span>}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="font-heading text-xl font-bold">SOO Catering</h1>
          <span className="text-sm text-muted-foreground">
            Order #{orderId.slice(-8).toUpperCase()}
          </span>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold">Track Your Delivery</h2>
          <p className="mt-2 text-muted-foreground">
            {isDeliveryComplete
              ? 'Your order has been delivered!'
              : isDeliveryFailed
              ? 'There was an issue with your delivery'
              : 'Real-time updates on your order'}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Status</CardTitle>
              <CardDescription>
                {DELIVERY_STATUS_LABELS[tracking.status]}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeliveryTracker tracking={tracking} />
            </CardContent>
          </Card>

          {/* Driver Info */}
          {tracking.driver && (
            <Card>
              <CardHeader>
                <CardTitle>Your Driver</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-2xl">🚗</span>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{tracking.driver.name}</p>
                    <a
                      href={`tel:${tracking.driver.phone}`}
                      className="text-primary hover:underline"
                    >
                      {formatPhoneNumber(tracking.driver.phone)}
                    </a>
                    {tracking.driver.vehicleInfo && (
                      <p className="text-sm text-muted-foreground">
                        {tracking.driver.vehicleInfo}
                      </p>
                    )}
                  </div>
                </div>

                {tracking.estimatedDeliveryTime && (
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm text-muted-foreground">
                      Estimated Arrival
                    </p>
                    <p className="text-xl font-semibold">
                      {new Date(tracking.estimatedDeliveryTime).toLocaleTimeString(
                        'en-US',
                        { hour: 'numeric', minute: '2-digit' }
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Map */}
          {tracking.currentLocation && !isDeliveryComplete && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Live Location</CardTitle>
              </CardHeader>
              <CardContent>
                <ShipdayMap
                  tracking={tracking}
                  deliveryAddress={{
                    street: '',
                    city: '',
                    state: '',
                    zip: '',
                  }}
                  className="h-[300px] w-full rounded-lg"
                />
              </CardContent>
            </Card>
          )}

          {/* Delivery Complete */}
          {isDeliveryComplete && (
            <Card className="lg:col-span-2 border-green-200 bg-green-50">
              <CardContent className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <span className="text-3xl">✅</span>
                </div>
                <h3 className="text-xl font-semibold text-green-800">
                  Delivered Successfully!
                </h3>
                <p className="mt-2 text-green-700">
                  Your order was delivered at{' '}
                  {tracking.actualDeliveryTime &&
                    new Date(tracking.actualDeliveryTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                </p>
                <p className="mt-4 text-sm text-green-600">
                  Thank you for choosing SOO Catering!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
