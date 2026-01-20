'use client';

import { useState, useEffect, useCallback } from 'react';
import * as orderService from '../services/order.service';
import type { Order } from '@/contracts/types';
import type { CreateOrderInput } from '@/contracts/schemas';

export function useOrder(orderId?: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await orderService.getOrder(orderId);
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order');
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const updateOrder = useCallback(async (updates: Partial<CreateOrderInput>) => {
    if (!orderId) return;

    setIsLoading(true);
    setError(null);

    try {
      const updated = await orderService.updateOrder(orderId, updates);
      setOrder(updated);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  const cancelOrder = useCallback(async () => {
    if (!orderId) return;

    setIsLoading(true);
    setError(null);

    try {
      await orderService.cancelOrder(orderId);
      setOrder((prev) => prev ? { ...prev, status: 'cancelled' } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel order');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  return {
    order,
    isLoading,
    error,
    refetch: fetchOrder,
    updateOrder,
    cancelOrder,
  };
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const createOrder = useCallback(async (input: CreateOrderInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const newOrder = await orderService.createOrder(input);
      setOrders((prev) => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    orders,
    isLoading,
    error,
    refetch: fetchOrders,
    createOrder,
  };
}
