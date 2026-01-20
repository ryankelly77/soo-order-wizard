'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MenuItemsTable } from '@/components/admin';
import type { MenuItem } from '@/contracts/types';

export default function AdminMenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/menu');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch menu items');
      }

      setMenuItems(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load menu items');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleDelete = async (itemId: string) => {
    try {
      const response = await fetch(`/api/admin/menu/${itemId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to delete item');
      }

      setMenuItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-soo-dark">Menu Items</h1>
          <p className="text-muted-foreground">
            Manage your menu items, breakfast packages, and snack packages
          </p>
        </div>
        <Link href="/admin/menu/new">
          <Button>
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Item
          </Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-soo-gray pb-4">
        <button className="px-4 py-2 text-sm font-medium bg-soo-red text-white rounded-lg">
          All Items ({menuItems.length})
        </button>
        <button className="px-4 py-2 text-sm font-medium text-soo-text hover:bg-soo-bg-light rounded-lg">
          Entrees ({menuItems.filter(i => i.category === 'lunch_entree').length})
        </button>
        <button className="px-4 py-2 text-sm font-medium text-soo-text hover:bg-soo-bg-light rounded-lg">
          Sides ({menuItems.filter(i => i.category === 'lunch_side').length})
        </button>
        <button className="px-4 py-2 text-sm font-medium text-soo-text hover:bg-soo-bg-light rounded-lg">
          Salads ({menuItems.filter(i => i.category === 'lunch_salad').length})
        </button>
        <button className="px-4 py-2 text-sm font-medium text-soo-text hover:bg-soo-bg-light rounded-lg">
          Beverages ({menuItems.filter(i => i.category === 'beverages').length})
        </button>
      </div>

      <MenuItemsTable
        items={menuItems}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
    </div>
  );
}
