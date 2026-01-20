'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  useOrderWizardStore,
  WIZARD_STEPS,
  getStepIndex,
  type WizardStep,
} from '@/stores/order-wizard.store';
import { WizardHeader } from '@/components/layout/header';
import { WizardStepIndicator } from '@/components/layout/step-indicator';
import { WizardFooter } from '@/components/layout/wizard-footer';
import { CheckoutOptions } from '@/components/order/checkout-options';
import { EventDetailsForm } from '@/components/order/event-details-form';
import { BreakfastSelector } from '@/components/order/breakfast-selector';
import { LunchSelector } from '@/components/order/lunch-selector';
import { SnacksSelector } from '@/components/order/snacks-selector';
import { FloatingOrderSummary } from '@/components/order/floating-order-summary';
import { DeliveryForm } from '@/components/order/delivery-form';

export default function NewOrderPage() {
  return (
    <Suspense fallback={<div className="wizard-layout"><div className="loading-spinner" /></div>}>
      <NewOrderPageContent />
    </Suspense>
  );
}

function NewOrderPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    currentStep,
    setCurrentStep,
    eventDetails,
  } = useOrderWizardStore();

  const [completedSteps, setCompletedSteps] = useState<WizardStep[]>([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Handle step from URL query parameter
  useEffect(() => {
    const stepParam = searchParams.get('step');
    if (stepParam && WIZARD_STEPS.some((s) => s.id === stepParam)) {
      setCurrentStep(stepParam as WizardStep);
    }
  }, [searchParams, setCurrentStep]);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  const currentStepIndex = getStepIndex(currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === WIZARD_STEPS.length - 1;

  // Navigate to next step or place order
  const goToNextStep = () => {
    if (isLastStep) {
      // Place order and redirect to confirmation
      router.push('/order/confirmation');
    } else if (currentStepIndex < WIZARD_STEPS.length - 1) {
      const nextStep = WIZARD_STEPS[currentStepIndex + 1].id;
      setCompletedSteps((prev) =>
        prev.includes(currentStep) ? prev : [...prev, currentStep]
      );
      setCurrentStep(nextStep);
    }
  };

  // Navigate to previous step
  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      const prevStep = WIZARD_STEPS[currentStepIndex - 1].id;
      setCurrentStep(prevStep);
    }
  };

  // Handle save draft
  const handleSaveDraft = () => {
    // TODO: Save order as draft to database
    alert('Draft saved! You can continue later.');
  };

  // Handle exit wizard
  const handleExit = () => {
    if (
      confirm(
        'Are you sure you want to exit? Your progress will be saved as a draft.'
      )
    ) {
      router.push('/');
    }
  };

  // Get step title and description
  const getStepContent = () => {
    switch (currentStep) {
      case 'event-details':
        return {
          title: 'Event Details',
          description:
            'Tell us about your upcoming event so we can help you plan\nthe perfect catering experience.',
        };
      case 'breakfast':
        return {
          title: 'Breakfast',
          description:
            'Start your event right with our delicious breakfast packages.',
        };
      case 'lunch':
        return {
          title: 'Lunch Selections',
          description:
            'Add your attendees below. After completing your order, each person will receive a link to select their personalized lunch preferences.',
        };
      case 'snacks-drinks':
        return {
          title: 'Snacks & Drinks',
          description:
            'Keep your team energized throughout the day with artisanal snacks and refreshing beverages.',
        };
      case 'delivery':
        return {
          title: 'Delivery Details',
          description:
            'Let us know where and when to deliver your catering order.',
        };
      case 'payment':
        return {
          title: 'Complete Your Order',
          description:
            'Review your order and enter payment details to confirm your catering reservation.',
        };
      default:
        return { title: '', description: '' };
    }
  };

  const { title, description } = getStepContent();

  // Calculate subtotal (placeholder)
  const subtotal = 968.2; // TODO: Calculate from actual selections

  return (
    <div className="wizard-layout">
      {/* Header */}
      <WizardHeader onSaveDraft={handleSaveDraft} onExit={handleExit} />

      {/* Progress Indicator */}
      <WizardStepIndicator
        steps={WIZARD_STEPS}
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={(stepId) => {
          const stepIndex = getStepIndex(stepId as WizardStep);
          if (stepIndex <= currentStepIndex || completedSteps.includes(stepId as WizardStep)) {
            setCurrentStep(stepId as WizardStep);
          }
        }}
      />

      {/* Main Content */}
      <main className="wizard-content">
        <div className="container">
          <div className="page-header">
            <h1>{title}</h1>
            <p>{description}</p>
          </div>

          {/* Step Content */}
          {currentStep === 'event-details' && <EventDetailsStep />}
          {currentStep === 'breakfast' && <BreakfastStep />}
          {currentStep === 'lunch' && <LunchStep />}
          {currentStep === 'snacks-drinks' && <SnacksDrinksStep />}
          {currentStep === 'delivery' && <DeliveryStep />}
          {currentStep === 'payment' && (
            <PaymentStep
              showPaymentForm={showPaymentForm}
              setShowPaymentForm={setShowPaymentForm}
              subtotal={subtotal}
            />
          )}

          {/* Floating Order Summary for selection steps */}
          {(currentStep === 'breakfast' || currentStep === 'lunch' || currentStep === 'snacks-drinks') && (
            <SelectionStepSummary />
          )}
        </div>
      </main>

      {/* Footer Navigation */}
      <WizardFooter
        onPrevious={goToPreviousStep}
        onNext={goToNextStep}
        showPrevious={true}
        previousDisabled={isFirstStep}
        currentStep={currentStepIndex + 1}
        totalSteps={WIZARD_STEPS.length}
        attendeeCount={eventDetails.headCount || 12}
        subtotal={subtotal}
        nextLabel={
          isLastStep
            ? 'Place Order'
            : currentStep === 'delivery'
              ? 'Continue to Checkout'
              : `Continue to ${WIZARD_STEPS[currentStepIndex + 1]?.name || 'Next'}`
        }
      />
    </div>
  );
}

