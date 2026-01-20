'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LunchGrid } from '@/components/order/lunch-grid';
import { PageLoader } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import type { MenuItem, Order } from '@/contracts/types';

interface AttendeeInfo {
  name: string;
  email: string;
  dietaryRestrictions: string[];
}

export default function JoinOrderPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const token = params.token as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [attendeeInfo, setAttendeeInfo] = useState<AttendeeInfo>({
    name: '',
    email: '',
    dietaryRestrictions: [],
  });
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [specialInstructions, setSpecialInstructions] = useState('');

  useEffect(() => {
    const validateAndFetch = async () => {
      try {
        // Validate share token
        const validateRes = await fetch(
          `/api/orders/${orderId}/share?token=${token}`
        );

        if (!validateRes.ok) {
          setError('This link is invalid or has expired.');
          setIsLoading(false);
          return;
        }

        setIsTokenValid(true);

        // Fetch order details
        const orderRes = await fetch(`/api/orders/${orderId}?token=${token}`);
        if (orderRes.ok) {
          const orderData = await orderRes.json();
          setOrder(orderData.data);
        }

        // Fetch menu items
        const menuRes = await fetch('/api/menu/lunch');
        if (menuRes.ok) {
          const menuData = await menuRes.json();
          setMenuItems(menuData.data || []);
        }
      } catch {
        setError('Failed to load order information.');
      } finally {
        setIsLoading(false);
      }
    };

    validateAndFetch();
  }, [orderId, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedItemId || !attendeeInfo.name || !attendeeInfo.email) {
      setError('Please fill in all required fields and select a menu item.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const selectedItem = menuItems.find((item) => item.id === selectedItemId);

      const response = await fetch(
        `/api/orders/${orderId}/lunch-selections?token=${token}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attendeeName: attendeeInfo.name,
            attendeeEmail: attendeeInfo.email,
            menuItemId: selectedItemId,
            menuItemName: selectedItem?.name,
            specialInstructions,
            dietaryRestrictions: attendeeInfo.dietaryRestrictions,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to submit selection');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit selection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDietaryChange = (tag: string) => {
    setAttendeeInfo((prev) => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(tag)
        ? prev.dietaryRestrictions.filter((t) => t !== tag)
        : [...prev.dietaryRestrictions, tag],
    }));
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isTokenValid || error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <EmptyState
          title="Link Invalid"
          description={error || 'This link is invalid or has expired.'}
          icon={<span className="text-4xl">🔗</span>}
        />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 text-5xl">✅</div>
            <CardTitle>Selection Submitted!</CardTitle>
            <CardDescription>
              Thank you, {attendeeInfo.name}! Your lunch selection has been recorded.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You selected: <strong>{menuItems.find((m) => m.id === selectedItemId)?.name}</strong>
            </p>
            {order && (
              <p className="mt-4 text-sm text-muted-foreground">
                Event: {order.eventDetails.eventName} on{' '}
                {new Date(order.eventDetails.eventDate).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold">Select Your Lunch</h1>
          {order && (
            <p className="mt-2 text-muted-foreground">
              {order.eventDetails.eventName} &middot;{' '}
              {new Date(order.eventDetails.eventDate).toLocaleDateString()}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Attendee Info */}
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={attendeeInfo.name}
                    onChange={(e) =>
                      setAttendeeInfo((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={attendeeInfo.email}
                    onChange={(e) =>
                      setAttendeeInfo((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Dietary Restrictions</Label>
                <div className="flex flex-wrap gap-2">
                  {['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free'].map(
                    (tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleDietaryChange(tag)}
                        className={`rounded-full px-3 py-1 text-sm transition-colors ${
                          attendeeInfo.dietaryRestrictions.includes(tag)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {tag}
                      </button>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Menu Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Meal *</CardTitle>
              <CardDescription>
                Select one item from the menu below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LunchGrid
                items={menuItems}
                selectedItemId={selectedItemId}
                onSelect={setSelectedItemId}
                dietaryFilters={attendeeInfo.dietaryRestrictions}
              />
            </CardContent>
          </Card>

          {/* Special Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Special Instructions</CardTitle>
              <CardDescription>
                Any allergies or special requests? (Optional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                rows={3}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g., No onions please, allergic to shellfish"
              />
            </CardContent>
          </Card>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting || !selectedItemId}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Selection'}
          </Button>
        </form>
      </div>
    </div>
  );
}
