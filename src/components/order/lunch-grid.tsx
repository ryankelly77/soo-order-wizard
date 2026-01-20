'use client';

import { useState, useMemo } from 'react';
import { useLunchItems } from '@/features/menu';
import { LunchItemCard } from './lunch-item-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { DIETARY_TAG_LABELS } from '@/contracts/constants';
import type { MenuItem, DietaryTag } from '@/contracts/types';
import { mockLunchItems } from '@/contracts/mocks/menu.mock';

interface LunchGridProps {
  items?: MenuItem[];
  selectedItemId: string | null;
  onSelect: (itemId: string) => void;
  dietaryFilters?: string[];
}

const DIETARY_OPTIONS: DietaryTag[] = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'nut-free',
];

export function LunchGrid({
  items: propItems,
  selectedItemId,
  onSelect,
  dietaryFilters = [],
}: LunchGridProps) {
  const { items: fetchedItems, isLoading } = useLunchItems();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDietaryFilters, setActiveDietaryFilters] = useState<DietaryTag[]>(
    dietaryFilters as DietaryTag[]
  );

  // Use prop items, fetched items, or mock data
  const items = propItems || (fetchedItems.length > 0 ? fetchedItems : mockLunchItems);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Dietary filter
      const matchesDietary =
        activeDietaryFilters.length === 0 ||
        activeDietaryFilters.every((tag) => item.dietaryTags.includes(tag));

      return matchesSearch && matchesDietary;
    });
  }, [items, searchQuery, activeDietaryFilters]);

  const toggleDietaryFilter = (tag: DietaryTag) => {
    setActiveDietaryFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  if (isLoading && !propItems) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <Input
          placeholder="Search menu items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="flex flex-wrap gap-2">
          {DIETARY_OPTIONS.map((tag) => (
            <Button
              key={tag}
              type="button"
              variant={activeDietaryFilters.includes(tag) ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleDietaryFilter(tag)}
            >
              {DIETARY_TAG_LABELS[tag]}
            </Button>
          ))}
          {activeDietaryFilters.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setActiveDietaryFilters([])}
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <EmptyState
          title="No items found"
          description={
            searchQuery || activeDietaryFilters.length > 0
              ? 'Try adjusting your search or filters.'
              : 'No menu items available.'
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <LunchItemCard
              key={item.id}
              item={item}
              isSelected={selectedItemId === item.id}
              onSelect={() => onSelect(item.id)}
            />
          ))}
        </div>
      )}

      {selectedItemId && (
        <div className="rounded-lg bg-primary/10 p-4 text-center">
          <p className="font-medium text-primary">
            Selected: {items.find((i) => i.id === selectedItemId)?.name}
          </p>
        </div>
      )}
    </div>
  );
}
