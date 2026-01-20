'use client';

import { useSnackPackages } from '@/features/menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { formatCurrency } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { SnackSelection } from '@/contracts/types';
import { mockSnackPackages } from '@/contracts/mocks/menu.mock';

interface SnackPackageSelectorProps {
  selected: Partial<SnackSelection> | null;
  headCount: number;
  onSelect: (selection: Partial<SnackSelection> | null) => void;
}

export function SnackPackageSelector({
  selected,
  headCount,
  onSelect,
}: SnackPackageSelectorProps) {
  const { packages, isLoading } = useSnackPackages();

  // Use mock data if no packages loaded
  const displayPackages = packages.length > 0 ? packages : mockSnackPackages;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  const handleSelect = (packageType: 'basic' | 'premium' | 'custom') => {
    if (selected?.packageType === packageType) {
      onSelect(null);
    } else {
      onSelect({
        packageType,
        items: [],
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Add snacks and beverages for {headCount} people, or skip this step.
        </p>
        {selected && (
          <Button variant="ghost" size="sm" onClick={() => onSelect(null)}>
            Skip Snacks
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {displayPackages.map((pkg) => {
          const isSelected = selected?.packageType === pkg.type;
          const totalPrice = pkg.pricePerPerson * headCount;

          return (
            <Card
              key={pkg.id}
              className={cn(
                'cursor-pointer transition-all hover:border-primary',
                isSelected && 'border-2 border-primary ring-2 ring-primary/20'
              )}
              onClick={() => handleSelect(pkg.type)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {formatCurrency(pkg.pricePerPerson)}/person
                    </CardDescription>
                  </div>
                  {isSelected && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <CheckIcon />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{pkg.description}</p>

                <div>
                  <p className="mb-2 text-sm font-medium">Includes:</p>
                  <ul className="space-y-1">
                    {pkg.includedItems.map((item, i) => (
                      <li key={i} className="flex items-center text-sm text-muted-foreground">
                        <span className="mr-2 text-primary">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total for {headCount} people:
                    </span>
                    <span className="text-lg font-semibold">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Beverage Add-ons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Beverage Add-ons</CardTitle>
          <CardDescription>
            Enhance your snack package with additional beverages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <BeverageOption
              name="Coffee Service"
              price={3.99}
              description="Regular & decaf with cream and sugar"
            />
            <BeverageOption
              name="Iced Tea & Lemonade"
              price={2.49}
              description="Freshly brewed tea and lemonade"
            />
            <BeverageOption
              name="Bottled Water Pack"
              price={1.99}
              description="Individual bottled water"
            />
          </div>
        </CardContent>
      </Card>

      {!selected && (
        <p className="text-center text-sm text-muted-foreground">
          Snacks are optional. Click a package to select, or continue to the next step.
        </p>
      )}
    </div>
  );
}

function BeverageOption({
  name,
  price,
  description,
}: {
  name: string;
  price: number;
  description: string;
}) {
  return (
    <div className="rounded-lg border p-3 text-center hover:border-primary hover:bg-muted/50 cursor-pointer transition-colors">
      <p className="font-medium">{name}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
      <p className="mt-1 text-sm font-semibold text-primary">
        +{formatCurrency(price)}/person
      </p>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
    >
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
