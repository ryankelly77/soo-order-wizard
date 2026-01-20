'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import type { DeliveryTracking } from '@/contracts/types';

interface ShipdayMapProps {
  tracking: DeliveryTracking;
  deliveryAddress: {
    latitude?: number;
    longitude?: number;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  className?: string;
}

export function ShipdayMap({
  tracking,
  deliveryAddress,
  className,
}: ShipdayMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  const driverLocation = tracking.currentLocation;
  const hasDriverLocation = driverLocation?.latitude && driverLocation?.longitude;

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // If we have a tracking URL from Shipday, use iframe
  if (tracking.trackingUrl) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Live Delivery Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <LoadingSpinner />
              </div>
            )}
            <iframe
              src={tracking.trackingUrl}
              className="h-full w-full"
              onLoad={() => setIsLoading(false)}
              title="Delivery Tracking Map"
              allow="geolocation"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Fallback: Show static map with driver position
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Delivery Location</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={mapRef}
          className="relative aspect-video overflow-hidden rounded-lg border bg-muted"
        >
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="relative h-full w-full">
              {/* Map Placeholder - In production, integrate with Google Maps or Mapbox */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
                <MapPlaceholder />
              </div>

              {/* Delivery Location Marker */}
              <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2">
                <div className="flex flex-col items-center">
                  <LocationPinIcon className="h-8 w-8 text-primary drop-shadow-lg" />
                  <div className="mt-1 rounded-full bg-white px-2 py-0.5 text-xs font-medium shadow">
                    Delivery
                  </div>
                </div>
              </div>

              {/* Driver Marker */}
              {hasDriverLocation && (
                <div className="absolute left-1/3 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse">
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white shadow-lg">
                      <CarIcon className="h-5 w-5" />
                    </div>
                    <div className="mt-1 rounded-full bg-green-500 px-2 py-0.5 text-xs font-medium text-white shadow">
                      Driver
                    </div>
                  </div>
                </div>
              )}

              {/* Route Line Placeholder */}
              {hasDriverLocation && (
                <svg
                  className="absolute inset-0 h-full w-full"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 33% 50% Q 50% 35%, 50% 67%"
                    fill="none"
                    stroke="rgba(34, 197, 94, 0.6)"
                    strokeWidth="3"
                    strokeDasharray="8,4"
                    className="animate-dash"
                  />
                </svg>
              )}
            </div>
          )}
        </div>

        {/* Address Display */}
        <div className="mt-3 flex items-start gap-2 text-sm">
          <LocationPinIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <div>
            <p className="font-medium">Delivery Address</p>
            <p className="text-muted-foreground">
              {deliveryAddress.street}, {deliveryAddress.city},{' '}
              {deliveryAddress.state} {deliveryAddress.zip}
            </p>
          </div>
        </div>

        {/* Driver Info */}
        {tracking.driver && (
          <div className="mt-3 flex items-center gap-3 rounded-lg border p-3">
            {tracking.driver.photoUrl ? (
              <img
                src={tracking.driver.photoUrl}
                alt={tracking.driver.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <UserIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <p className="font-medium">{tracking.driver.name}</p>
              {tracking.driver.vehicleInfo && (
                <p className="text-sm text-muted-foreground">
                  {tracking.driver.vehicleInfo}
                </p>
              )}
            </div>
            {tracking.driver.phone && (
              <a
                href={`tel:${tracking.driver.phone}`}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <PhoneIcon className="h-4 w-4" />
              </a>
            )}
          </div>
        )}

        {/* Last Updated */}
        {driverLocation?.updatedAt && (
          <p className="mt-2 text-xs text-muted-foreground">
            Last updated:{' '}
            {new Date(driverLocation.updatedAt).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function MapPlaceholder() {
  return (
    <svg className="h-full w-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
      {/* Grid lines */}
      {Array.from({ length: 10 }).map((_, i) => (
        <line
          key={`h-${i}`}
          x1="0"
          y1={i * 10}
          x2="100"
          y2={i * 10}
          stroke="currentColor"
          strokeWidth="0.2"
        />
      ))}
      {Array.from({ length: 10 }).map((_, i) => (
        <line
          key={`v-${i}`}
          x1={i * 10}
          y1="0"
          x2={i * 10}
          y2="100"
          stroke="currentColor"
          strokeWidth="0.2"
        />
      ))}
      {/* Roads */}
      <rect x="45" y="0" width="10" height="100" fill="rgba(0,0,0,0.1)" />
      <rect x="0" y="35" width="100" height="8" fill="rgba(0,0,0,0.1)" />
      <rect x="20" y="60" width="60" height="6" fill="rgba(0,0,0,0.08)" />
    </svg>
  );
}

function LocationPinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  );
}

function CarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        d="M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m-4 0H3v-4l2-6h10l2 6v4h-2m-4 0a2 2 0 104 0m-4 0a2 2 0 114 0m6 0h2v-4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
