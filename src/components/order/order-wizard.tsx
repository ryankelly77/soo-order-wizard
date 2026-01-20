'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useOrderWizard, type WizardStep } from '@/features/orders/hooks/use-order-wizard';
import { StepIndicator } from '@/components/layout/step-indicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BreakfastSelector } from './breakfast-selector';
import { SnackPackageSelector } from './snack-package-selector';
import { DeliveryForm } from './delivery-form';
import { PaymentForm } from './payment-form';
import { OrderSummary } from './order-summary';
import { ButtonLoader } from '@/components/shared/loading-spinner';
import type { EventDetails } from '@/contracts/types';

const WIZARD_STEPS = [
  { id: 'event-details', name: 'Event Details', description: 'Basic info' },
  { id: 'breakfast', name: 'Breakfast', description: 'Optional' },
  { id: 'lunch', name: 'Lunch', description: 'Individual selections' },
  { id: 'snacks-drinks', name: 'Snacks & Drinks', description: 'Optional' },
  { id: 'delivery', name: 'Delivery', description: 'Location & time' },
  { id: 'payment', name: 'Payment', description: 'Checkout' },
];

export function OrderWizard() {
  const searchParams = useSearchParams();
  const {
    currentStep,
    eventDetails,
    breakfast,
    snacks,
    delivery,
    isFirstStep,
    isLastStep,
    progress,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    setEventDetails,
    setBreakfast,
    setSnacks,
    setDelivery,
    submitOrder,
    canProceed,
  } = useOrderWizard();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync step from URL
  useEffect(() => {
    const stepParam = searchParams.get('step') as WizardStep | null;
    if (stepParam && WIZARD_STEPS.some((s) => s.id === stepParam)) {
      goToStep(stepParam);
    }
  }, [searchParams, goToStep]);

  const handleNext = async () => {
    if (isLastStep) {
      setIsSubmitting(true);
      setError(null);
      try {
        await submitOrder();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to submit order');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      goToNextStep();
    }
  };

  const completedSteps = WIZARD_STEPS.slice(
    0,
    WIZARD_STEPS.findIndex((s) => s.id === currentStep)
  ).map((s) => s.id);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Progress Bar */}
      <div>
        <div className="mb-4 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <StepIndicator
          steps={WIZARD_STEPS}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={(stepId) => {
            const stepIndex = WIZARD_STEPS.findIndex((s) => s.id === stepId);
            const currentIndex = WIZARD_STEPS.findIndex((s) => s.id === currentStep);
            if (stepIndex <= currentIndex) {
              goToStep(stepId as WizardStep);
            }
          }}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {WIZARD_STEPS.find((s) => s.id === currentStep)?.name}
              </CardTitle>
              <CardDescription>
                {getStepDescription(currentStep)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentStep === 'event-details' && (
                <InlineEventDetailsForm
                  values={eventDetails}
                  onChange={setEventDetails}
                />
              )}

              {currentStep === 'breakfast' && (
                <BreakfastSelector
                  selected={breakfast}
                  headCount={eventDetails.headCount || 10}
                  onSelect={setBreakfast}
                />
              )}

              {currentStep === 'lunch' && (
                <LunchSetupStep headCount={eventDetails.headCount || 10} />
              )}

              {currentStep === 'snacks-drinks' && (
                <SnackPackageSelector
                  selected={snacks}
                  headCount={eventDetails.headCount || 10}
                  onSelect={setSnacks}
                />
              )}

              {currentStep === 'delivery' && (
                <DeliveryForm
                  values={delivery}
                  onChange={setDelivery}
                />
              )}

              {currentStep === 'payment' && (
                <PaymentForm
                  orderId={searchParams.get('orderId') || undefined}
                  amount={calculateTotal()}
                />
              )}

              {error && (
                <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={goToPreviousStep}
              disabled={isFirstStep}
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
            >
              {isSubmitting && <ButtonLoader />}
              {isLastStep ? 'Complete Order' : 'Continue'}
            </Button>
          </div>
        </div>

        {/* Sidebar - Order Summary */}
        <div className="lg:col-span-1">
          <OrderSummary
            order={{
              eventDetails: eventDetails as EventDetails,
              breakfast: breakfast?.packageType ? breakfast as import('@/contracts/types').BreakfastSelection : undefined,
              snacks: snacks?.packageType ? snacks as import('@/contracts/types').SnackSelection : undefined,
              lunchSelections: [],
            }}
            showDetails={true}
          />
        </div>
      </div>
    </div>
  );

  function calculateTotal() {
    let subtotal = 0;

    if (breakfast) {
      const prices = { continental: 12.99, hot: 18.99, premium: 24.99 };
      subtotal += prices[breakfast.packageType as keyof typeof prices] * (breakfast.headCount || 0);
    }

    if (snacks) {
      const prices = { basic: 6.99, premium: 12.99, custom: 15.99 };
      subtotal += prices[snacks.packageType as keyof typeof prices] * (eventDetails.headCount || 0);
    }

    const tax = subtotal * 0.0825;
    return subtotal + tax + 25; // + delivery fee
  }
}

function LunchSetupStep({ headCount }: { headCount: number }) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        After placing your order, you&apos;ll receive a shareable link to send to your
        {headCount} attendees. Each person can select their own lunch from our menu.
      </p>

      <div className="rounded-lg border bg-muted/50 p-4">
        <h4 className="font-medium">How it works:</h4>
        <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-muted-foreground">
          <li>Complete your order and payment</li>
          <li>Get a unique shareable link</li>
          <li>Send the link to your attendees</li>
          <li>They select their preferred lunch option</li>
          <li>We prepare individual meals based on selections</li>
        </ol>
      </div>

      <p className="text-sm text-muted-foreground">
        Selections must be made 48 hours before the event date.
      </p>
    </div>
  );
}

