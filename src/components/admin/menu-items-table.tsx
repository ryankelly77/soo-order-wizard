'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { MenuItem } from '@/contracts/types';

interface MenuItemsTableProps {
  items: MenuItem[];
  onDelete: (itemId: string) => Promise<void>;
  isLoading?: boolean;
}

type SortField = 'name' | 'category' | 'price' | 'isAvailable';
type SortDirection = 'asc' | 'desc';

export function MenuItemsTable({ items, onDelete, isLoading }: MenuItemsTableProps) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = async (itemId: string, itemName: string) => {
    if (!confirm(`Are you sure you want to delete "${itemName}"?`)) {
      return;
    }

    setDeletingId(itemId);
    try {
      await onDelete(itemId);
    } finally {
      setDeletingId(null);
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'isAvailable':
        comparison = (a.isAvailable ? 1 : 0) - (b.isAvailable ? 1 : 0);
        break;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded" />
          ))}
        </div>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="p-12 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No menu items</h3>
        <p className="mt-2 text-sm text-gray-500">Get started by creating a new menu item.</p>
        <Link href="/admin/menu/new" className="mt-4 inline-block">
          <Button>Add Menu Item</Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-soo-bg-light">
            <tr>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 text-sm font-medium text-soo-text hover:text-soo-dark"
                >
                  Name
                  <SortIcon field="name" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('category')}
                  className="flex items-center gap-1 text-sm font-medium text-soo-text hover:text-soo-dark"
                >
                  Category
                  <SortIcon field="category" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('price')}
                  className="flex items-center gap-1 text-sm font-medium text-soo-text hover:text-soo-dark"
                >
                  Price
                  <SortIcon field="price" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">Dietary</th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('isAvailable')}
                  className="flex items-center gap-1 text-sm font-medium text-soo-text hover:text-soo-dark"
                >
                  Status
                  <SortIcon field="isAvailable" />
                </button>
              </th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sortedItems.map((item) => (
              <tr key={item.id} className="hover:bg-soo-bg-light/50">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-soo-dark">{item.name}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {item.description}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-soo-bg-light px-2 py-1 text-xs font-medium text-soo-text">
                    {item.category.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">
                  ${item.price.toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {item.dietaryTags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
                      >
                        {tag}
                      </span>
                    ))}
                    {item.dietaryTags.length > 2 && (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        +{item.dietaryTags.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      item.isAvailable
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/menu/${item.id}`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(item.id, item.name)}
                      disabled={deletingId === item.id}
                    >
                      {deletingId === item.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
