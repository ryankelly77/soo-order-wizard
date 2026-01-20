'use client';

import { cn } from '@/lib/utils/cn';
import { DELIVERY_STATUS_LABELS } from '@/contracts/constants';
import type { DeliveryTracking, DeliveryStatus } from '@/contracts/types';

interface DeliveryTrackerProps {
  tracking: DeliveryTracking;
}

const DELIVERY_STEPS: DeliveryStatus[] = [
  'pending',
  'assigned',
  'picked_up',
  'in_transit',
  'arriving',
  'delivered',
];

export function DeliveryTracker({ tracking }: DeliveryTrackerProps) {
  const currentIndex = DELIVERY_STEPS.indexOf(tracking.status);
  const isFailed = tracking.status === 'failed';

  if (isFailed) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <span className="text-xl">⚠️</span>
          </div>
          <div>
            <p className="font-medium text-red-800">Delivery Issue</p>
            <p className="text-sm text-red-600">
              There was a problem with your delivery. Please contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Steps */}
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-4 top-0 h-full w-0.5 bg-muted" />
        <div
          className="absolute left-4 top-0 w-0.5 bg-primary transition-all duration-500"
          style={{
            height: `${(currentIndex / (DELIVERY_STEPS.length - 1)) * 100}%`,
          }}
        />

        {/* Steps */}
        <div className="relative space-y-6">
          {DELIVERY_STEPS.map((step, index) => {
            const isComplete = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isPending = index > currentIndex;

            return (
              <div key={step} className="flex items-start gap-4">
                {/* Step Indicator */}
                <div
                  className={cn(
                    'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all',
                    isComplete && 'border-primary bg-primary text-primary-foreground',
                    isCurrent && 'border-primary bg-primary text-primary-foreground animate-pulse',
                    isPending && 'border-muted bg-background text-muted-foreground'
                  )}
                >
                  {isComplete ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : isCurrent ? (
                    <div className="h-2 w-2 rounded-full bg-current" />
                  ) : (
                    <span className="text-xs">{index + 1}</span>
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 pb-2">
                  <p
                    className={cn(
                      'font-medium',
                      isPending && 'text-muted-foreground'
                    )}
                  >
                    {DELIVERY_STATUS_LABELS[step]}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getStepDescription(step)}
                  </p>
                  {isCurrent && tracking.estimatedDeliveryTime && (
                    <p className="mt-1 text-sm font-medium text-primary">
                      ETA: {new Date(tracking.estimatedDeliveryTime).toLocaleTimeString(
                        'en-US',
                        { hour: 'numeric', minute: '2-digit' }
                      )}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status History */}
      {tracking.statusHistory && tracking.statusHistory.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="mb-2 text-sm font-medium text-muted-foreground">
            Recent Updates
          </h4>
          <div className="space-y-2">
            {tracking.statusHistory.slice(-3).reverse().map((update, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-sm"
              >
                <span className="text-muted-foreground">
                  {new Date(update.timestamp).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
                <span>{DELIVERY_STATUS_LABELS[update.status]}</span>
                {update.note && (
                  <span className="text-muted-foreground">- {update.note}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
    >
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function getStepDescription(status: DeliveryStatus): string {
  const descriptions: Record<DeliveryStatus, string> = {
    pending: 'Order is being prepared',
    assigned: 'Driver has been assigned to your delivery',
    picked_up: 'Driver has picked up your order',
    in_transit: 'Your order is on the way',
    arriving: 'Driver is almost there',
    delivered: 'Order has been delivered',
    failed: 'Delivery could not be completed',
  };
  return descriptions[status];
}
