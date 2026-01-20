export type PromotionType =
  | 'percentage'
  | 'fixed_amount'
  | 'free_delivery'
  | 'free_item';

export type PromotionStatus = 'active' | 'scheduled' | 'expired' | 'disabled';

export interface Promotion {
  id: string;
  code: string;
  name: string;
  description: string;
  type: PromotionType;
  value: number;
  minimumOrderAmount?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  perUserLimit?: number;
  validFrom: Date;
  validUntil: Date;
  status: PromotionStatus;
  applicableCategories?: string[];
  excludedItems?: string[];
  firstTimeCustomerOnly: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PromotionUsage {
  id: string;
  promotionId: string;
  userId: string;
  orderId: string;
  discountAmount: number;
  usedAt: Date;
}

export interface PromotionValidation {
  isValid: boolean;
  promotion?: Promotion;
  discountAmount?: number;
  errorMessage?: string;
}
