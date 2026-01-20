'use client';

import { cn } from '@/lib/utils/cn';

export interface WizardStep {
  id: string;
  name: string;
  number: number;
}

// Default 6-step wizard for order creation
export const ORDER_WIZARD_STEPS: WizardStep[] = [
  { id: 'event-details', name: 'Event Details', number: 1 },
  { id: 'breakfast', name: 'Breakfast', number: 2 },
  { id: 'lunch', name: 'Lunch', number: 3 },
  { id: 'snacks-drinks', name: 'Snacks & Drinks', number: 4 },
  { id: 'delivery', name: 'Delivery', number: 5 },
  { id: 'payment', name: 'Payment', number: 6 },
];

interface WizardStepIndicatorProps {
  steps?: WizardStep[];
  currentStep: string;
  completedSteps?: string[];
  onStepClick?: (stepId: string) => void;
}

export function WizardStepIndicator({
  steps = ORDER_WIZARD_STEPS,
  currentStep,
  completedSteps = [],
  onStepClick,
}: WizardStepIndicatorProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="wizard-progress">
      <div className="container">
        <div className="step-indicator">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = step.id === currentStep;
            const isClickable =
              onStepClick && (isCompleted || index <= currentIndex);

            return (
              <div
                key={step.id}
                className={cn(
                  'step-item',
                  isCurrent && 'active',
                  isCompleted && 'complete'
                )}
                onClick={() => isClickable && onStepClick?.(step.id)}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onKeyDown={(e) => {
                  if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onStepClick?.(step.id);
                  }
                }}
                style={{ cursor: isClickable ? 'pointer' : 'default' }}
              >
                <div className="step-circle">
                  {isCompleted ? '✓' : step.number}
                </div>
                <span className="step-label">{step.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Legacy component for backward compatibility
interface Step {
  id: string;
  name: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: string;
  completedSteps?: string[];
  onStepClick?: (stepId: string) => void;
}

export function StepIndicator({
  steps,
  currentStep,
  completedSteps = [],
  onStepClick,
}: StepIndicatorProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <nav aria-label="Progress">
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          const isClickable =
            onStepClick && (isCompleted || index <= currentIndex);

          return (
            <li
              key={step.id}
              className={cn(
                'relative',
                index !== steps.length - 1 && 'pr-8 sm:pr-20'
              )}
            >
              {/* Connector line */}
              {index !== steps.length - 1 && (
                <div
                  className="absolute left-0 top-4 hidden h-0.5 w-full sm:block"
                  aria-hidden="true"
                >
                  <div
                    className={cn(
                      'h-full',
                      isCompleted ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                </div>
              )}

              <button
                type="button"
                className={cn(
                  'group relative flex items-center',
                  isClickable ? 'cursor-pointer' : 'cursor-default'
                )}
                onClick={() => isClickable && onStepClick?.(step.id)}
                disabled={!isClickable}
              >
                <span className="flex h-9 items-center" aria-hidden="true">
                  <span
                    className={cn(
                      'relative z-10 flex h-8 w-8 items-center justify-content rounded-full text-sm font-medium',
                      isCompleted
                        ? 'bg-primary text-primary-foreground'
                        : isCurrent
                          ? 'border-2 border-primary bg-background text-primary'
                          : 'border-2 border-muted bg-background text-muted-foreground'
                    )}
                  >
                    {isCompleted ? <CheckIcon className="h-4 w-4" /> : index + 1}
                  </span>
                </span>
                <span className="ml-3 hidden text-sm font-medium sm:block">
                  <span
                    className={cn(
                      isCurrent
                        ? 'text-primary'
                        : isCompleted
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                    )}
                  >
                    {step.name}
                  </span>
                  {step.description && (
                    <span className="block text-xs text-muted-foreground">
                      {step.description}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
    >
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
