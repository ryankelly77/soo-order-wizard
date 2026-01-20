import Stripe from 'stripe';

// Server-side Stripe client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// Stripe configuration
export const STRIPE_CONFIG = {
  currency: 'usd',
  paymentMethodTypes: ['card'] as const,
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#0f172a',
      colorBackground: '#ffffff',
      colorText: '#1e293b',
      colorDanger: '#dc2626',
      fontFamily: 'Montserrat, system-ui, sans-serif',
      borderRadius: '8px',
    },
  },
};

// Helper to format amount for Stripe (cents)
export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100);
}

// Helper to format amount from Stripe (dollars)
export function formatAmountFromStripe(amount: number): number {
  return amount / 100;
}
