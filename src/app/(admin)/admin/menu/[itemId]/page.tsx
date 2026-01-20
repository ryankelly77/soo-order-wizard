'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MenuItemForm } from '@/components/admin';
import type { MenuItem, MenuItemFormData } from '@/contracts/types';

export default function EditMenuItemPage() {
  const params = useParams();
  const itemId = params.itemId as string;

  const [item, setItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await fetch(`/api/admin/menu/${itemId}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error?.message || 'Failed to fetch menu item');
        }

        setItem(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load menu item');
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [itemId]);

  const handleSubmit = async (data: MenuItemFormData) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/menu/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to update menu item');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-32 mt-2 animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-soo-dark">Menu Item Not Found</h1>
          <p className="text-muted-foreground">{error || 'The requested menu item could not be found.'}</p>
        </div>
        <a
          href="/admin/menu"
          className="inline-flex items-center text-soo-red hover:underline"
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Menu Items
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-soo-dark">Edit Menu Item</h1>
        <p className="text-muted-foreground">Update details for {item.name}</p>
      </div>

      <MenuItemForm item={item} onSubmit={handleSubmit} isLoading={isSaving} />
    </div>
  );
}
