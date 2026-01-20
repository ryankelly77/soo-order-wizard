'use client';

import { useState, useCallback } from 'react';
import * as adminService from '../services/admin.service';
import type { MenuItem, BreakfastPackage, SnackPackage } from '@/contracts/types';
import type { MenuItemFormData, BreakfastPackageFormData, SnackPackageFormData } from '@/contracts/types';

interface UseMenuManagementOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useMenuManagement(options: UseMenuManagementOptions = {}) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [breakfastPackages, setBreakfastPackages] = useState<BreakfastPackage[]>([]);
  const [snackPackages, setSnackPackages] = useState<SnackPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // =============================================================================
  // FETCH ALL
  // =============================================================================

  const fetchMenuItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await adminService.getAllMenuItems();
      setMenuItems(items);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch menu items');
      setError(error);
      options.onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const fetchBreakfastPackages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const packages = await adminService.getAllBreakfastPackages();
      setBreakfastPackages(packages);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch breakfast packages');
      setError(error);
      options.onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const fetchSnackPackages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const packages = await adminService.getAllSnackPackages();
      setSnackPackages(packages);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch snack packages');
      setError(error);
      options.onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [items, breakfast, snacks] = await Promise.all([
        adminService.getAllMenuItems(),
        adminService.getAllBreakfastPackages(),
        adminService.getAllSnackPackages(),
      ]);
      setMenuItems(items);
      setBreakfastPackages(breakfast);
      setSnackPackages(snacks);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch menu data');
      setError(error);
      options.onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  // =============================================================================
  // MENU ITEMS
  // =============================================================================

  const createMenuItem = useCallback(async (input: MenuItemFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const newItem = await adminService.createMenuItem(input);
      setMenuItems(prev => [...prev, newItem]);
      options.onSuccess?.();
      return newItem;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create menu item');
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const updateMenuItem = useCallback(async (itemId: string, input: Partial<MenuItemFormData>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await adminService.updateMenuItem(itemId, input);
      setMenuItems(prev => prev.map(item => item.id === itemId ? updated : item));
      options.onSuccess?.();
      return updated;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update menu item');
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const deleteMenuItem = useCallback(async (itemId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await adminService.deleteMenuItem(itemId);
      setMenuItems(prev => prev.filter(item => item.id !== itemId));
      options.onSuccess?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete menu item');
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  // =============================================================================
  // BREAKFAST PACKAGES
  // =============================================================================

  const createBreakfastPackage = useCallback(async (input: BreakfastPackageFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const newPackage = await adminService.createBreakfastPackage(input);
      setBreakfastPackages(prev => [...prev, newPackage]);
      options.onSuccess?.();
      return newPackage;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create breakfast package');
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const updateBreakfastPackage = useCallback(async (packageId: string, input: Partial<BreakfastPackageFormData>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await adminService.updateBreakfastPackage(packageId, input);
      setBreakfastPackages(prev => prev.map(pkg => pkg.id === packageId ? updated : pkg));
      options.onSuccess?.();
      return updated;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update breakfast package');
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const deleteBreakfastPackage = useCallback(async (packageId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await adminService.deleteBreakfastPackage(packageId);
      setBreakfastPackages(prev => prev.filter(pkg => pkg.id !== packageId));
      options.onSuccess?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete breakfast package');
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  // =============================================================================
  // SNACK PACKAGES
  // =============================================================================

  const createSnackPackage = useCallback(async (input: SnackPackageFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const newPackage = await adminService.createSnackPackage(input);
      setSnackPackages(prev => [...prev, newPackage]);
      options.onSuccess?.();
      return newPackage;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create snack package');
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const updateSnackPackage = useCallback(async (packageId: string, input: Partial<SnackPackageFormData>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await adminService.updateSnackPackage(packageId, input);
      setSnackPackages(prev => prev.map(pkg => pkg.id === packageId ? updated : pkg));
      options.onSuccess?.();
      return updated;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update snack package');
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const deleteSnackPackage = useCallback(async (packageId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await adminService.deleteSnackPackage(packageId);
      setSnackPackages(prev => prev.filter(pkg => pkg.id !== packageId));
      options.onSuccess?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete snack package');
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  return {
    // State
    menuItems,
    breakfastPackages,
    snackPackages,
    isLoading,
    error,

    // Fetch
    fetchMenuItems,
    fetchBreakfastPackages,
    fetchSnackPackages,
    fetchAll,

    // Menu Items
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,

    // Breakfast Packages
    createBreakfastPackage,
    updateBreakfastPackage,
    deleteBreakfastPackage,

    // Snack Packages
    createSnackPackage,
    updateSnackPackage,
    deleteSnackPackage,
  };
}
