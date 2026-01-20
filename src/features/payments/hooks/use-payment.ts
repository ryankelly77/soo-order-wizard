'use client';

import { useState, useCallback } from 'react';

interface UsePaymentOptions {
  orderId: string;
  amount: number;
}

export function usePayment({ orderId, amount }: UsePaymentOptions) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  const initializePayment = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, amount }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to initialize payment');
      }

      setClientSecret(data.clientSecret);
      return data.clientSecret;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment initialization failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [orderId, amount]);

  const confirmPayment = useCallback(async (paymentIntentId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Payment confirmation failed');
      }

      setPaymentStatus(data.status);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment confirmation failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    clientSecret,
    isLoading,
    error,
    paymentStatus,
    initializePayment,
    confirmPayment,
  };
}
