export type UserRole = 'customer' | 'admin' | 'staff';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  companyName?: string;
  role: UserRole;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  defaultDeliveryAddress?: DeliveryAddress;
  dietaryRestrictions?: string[];
  favoriteMenuItems?: string[];
  communicationPreferences: CommunicationPreferences;
}

export interface DeliveryAddress {
  address: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export interface CommunicationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
}

export interface Attendee {
  id: string;
  orderId: string;
  name: string;
  email: string;
  dietaryRestrictions?: string[];
  hasSelectedLunch: boolean;
  lunchSelectionId?: string;
  invitedAt: Date;
  selectedAt?: Date;
}