function getStepDescription(step: string): string {
  const descriptions: Record<string, string> = {
    'event-details': 'Tell us about your event and who to contact',
    breakfast: 'Choose a breakfast package for your team (optional)',
    lunch: 'Set up individual lunch selections for attendees',
    'snacks-drinks': 'Add snacks and beverages (optional)',
    delivery: 'Enter the delivery address and preferred time',
    payment: 'Review your order and complete payment',
  };
  return descriptions[step] || '';
}

// Inline Event Details Form Component
function InlineEventDetailsForm({
  values,
  onChange,
}: {
  values: Partial<EventDetails>;
  onChange: (values: Partial<EventDetails>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Event Name *</label>
        <input
          type="text"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={values.eventName || ''}
          onChange={(e) => onChange({ ...values, eventName: e.target.value })}
          placeholder="Q1 Team Meeting"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Event Date *</label>
          <input
            type="date"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={values.eventDate ? new Date(values.eventDate).toISOString().split('T')[0] : ''}
            onChange={(e) => onChange({ ...values, eventDate: new Date(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Event Time *</label>
          <input
            type="time"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={values.eventTime || ''}
            onChange={(e) => onChange({ ...values, eventTime: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Number of People *</label>
        <input
          type="number"
          min="10"
          max="500"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={values.headCount || ''}
          onChange={(e) => onChange({ ...values, headCount: parseInt(e.target.value) || 0 })}
          placeholder="25"
        />
        <p className="text-xs text-muted-foreground">Minimum 10 people</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Company Name</label>
        <input
          type="text"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={values.companyName || ''}
          onChange={(e) => onChange({ ...values, companyName: e.target.value })}
          placeholder="Acme Corp"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Contact Name *</label>
          <input
            type="text"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={values.contactName || ''}
            onChange={(e) => onChange({ ...values, contactName: e.target.value })}
            placeholder="John Smith"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Contact Phone *</label>
          <input
            type="tel"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={values.contactPhone || ''}
            onChange={(e) => onChange({ ...values, contactPhone: e.target.value })}
            placeholder="(512) 555-1234"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Contact Email *</label>
        <input
          type="email"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={values.contactEmail || ''}
          onChange={(e) => onChange({ ...values, contactEmail: e.target.value })}
          placeholder="john@acme.com"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Special Requests</label>
        <textarea
          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={values.specialRequests || ''}
          onChange={(e) => onChange({ ...values, specialRequests: e.target.value })}
          placeholder="Any special requirements or notes..."
        />
      </div>
    </div>
  );
}
