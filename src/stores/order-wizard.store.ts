import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  EventDetails,
  DeliveryInfo,
  BreakfastSelection,
  SnackSelection,
  CheckoutMode,
  GuestCheckoutInfo,
} from '@/contracts/types';
import type { CreateOrderInput } from '@/contracts/schemas';

export type WizardStep =
  | 'event-details'
  | 'breakfast'
  | 'lunch'
  | 'snacks-drinks'
  | 'delivery'
  | 'payment';

interface OrderWizardState {
  // Wizard navigation
  currentStep: WizardStep;

  // Order data
  eventDetails: Partial<EventDetails>;
  breakfast: Partial<BreakfastSelection> | null;
  snacks: Partial<SnackSelection> | null;
  delivery: Partial<DeliveryInfo>;
  promotionCode: string | null;
  discountAmount: number;

  // Guest checkout
  isGuest: boolean;
  guestInfo: GuestCheckoutInfo | null;
  checkoutMode: CheckoutMode | null;

  // Actions
  setCurrentStep: (step: WizardStep) => void;
  setEventDetails: (details: Partial<EventDetails>) => void;
  setBreakfast: (breakfast: Partial<BreakfastSelection> | null) => void;
  setSnacks: (snacks: Partial<SnackSelection> | null) => void;
  setDelivery: (delivery: Partial<DeliveryInfo>) => void;
  setPromotionCode: (code: string | null) => void;
  setDiscountAmount: (amount: number) => void;

  // Guest checkout actions
  setIsGuest: (isGuest: boolean) => void;
  setGuestInfo: (info: GuestCheckoutInfo | null) => void;
  setCheckoutMode: (mode: CheckoutMode | null) => void;

  // Utility
  getOrderData: () => CreateOrderInput;
  reset: () => void;
}

const initialState = {
  currentStep: 'event-details' as WizardStep,
  eventDetails: {},
  breakfast: null,
  snacks: null,
  delivery: {},
  promotionCode: null,
  discountAmount: 0,
  isGuest: false,
  guestInfo: null,
  checkoutMode: null,
};

export const useOrderWizardStore = create<OrderWizardState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentStep: (step) => set({ currentStep: step }),

      setEventDetails: (details) =>
        set((state) => ({
          eventDetails: { ...state.eventDetails, ...details },
        })),

      setBreakfast: (breakfast) => set({ breakfast }),

      setSnacks: (snacks) => set({ snacks }),

      setDelivery: (delivery) =>
        set((state) => ({
          delivery: { ...state.delivery, ...delivery },
        })),

      setPromotionCode: (code) => set({ promotionCode: code }),

      setDiscountAmount: (amount) => set({ discountAmount: amount }),

      setIsGuest: (isGuest) => set({ isGuest }),

      setGuestInfo: (info) => set({ guestInfo: info }),

      setCheckoutMode: (mode) => set({ checkoutMode: mode }),

      getOrderData: () => {
        const state = get();
        return {
          eventDetails: state.eventDetails as EventDetails,
          breakfast: state.breakfast as BreakfastSelection | undefined,
          snacks: state.snacks as SnackSelection | undefined,
          delivery: state.delivery as DeliveryInfo,
          promotionCode: state.promotionCode || undefined,
          isGuest: state.isGuest,
          guestEmail: state.guestInfo?.email,
        };
      },

      reset: () => set(initialState),
    }),
    {
      name: 'order-wizard-storage',
      partialize: (state) => ({
        currentStep: state.currentStep,
        eventDetails: state.eventDetails,
        breakfast: state.breakfast,
        snacks: state.snacks,
        delivery: state.delivery,
        promotionCode: state.promotionCode,
        isGuest: state.isGuest,
        guestInfo: state.guestInfo,
        checkoutMode: state.checkoutMode,
      }),
    }
  )
);

// Step configuration for the wizard
export const WIZARD_STEPS: { id: WizardStep; name: string; number: number }[] = [
  { id: 'event-details', name: 'Event Details', number: 1 },
  { id: 'breakfast', name: 'Breakfast', number: 2 },
  { id: 'lunch', name: 'Lunch', number: 3 },
  { id: 'snacks-drinks', name: 'Snacks & Drinks', number: 4 },
  { id: 'delivery', name: 'Delivery', number: 5 },
  { id: 'payment', name: 'Payment', number: 6 },
];

// Helper to get step index
export const getStepIndex = (step: WizardStep): number => {
  return WIZARD_STEPS.findIndex((s) => s.id === step);
};

// Helper to check if a step is accessible (completed previous steps)
export const canAccessStep = (
  targetStep: WizardStep,
  currentStep: WizardStep,
  completedSteps: WizardStep[]
): boolean => {
  const targetIndex = getStepIndex(targetStep);
  const currentIndex = getStepIndex(currentStep);
  return targetIndex <= currentIndex || completedSteps.includes(targetStep);
};
