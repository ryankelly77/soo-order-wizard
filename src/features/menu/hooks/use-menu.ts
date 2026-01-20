'use client';

import { useState, useEffect, useCallback } from 'react';
import * as menuService from '../services/menu.service';
import type { Menu, MenuItem, BreakfastPackage, SnackPackage, DietaryTag } from '@/contracts/types';

export function useMenu() {
  const [menu, setMenu] = useState<Menu | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenu = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await menuService.getMenu();
      setMenu(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch menu');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  return {
    menu,
    isLoading,
    error,
    refetch: fetchMenu,
  };
}

export function useBreakfastPackages() {
  const [packages, setPackages] = useState<BreakfastPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await menuService.getBreakfastPackages();
        setPackages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch packages');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  return { packages, isLoading, error };
}

export function useLunchItems(filters?: { dietaryTags?: DietaryTag[] }) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await menuService.getLunchItems();
        setItems(data);
        setFilteredItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch items');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!filters?.dietaryTags?.length) {
      setFilteredItems(items);
      return;
    }

    const filtered = items.filter((item) =>
      filters.dietaryTags!.every((tag) => item.dietaryTags.includes(tag))
    );
    setFilteredItems(filtered);
  }, [items, filters?.dietaryTags]);

  return { items: filteredItems, allItems: items, isLoading, error };
}

export function useSnackPackages() {
  const [packages, setPackages] = useState<SnackPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await menuService.getSnackPackages();
        setPackages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch packages');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  return { packages, isLoading, error };
}
