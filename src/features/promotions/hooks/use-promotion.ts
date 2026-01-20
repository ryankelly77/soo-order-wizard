'use client';

import { useState, useCallback } from 'react';
import type { Promotion, PromotionValidation } from '@/contracts/types';

export function usePromotion() {
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateCode = useCallback(async (code: string, subtotal: number): Promise<PromotionValidation> => {
    setIsValidating(true);
    setError(null);

    try {
      const response = await fetch('/api/promotions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, orderSubtotal: subtotal }),
      });

      const result: PromotionValidation = await response.json();

      if (result.isValid && result.promotion) {
        setPromotion(result.promotion);
        setDiscountAmount(result.discountAmount || 0);
      } else {
        setPromotion(null);
        setDiscountAmount(0);
        setError(result.errorMessage || 'Invalid promotion code');
      }

      return result;
    } catch {
      const errorMessage = 'Failed to validate promotion code';
      setError(errorMessage);
      return { isValid: false, errorMessage };
    } finally {
      setIsValidating(false);
    }
  }, []);

  const clearPromotion = useCallback(() => {
    setPromotion(null);
    setDiscountAmount(0);
    setError(null);
  }, []);

  return {
    promotion,
    discountAmount,
    isValidating,
    error,
    validateCode,
    clearPromotion,
    hasValidPromotion: !!promotion,
  };
}