// Event Details Step
function EventDetailsStep() {
  const { eventDetails, setEventDetails } = useOrderWizardStore();

  return (
    <EventDetailsForm
      values={eventDetails}
      onChange={(newValues) => setEventDetails(newValues)}
    />
  );
}

// Breakfast Step
function BreakfastStep() {
  const { breakfast, setBreakfast, eventDetails } = useOrderWizardStore();

  return (
    <BreakfastSelector
      selected={breakfast}
      headCount={eventDetails.headCount || 12}
      onSelect={setBreakfast}
    />
  );
}

// Lunch Step
function LunchStep() {
  const { eventDetails } = useOrderWizardStore();
  const [lunchSelection, setLunchSelection] = useState<{ optionId: string; headCount: number } | null>(null);

  return (
    <LunchSelector
      headCount={eventDetails.headCount || 12}
      selected={lunchSelection}
      onSelect={setLunchSelection}
    />
  );
}

// Snacks & Drinks Step
function SnacksDrinksStep() {
  const { setSnacks, eventDetails } = useOrderWizardStore();
  const [snacksSelection, setSnacksSelection] = useState({
    snackPackages: [] as string[],
    beveragePackages: [] as string[],
    skipSnacks: false,
    skipBeverages: false,
  });

  const handleSelect = (selection: {
    snackPackages: string[];
    beveragePackages: string[];
    skipSnacks: boolean;
    skipBeverages: boolean;
  }) => {
    setSnacksSelection(selection);
    // Update store with the selection
    if (selection.snackPackages.length > 0 || selection.beveragePackages.length > 0) {
      setSnacks({
        packageType: selection.snackPackages[0] as 'basic' | 'premium' | 'custom' || 'basic',
        items: [],
      });
    } else {
      setSnacks(null);
    }
  };

  return (
    <SnacksSelector
      headCount={eventDetails.headCount || 12}
      onSelect={handleSelect}
      selected={snacksSelection}
    />
  );
}

// Delivery Step
function DeliveryStep() {
  const { delivery, setDelivery, eventDetails, breakfast } = useOrderWizardStore();

  // Determine what meals are selected
  const hasBreakfast = !!breakfast?.packageType;
  const hasLunch = true; // Lunch is always part of the catering flow

  return (
    <div className="delivery-layout">
      <div className="form-column">
        <DeliveryForm
          values={delivery}
          onChange={(newValues) => setDelivery(newValues)}
          eventTime={eventDetails.eventTime || '9:00 AM'}
          hasBreakfast={hasBreakfast}
          hasLunch={hasLunch}
        />
      </div>

      <div className="summary-column">
        <DeliverySummaryCard />
      </div>
    </div>
  );
}

