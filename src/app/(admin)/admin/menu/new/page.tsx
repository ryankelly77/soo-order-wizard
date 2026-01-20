'use client';

import { useState } from 'react';
import { MenuItemForm } from '@/components/admin';
import type { MenuItemFormData } from '@/contracts/types';

export default function NewMenuItemPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: MenuItemFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to create menu item');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-soo-dark">Add Menu Item</h1>
        <p className="text-muted-foreground">Create a new item for your menu</p>
      </div>

      <MenuItemForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
