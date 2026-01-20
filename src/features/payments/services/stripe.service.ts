import { stripe, formatAmountForStripe } from '@/lib/stripe/client';
import { createClient } from '@/lib/supabase/client';

export async function createPaymentIntent(orderId: string, amount: number) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: formatAmountForStripe(amount),
    currency: 'usd',
    metadata: {
      orderId,
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  // Store the payment intent ID in the database
  const supabase = createClient();
  await supabase
    .from('orders')
    .update({
      stripe_payment_intent_id: paymentIntent.id,
    })
    .eq('id', orderId);

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
}

export async function confirmPayment(paymentIntentId: string) {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status === 'succeeded') {
    const orderId = paymentIntent.metadata.orderId;

    // Update order status
    const supabase = createClient();
    await supabase
      .from('orders')
      .update({
        status: 'confirmed',
        payment: {
          method: 'card',
          stripePaymentIntentId: paymentIntentId,
          paidAt: new Date().toISOString(),
        },
      })
      .eq('id', orderId);
  }

  return {
    status: paymentIntent.status,
  };
}

export async function getPaymentIntent(paymentIntentId: string) {
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

export async function cancelPaymentIntent(paymentIntentId: string) {
  return stripe.paymentIntents.cancel(paymentIntentId);
}

export async function createRefund(paymentIntentId: string, amount?: number) {
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? formatAmountForStripe(amount) : undefined,
  });
}