// Delivery Summary Card with delivery info
function DeliverySummaryCard() {
  const { eventDetails, breakfast } = useOrderWizardStore();

  // Format currency with commas
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Calculate subtotal
  const breakfastPrice = breakfast?.packageType
    ? { continental: 18.95, hot: 32.95, premium: 26.95 }[breakfast.packageType] || 0
    : 0;
  const headCount = eventDetails.headCount || 12;
  const breakfastTotal = breakfastPrice * headCount;
  const lunchTotal = headCount * 24.95; // Average lunch price
  const snacksTotal = 89.0; // Placeholder
  const beveragesTotal = 65.0; // Placeholder

  const subtotal = breakfastTotal + lunchTotal + snacksTotal + beveragesTotal;
  const tax = subtotal * 0.0825;
  const total = subtotal + tax;
  const isFreeDelivery = subtotal >= 500;

  return (
    <div className="order-summary-card">
      <h3 className="summary-title">Order Summary</h3>

      <div className="summary-event">
        <div className="summary-event-icon">📅</div>
        <div className="summary-event-info">
          <h4>{eventDetails.eventName || 'Your Event'}</h4>
          <p>
            {eventDetails.eventDate
              ? new Date(eventDetails.eventDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Date TBD'}{' '}
            • {headCount} attendees
          </p>
        </div>
      </div>

      <div className="summary-items">
        {breakfast?.packageType && (
          <div className="summary-item">
            <span className="summary-item-name">
              {breakfast.packageType === 'hot' ? 'Executive Brunch' :
               breakfast.packageType === 'continental' ? 'Continental Classic' :
               'Health & Vitality'} × {headCount}
            </span>
            <span className="summary-item-price">${formatCurrency(breakfastTotal)}</span>
          </div>
        )}
        <div className="summary-item">
          <span className="summary-item-name">Lunch Selections × {headCount}</span>
          <span className="summary-item-price">${formatCurrency(lunchTotal)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-item-name">Premium Snack Spread</span>
          <span className="summary-item-price">${formatCurrency(snacksTotal)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-item-name">Craft Beverages</span>
          <span className="summary-item-price">${formatCurrency(beveragesTotal)}</span>
        </div>
      </div>

      <div className="summary-subtotal">
        <span>Subtotal</span>
        <span>${formatCurrency(subtotal)}</span>
      </div>

      <div className={`summary-delivery ${isFreeDelivery ? 'free' : ''}`}>
        <span>Delivery</span>
        <span>{isFreeDelivery ? 'FREE' : '$25.00'}</span>
      </div>

      <div className="summary-tax">
        <span>Estimated Tax</span>
        <span>${formatCurrency(tax)}</span>
      </div>

      <div className="summary-total">
        <span>Total</span>
        <span className="amount">${formatCurrency(total)}</span>
      </div>

      {isFreeDelivery && (
        <div className="delivery-info-card">
          <div className="delivery-info-header">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h4>Free Delivery</h4>
          </div>
          <p>Orders over $500 qualify for complimentary delivery. Your order qualifies!</p>
        </div>
      )}
    </div>
  );
}

// Payment Step
interface PaymentStepProps {
  showPaymentForm: boolean;
  setShowPaymentForm: (show: boolean) => void;
  subtotal: number;
}

function PaymentStep({
  showPaymentForm,
  setShowPaymentForm,
  subtotal,
}: PaymentStepProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple'>('card');
  const [useSavedCard, setUseSavedCard] = useState(true);
  const [useSameBillingAddress, setUseSameBillingAddress] = useState(true);
  const [promoCode, setPromoCode] = useState('');

  if (!showPaymentForm) {
    return (
      <div className="payment-layout">
        <div className="form-column">
          <CheckoutOptions
            subtotal={subtotal}
            onContinue={() => setShowPaymentForm(true)}
          />
        </div>
        <div className="summary-column">
          <PaymentSummaryCard />
        </div>
      </div>
    );
  }

  return (
    <div className="payment-layout">
      <div className="form-column">
        {/* Payment Method Card */}
        <div className="form-card">
          <div className="form-section">
            <h3 className="form-section-title">Payment Method</h3>

            <div className="payment-methods">
              <div
                className={`payment-method ${paymentMethod === 'card' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <span className="payment-method-icon">💳</span>
                <span className="payment-method-label">Credit Card</span>
                <span className="payment-method-desc">Visa, Mastercard, Amex</span>
              </div>
              <div
                className={`payment-method ${paymentMethod === 'apple' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('apple')}
              >
                <svg className="apple-pay-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <span className="payment-method-label">Apple Pay</span>
                <span className="payment-method-desc">Quick checkout</span>
              </div>
            </div>

            {paymentMethod === 'card' && (
              <>
                {/* Saved Card Option */}
                <div
                  className={`saved-card-option ${useSavedCard ? 'selected' : ''}`}
                  onClick={() => setUseSavedCard(true)}
                >
                  <div className="saved-card-radio"></div>
                  <div className="saved-card-content">
                    <div className="saved-card-brand">VISA</div>
                    <div className="saved-card-info">
                      <div className="saved-card-number">•••• •••• •••• 4242</div>
                      <div className="saved-card-exp">Expires 08/27</div>
                    </div>
                  </div>
                </div>

                <div className="or-divider">or use a different card</div>

                <div className="form-group">
                  <label className="form-label">
                    Cardholder Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Name as it appears on card"
                    onClick={() => setUseSavedCard(false)}
                  />
                </div>

                <div className="form-group card-input-group">
                  <label className="form-label">
                    Card Number <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="1234 5678 9012 3456"
                    onClick={() => setUseSavedCard(false)}
                  />
                  <div className="card-icons">
                    <span className="card-icon">VISA</span>
                    <span className="card-icon">MC</span>
                    <span className="card-icon">AMEX</span>
                  </div>
                </div>

                <div className="form-row three-col">
                  <div className="form-group">
                    <label className="form-label">
                      Expiry Month <span className="required">*</span>
                    </label>
                    <select className="form-input form-select" onClick={() => setUseSavedCard(false)}>
                      <option value="">MM</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                          {String(i + 1).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Expiry Year <span className="required">*</span>
                    </label>
                    <select className="form-input form-select" onClick={() => setUseSavedCard(false)}>
                      <option value="">YYYY</option>
                      {Array.from({ length: 10 }, (_, i) => (
                        <option key={i} value={2026 + i}>
                          {2026 + i}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      CVV <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="123"
                      maxLength={4}
                      onClick={() => setUseSavedCard(false)}
                    />
                  </div>
                </div>

                <div className="security-badge">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span className="security-badge-text">
                    <strong>Secure Payment</strong> — Your card information is
                    encrypted with 256-bit SSL
                  </span>
                </div>
              </>
            )}

            {paymentMethod === 'apple' && (
              <div className="apple-pay-section">
                <button className="apple-pay-btn" type="button">
                  <svg width="20" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Pay
                </button>
                <p className="apple-pay-info">Complete your purchase securely with Apple Pay</p>
              </div>
            )}
          </div>
        </div>

        {/* Billing Address Card */}
        {paymentMethod === 'card' && (
          <div className="form-card">
            <div className="form-section">
              <h3 className="form-section-title">Billing Address</h3>

              <div
                className={`saved-card-option ${useSameBillingAddress ? 'selected' : ''}`}
                onClick={() => setUseSameBillingAddress(true)}
                style={{ marginBottom: 0 }}
              >
                <div className="saved-card-radio"></div>
                <div className="saved-card-content">
                  <div className="saved-card-info" style={{ marginLeft: 0 }}>
                    <div className="saved-card-number">Same as delivery address</div>
                    <div className="saved-card-exp">312 Pearl Parkway, Suite 500, San Antonio, TX 78215</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Promo Code Card */}
        <div className="form-card">
          <div className="form-section">
            <h3 className="form-section-title">Promo Code</h3>

            <div className="promo-section">
              <div className="form-group">
                <label className="form-label">Have a promo code?</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
              </div>
              <button className="btn-apply">Apply</button>
            </div>
          </div>
        </div>
      </div>

      <div className="summary-column">
        <PaymentSummaryCard showTerms />
      </div>
    </div>
  );
}

// Payment Summary Card component (for payment step)
function PaymentSummaryCard({ showTerms = false }: { showTerms?: boolean }) {
  const { eventDetails, delivery } = useOrderWizardStore();
  const [showDetails, setShowDetails] = useState(false);
  const [showGratuityPopup, setShowGratuityPopup] = useState(false);
  const [gratuityPercent, setGratuityPercent] = useState<number | 'custom'>(18);
  const [customGratuity, setCustomGratuity] = useState('');

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Date TBD';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Format currency with commas
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Calculations
  const subtotal = 968.20;
  const serviceFee = subtotal * 0.18;
  const gratuityAmount = gratuityPercent === 'custom'
    ? parseFloat(customGratuity) || 0
    : subtotal * (gratuityPercent / 100);
  const tax = subtotal * 0.0825;
  const total = subtotal + serviceFee + gratuityAmount + tax;

  const handleGratuitySelect = (percent: number | 'custom') => {
    setGratuityPercent(percent);
    if (percent !== 'custom') {
      setShowGratuityPopup(false);
    }
  };

  const handleCustomGratuitySubmit = () => {
    if (customGratuity && parseFloat(customGratuity) >= 0) {
      setShowGratuityPopup(false);
    }
  };

  return (
    <div className="order-summary-card">
      <h3 className="summary-title">Order Summary</h3>

      <div className="summary-event">
        <div className="summary-event-icon">📅</div>
        <div className="summary-event-info">
          <h4>{eventDetails.eventName || 'Your Event'}</h4>
          <p>
            {formatDate(eventDetails.eventDate)} • {eventDetails.headCount || 0} attendees
          </p>
        </div>
      </div>

      {/* Delivery Details */}
      <div className="summary-details">
        <div className="summary-detail-row">
          <span className="summary-detail-label">Delivery Date</span>
          <span className="summary-detail-value">{formatDate(eventDetails.eventDate)}</span>
        </div>
        <div className="summary-detail-row">
          <span className="summary-detail-label">Delivery Time</span>
          <span className="summary-detail-value">{delivery.preferredDeliveryTime || '8:00 AM'}</span>
        </div>
        <div className="summary-detail-row">
          <span className="summary-detail-label">Location</span>
          <span className="summary-detail-value">{delivery.address || '312 Pearl Parkway'}</span>
        </div>
      </div>

      <div className="summary-items">
        <div className="summary-items-header">
          <span className="summary-items-title">Order Items</span>
          <button className="summary-items-toggle" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? 'Hide Details' : 'View Details'}
          </button>
        </div>
        {showDetails && (
          <>
            <div className="summary-item">
              <span className="summary-item-name">Executive Brunch × 12</span>
              <span className="summary-item-price">$395.40</span>
            </div>
            <div className="summary-item">
              <span className="summary-item-name">Espresso Bar × 12</span>
              <span className="summary-item-price">$59.40</span>
            </div>
            <div className="summary-item">
              <span className="summary-item-name">Lunch Selections × 12</span>
              <span className="summary-item-price">$359.40</span>
            </div>
            <div className="summary-item">
              <span className="summary-item-name">Premium Snack Spread</span>
              <span className="summary-item-price">$89.00</span>
            </div>
            <div className="summary-item">
              <span className="summary-item-name">Craft Beverages</span>
              <span className="summary-item-price">$65.00</span>
            </div>
          </>
        )}
      </div>

      <div className="summary-calculations">
        <div className="summary-line">
          <span>Subtotal</span>
          <span>${formatCurrency(subtotal)}</span>
        </div>
        <div className="summary-line">
          <span>Delivery</span>
          <span>FREE</span>
        </div>
        <div className="summary-line">
          <span>Service Fee (18%)</span>
          <span>${formatCurrency(serviceFee)}</span>
        </div>
        <div className="summary-line gratuity-line">
          <span className="gratuity-label">
            Gratuity {gratuityPercent !== 'custom' ? `(${gratuityPercent}%)` : ''}
            <button
              className="gratuity-edit-btn"
              onClick={() => setShowGratuityPopup(!showGratuityPopup)}
            >
              Edit
            </button>
          </span>
          <span>${formatCurrency(gratuityAmount)}</span>
        </div>

        {/* Gratuity Popup */}
        {showGratuityPopup && (
          <>
            <div className="gratuity-overlay" onClick={() => setShowGratuityPopup(false)} />
            <div className="gratuity-popup">
              <div className="gratuity-popup-header">
                <span>Select Gratuity</span>
                <button
                  className="gratuity-popup-close"
                  onClick={() => setShowGratuityPopup(false)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              <div className="gratuity-options">
                {[15, 18, 20].map((percent) => (
                  <button
                    key={percent}
                    className={`gratuity-option ${gratuityPercent === percent ? 'selected' : ''}`}
                    onClick={() => handleGratuitySelect(percent)}
                  >
                    <span className="gratuity-option-percent">{percent}%</span>
                    <span className="gratuity-option-amount">${formatCurrency(subtotal * percent / 100)}</span>
                  </button>
                ))}
                <button
                  className={`gratuity-option ${gratuityPercent === 'custom' ? 'selected' : ''}`}
                  onClick={() => handleGratuitySelect('custom')}
                >
                  <span className="gratuity-option-percent">Custom</span>
                </button>
              </div>
              {gratuityPercent === 'custom' && (
                <div className="gratuity-custom-input">
                  <span className="gratuity-currency">$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={customGratuity}
                    onChange={(e) => setCustomGratuity(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                  <button
                    className="gratuity-custom-apply"
                    onClick={handleCustomGratuitySubmit}
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        <div className="summary-line">
          <span>Tax (8.25%)</span>
          <span>${formatCurrency(tax)}</span>
        </div>
      </div>

      <div className="summary-total">
        <span className="summary-total-label">Total</span>
        <span className="summary-total-amount">${formatCurrency(total)}</span>
      </div>

      {showTerms && (
        <div className="terms-checkbox">
          <input type="checkbox" id="terms" defaultChecked />
          <label htmlFor="terms">
            I agree to the <a href="#">Terms of Service</a> and{' '}
            <a href="#">Cancellation Policy</a>. I understand that orders
            cancelled within 24 hours of delivery may be subject to a fee.
          </label>
        </div>
      )}
    </div>
  );
}

// Floating Order Summary for Selection Steps
function SelectionStepSummary() {
  const { eventDetails, breakfast, snacks } = useOrderWizardStore();

  // Calculate prices based on selections
  const breakfastPrices: Record<string, number> = {
    continental: 18.95,
    hot: 32.95,
    premium: 26.95,
  };

  const headCount = eventDetails.headCount || 12;

  // Build sections dynamically based on selections
  const sections = [];

  // Breakfast section
  const breakfastItems = [];
  if (breakfast?.packageType) {
    const price = breakfastPrices[breakfast.packageType] || 0;
    const packageNames: Record<string, string> = {
      continental: 'Continental Classic',
      hot: 'Executive Brunch',
      premium: 'Health & Vitality',
    };
    breakfastItems.push({
      name: packageNames[breakfast.packageType] || breakfast.packageType,
      quantity: headCount,
      price: price * headCount,
    });
  }
  sections.push({ title: 'Breakfast', items: breakfastItems });

  // Lunch section (placeholder - would be calculated from actual selections)
  sections.push({
    title: 'Lunch',
    items: [
      { name: 'Individual Selections', quantity: headCount, price: headCount * 24.95 },
    ],
  });

  // Snacks section
  const snackItems = [];
  if (snacks?.packageType) {
    // Placeholder prices
    snackItems.push({
      name: snacks.packageType === 'premium' ? 'Premium Snack Spread' : 'Light & Healthy',
      price: snacks.packageType === 'premium' ? 89.00 : 65.00,
    });
  }
  sections.push({ title: 'Snacks & Drinks', items: snackItems });

  // Calculate subtotal
  const subtotal = sections.reduce(
    (total, section) => total + section.items.reduce((t, item) => t + item.price, 0),
    0
  );

  return (
    <FloatingOrderSummary
      eventName={eventDetails.eventName || 'Your Event'}
      eventDate={eventDetails.eventDate ? eventDetails.eventDate.toString() : undefined}
      headCount={headCount}
      sections={sections}
      subtotal={subtotal}
    />
  );
}
