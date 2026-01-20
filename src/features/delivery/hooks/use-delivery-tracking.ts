'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DeliveryTracking } from '@/contracts/types';

const POLLING_INTERVAL = 30000; // 30 seconds

export function useDeliveryTracking(orderId: string) {
  const [tracking, setTracking] = useState<DeliveryTracking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = useCallback(async () => {
    try {
      const response = await fetch(`/api/delivery/${orderId}/status`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch tracking');
      }

      setTracking(data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tracking');
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchTracking();

    // Poll for updates while delivery is in progress
    const interval = setInterval(() => {
      if (tracking && !['delivered', 'failed'].includes(tracking.status)) {
        fetchTracking();
      }
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchTracking, tracking]);

  const isDeliveryComplete = tracking?.status === 'delivered';
  const isDeliveryFailed = tracking?.status === 'failed';
  const isInProgress = tracking && !isDeliveryComplete && !isDeliveryFailed;

  return {
    tracking,
    isLoading,
    error,
    isDeliveryComplete,
    isDeliveryFailed,
    isInProgress,
    refetch: fetchTracking,
  };
}
