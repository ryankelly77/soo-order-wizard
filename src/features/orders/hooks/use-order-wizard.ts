'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useOrderWizardStore } from '@/stores/order-wizard.store';
import * as orderService from '../services/order.service';

export type WizardStep =
  | 'event-details'
  | 'breakfast'
  | 'lunch'
  | 'snacks-drinks'
  | 'delivery'
  | 'payment';

const STEP_ORDER: WizardStep[] = [
  'event-details',
  'breakfast',
  'lunch',
  'snacks-drinks',
  'delivery',
  'payment',
];

export function useOrderWizard() {
  const router = useRouter();
  const store = useOrderWizardStore();

  const currentStepIndex = STEP_ORDER.indexOf(store.currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEP_ORDER.length - 1;
  const progress = ((currentStepIndex + 1) / STEP_ORDER.length) * 100;

  const goToStep = useCallback((step: WizardStep) => {
    store.setCurrentStep(step);
    router.push(`/new-order?step=${step}`);
  }, [router, store]);

  const goToNextStep = useCallback(() => {
    if (!isLastStep) {
      const nextStep = STEP_ORDER[currentStepIndex + 1];
      goToStep(nextStep);
    }
  }, [currentStepIndex, isLastStep, goToStep]);

  const goToPreviousStep = useCallback(() => {
    if (!isFirstStep) {
      const prevStep = STEP_ORDER[currentStepIndex - 1];
      goToStep(prevStep);
    }
  }, [currentStepIndex, isFirstStep, goToStep]);

  const submitOrder = useCallback(async () => {
    const orderData = store.getOrderData();

    try {
      const order = await orderService.createOrder(orderData);
      store.reset();
      router.push(`/orders/${order.id}`);
      return order;
    } catch (error) {
      throw error;
    }
  }, [router, store]);

  const canProceed = useCallback((): boolean => {
    const { eventDetails, delivery } = store;

    switch (store.currentStep) {
      case 'event-details':
        return !!(
          eventDetails.eventName &&
          eventDetails.eventDate &&
          eventDetails.eventTime &&
          (eventDetails.headCount ?? 0) >= 10 &&
          eventDetails.contactName &&
          eventDetails.contactEmail &&
          eventDetails.contactPhone
        );
      case 'breakfast':
        return true; // Optional step
      case 'lunch':
        return true; // Handled separately with share links
      case 'snacks-drinks':
        return true; // Optional step
      case 'delivery':
        return !!(
          delivery.address &&
          delivery.city &&
          delivery.state &&
          delivery.zipCode &&
          delivery.preferredDeliveryTime
        );
      case 'payment':
        return true;
      default:
        return false;
    }
  }, [store]);

  return {
    ...store,
    currentStepIndex,
    totalSteps: STEP_ORDER.length,
    isFirstStep,
    isLastStep,
    progress,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    submitOrder,
    canProceed,
  };
}
