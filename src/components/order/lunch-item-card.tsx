'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/format';
import { DIETARY_TAG_LABELS } from '@/contracts/constants';
import type { MenuItem, DietaryTag } from '@/contracts/types';

interface LunchItemCardProps {
  item: MenuItem;
  isSelected: boolean;
  onSelect: () => void;
}

export function LunchItemCard({ item, isSelected, onSelect }: LunchItemCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:border-primary hover:shadow-md',
        isSelected && 'border-2 border-primary ring-2 ring-primary/20'
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        {/* Image placeholder */}
        {item.imageUrl ? (
          <div className="mb-3 aspect-[4/3] overflow-hidden rounded-lg bg-muted">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="mb-3 flex aspect-[4/3] items-center justify-center rounded-lg bg-muted">
            <span className="text-4xl">🍽️</span>
          </div>
        )}

        {/* Content */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-tight">{item.name}</h3>
            {isSelected && (
              <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <CheckIcon />
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>

          {/* Dietary Tags */}
          {item.dietaryTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.dietaryTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700"
                >
                  {DIETARY_TAG_LABELS[tag as DietaryTag]}
                </span>
              ))}
            </div>
          )}

          {/* Price and Calories */}
          <div className="flex items-center justify-between pt-2">
            <span className="font-semibold">{formatCurrency(item.price)}</span>
            {item.calories && (
              <span className="text-xs text-muted-foreground">
                {item.calories} cal
              </span>
            )}
          </div>

          {/* Popular Badge */}
          {item.isPopular && (
            <div className="absolute -right-2 -top-2 rounded-full bg-orange-500 px-2 py-0.5 text-xs font-medium text-white">
              Popular
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-3 w-3"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
    >
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
