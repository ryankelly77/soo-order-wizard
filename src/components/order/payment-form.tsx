'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner, ButtonLoader } from '@/components/shared/loading-spinner';
import { formatCurrency } from '@/lib/utils/format';
import { usePayment } from '@/features/payments';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface PaymentFormProps {
  orderId?: string;
  amount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function PaymentForm({ orderId, amount, onSuccess, onError }: PaymentFormProps) {
  const { clientSecret, isLoading, error, initializePayment } = usePayment({
    orderId: orderId || '',
    amount,
  });

  useEffect(() => {
    if (orderId && amount > 0) {
      initializePayment();
    }
  }, [orderId, amount, initializePayment]);

  if (!orderId) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            Complete previous steps to proceed to payment.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !clientSecret) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-destructive">{error}</p>
          <Button onClick={initializePayment} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#0f172a',
            colorBackground: '#ffffff',
            colorText: '#1e293b',
            fontFamily: 'Montserrat, system-ui, sans-serif',
            borderRadius: '8px',
          },
        },
      }}
    >
      <CheckoutForm
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}

function CheckoutForm({
  amount,
  onSuccess,
  onError,
}: {
  amount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message);
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (paymentIntent?.status === 'succeeded') {
        onSuccess?.();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed';
      setError(message);
      onError?.(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>
            Enter your payment information to complete your order.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement
              options={{
                layout: 'tabs',
              }}
            />

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(amount)}</p>
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={!stripe || isProcessing}
              >
                {isProcessing && <ButtonLoader />}
                {isProcessing ? 'Processing...' : `Pay ${formatCurrency(amount)}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="rounded-lg border bg-muted/50 p-4">
        <div className="flex items-start gap-3">
          <LockIcon className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium">Secure Payment</p>
            <p className="text-sm text-muted-foreground">
              Your payment information is encrypted and secure. We never store your
              full card details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
