'use client';

import { ReactNode } from 'react';

interface WizardFooterProps {
  onPrevious?: () => void;
  onNext?: () => void;
  previousLabel?: string;
  nextLabel?: string;
  currentStep?: number;
  totalSteps?: number;
  showPrevious?: boolean;
  showNext?: boolean;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
  customNextButton?: ReactNode;
  // Total-only display (simplified)
  subtotal?: number;
  // Legacy props (kept for backwards compatibility but not used)
  attendeeCount?: number;
}

export function WizardFooter({
  onPrevious,
  onNext,
  previousLabel = 'Previous',
  nextLabel = 'Continue',
  currentStep = 1,
  totalSteps = 6,
  showPrevious = true,
  showNext = true,
  previousDisabled = false,
  nextDisabled = false,
  customNextButton,
  attendeeCount,
  subtotal,
}: WizardFooterProps) {
  return (
    <footer className="wizard-footer">
      <div className="container">
        {/* Previous Button */}
        {showPrevious ? (
          <button
            className="btn btn-ghost"
            onClick={onPrevious}
            disabled={previousDisabled}
          >
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {previousLabel}
          </button>
        ) : (
          <div className="footer-spacer" />
        )}

        {/* Center Content: Subtotal only */}
        {subtotal !== undefined ? (
          <div className="footer-total">
            <span className="footer-total-label">Subtotal</span>
            <span className="footer-total-value">${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        ) : (
          <div className="footer-step-indicator">
            <span className="footer-step-label">Step</span>
            <span className="footer-step-current">{currentStep} of {totalSteps}</span>
          </div>
        )}

        {/* Next Button */}
        {customNextButton
          ? customNextButton
          : showNext && (
              <button
                className="btn btn-primary"
                onClick={onNext}
                disabled={nextDisabled}
              >
                {nextLabel}
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
      </div>
    </footer>
  );
}

// Payment footer variant with total amount
interface PaymentFooterProps {
  onPrevious?: () => void;
  onSubmit?: () => void;
  previousLabel?: string;
  submitLabel?: string;
  totalAmount: string;
  isSubmitting?: boolean;
}

export function PaymentFooter({
  onPrevious,
  onSubmit,
  previousLabel = 'Previous',
  submitLabel = 'Place Order',
  totalAmount,
  isSubmitting = false,
}: PaymentFooterProps) {
  return (
    <footer className="wizard-footer">
      <div className="container">
        {onPrevious ? (
          <button className="btn btn-ghost" onClick={onPrevious}>
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {previousLabel}
          </button>
        ) : (
          <div className="footer-spacer" />
        )}

        <div className="footer-total">
          <span className="footer-total-label">Order Total</span>
          <span className="footer-total-value">{totalAmount}</span>
        </div>

        <button
          className="btn btn-primary btn-large"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          {submitLabel} — {totalAmount}
        </button>
      </div>
    </footer>
  );
}
