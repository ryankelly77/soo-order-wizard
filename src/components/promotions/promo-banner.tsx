'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import type { Promotion } from '@/contracts/types';

interface PromoBannerProps {
  promotion: Promotion;
  onDismiss?: () => void;
  className?: string;
}

export function PromoBanner({
  promotion,
  onDismiss,
  className,
}: PromoBannerProps) {
  const [copied, setCopied] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promotion.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = promotion.code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const getDiscountDisplay = () => {
    switch (promotion.type) {
      case 'percentage':
        return `${promotion.value}% OFF`;
      case 'fixed_amount':
        return `$${promotion.value} OFF`;
      case 'free_item':
        return 'FREE ITEM';
      case 'free_delivery':
        return 'FREE DELIVERY';
      default:
        return 'SPECIAL OFFER';
    }
  };

  const daysUntilExpiry = promotion.validUntil
    ? Math.ceil(
        (new Date(promotion.validUntil).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-2 border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5',
        className
      )}
    >
      {/* Decorative elements */}
      <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
      <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />

      {/* Dismiss button */}
      {onDismiss && (
        <button
          onClick={handleDismiss}
          className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Dismiss"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      )}

      <CardContent className="relative p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          {/* Gift Icon */}
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-primary/20">
            <GiftIcon className="h-8 w-8 text-primary" />
          </div>

          {/* Content */}
          <div className="flex-1 text-center sm:text-left">
            <div className="mb-1 flex items-center justify-center gap-2 sm:justify-start">
              <span className="rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
                {getDiscountDisplay()}
              </span>
              {daysUntilExpiry && daysUntilExpiry <= 3 && (
                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                  Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            <h3 className="text-lg font-semibold">{promotion.description}</h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Thank you for your order! Use this code on your next order.
              {promotion.minimumOrderAmount && (
                <span> Minimum order: ${promotion.minimumOrderAmount}</span>
              )}
            </p>

            {/* Promo Code */}
            <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row">
              <div className="flex items-center gap-2 rounded-lg border-2 border-dashed border-primary/40 bg-white px-4 py-2">
                <span className="font-mono text-lg font-bold tracking-wider text-primary">
                  {promotion.code}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className={cn(
                  'min-w-[100px] transition-all',
                  copied && 'bg-green-50 text-green-700 border-green-200'
                )}
              >
                {copied ? (
                  <>
                    <CheckIcon className="mr-1 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <CopyIcon className="mr-1 h-4 w-4" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GiftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        d="M20 12v10H4V12M2 7h20v5H2V7zM12 22V7M12 7H7.5a2.5 2.5 0 110-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 100-5C13 2 12 7 12 7z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        d="M8 4v12a2 2 0 002 2h8a2 2 0 002-2V7.242a2 2 0 00-.602-1.43L16.083 2.57A2 2 0 0014.685 2H10a2 2 0 00-2 2z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 18v2a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
