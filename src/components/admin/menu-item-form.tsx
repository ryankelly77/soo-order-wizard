'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import type { MenuItem, MenuItemFormData, MenuCategory, DietaryTag } from '@/contracts/types';

const CATEGORIES: { value: MenuCategory; label: string }[] = [
  { value: 'lunch_entree', label: 'Lunch Entree' },
  { value: 'lunch_side', label: 'Lunch Side' },
  { value: 'lunch_salad', label: 'Lunch Salad' },
  { value: 'lunch_sandwich', label: 'Lunch Sandwich' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'breakfast', label: 'Breakfast' },
];

const DIETARY_TAGS: { value: DietaryTag; label: string }[] = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten-Free' },
  { value: 'dairy-free', label: 'Dairy-Free' },
  { value: 'nut-free', label: 'Nut-Free' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
];

const COMMON_ALLERGENS = [
  'gluten',
  'dairy',
  'eggs',
  'fish',
  'shellfish',
  'tree-nuts',
  'peanuts',
  'soy',
  'sesame',
];

interface MenuItemFormProps {
  item?: MenuItem;
  onSubmit: (data: MenuItemFormData) => Promise<void>;
  isLoading?: boolean;
}

export function MenuItemForm({ item, onSubmit, isLoading }: MenuItemFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<MenuItemFormData>({
    name: item?.name || '',
    description: item?.description || '',
    category: item?.category || 'lunch_entree',
    price: item?.price || 0,
    imageUrl: item?.imageUrl || '',
    dietaryTags: item?.dietaryTags || [],
    allergens: item?.allergens || [],
    servingSize: item?.servingSize || '',
    isAvailable: item?.isAvailable ?? true,
    isPopular: item?.isPopular || false,
    displayOrder: 0,
    calories: item?.calories,
    preparationTime: item?.preparationTime,
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await onSubmit(formData);
      router.push('/admin/menu');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save menu item');
    }
  };

  const toggleDietaryTag = (tag: DietaryTag) => {
    setFormData(prev => ({
      ...prev,
      dietaryTags: prev.dietaryTags.includes(tag)
        ? prev.dietaryTags.filter(t => t !== tag)
        : [...prev.dietaryTags, tag],
    }));
  };

  const toggleAllergen = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              placeholder="e.g., Grilled Chicken Club"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as MenuCategory }))}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              rows={3}
              placeholder="Describe the dish..."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price ($) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
              placeholder="https://..."
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Additional Details</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="servingSize">Serving Size</Label>
            <Input
              id="servingSize"
              value={formData.servingSize || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, servingSize: e.target.value }))}
              placeholder="e.g., 1 sandwich"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="calories">Calories</Label>
            <Input
              id="calories"
              type="number"
              min="0"
              value={formData.calories || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, calories: parseInt(e.target.value) || undefined }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preparationTime">Prep Time (min)</Label>
            <Input
              id="preparationTime"
              type="number"
              min="0"
              value={formData.preparationTime || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, preparationTime: parseInt(e.target.value) || undefined }))}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Dietary Tags</h3>
        <div className="flex flex-wrap gap-2">
          {DIETARY_TAGS.map(tag => (
            <button
              key={tag.value}
              type="button"
              onClick={() => toggleDietaryTag(tag.value)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                formData.dietaryTags.includes(tag.value)
                  ? 'bg-soo-red text-white'
                  : 'bg-soo-bg-light text-soo-text hover:bg-soo-gray'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Allergens</h3>
        <div className="flex flex-wrap gap-2">
          {COMMON_ALLERGENS.map(allergen => (
            <button
              key={allergen}
              type="button"
              onClick={() => toggleAllergen(allergen)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                formData.allergens.includes(allergen)
                  ? 'bg-amber-500 text-white'
                  : 'bg-soo-bg-light text-soo-text hover:bg-soo-gray'
              }`}
            >
              {allergen}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Visibility</h3>
        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isAvailable}
              onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm font-medium">Available for ordering</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPopular || false}
              onChange={(e) => setFormData(prev => ({ ...prev, isPopular: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm font-medium">Mark as popular item</span>
          </label>
        </div>
      </Card>

      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/menu')}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : item ? 'Update Item' : 'Create Item'}
        </Button>
      </div>
    </form>
  );
}
