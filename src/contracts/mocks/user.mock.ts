import type { User, Attendee } from '../types';

export const mockUser: User = {
  id: 'user-456',
  email: 'john.smith@acme.com',
  firstName: 'John',
  lastName: 'Smith',
  phone: '512-555-1234',
  companyName: 'Acme Corp',
  role: 'customer',
  preferences: {
    defaultDeliveryAddress: {
      address: '123 Business Blvd',
      addressLine2: 'Suite 400',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      isDefault: true,
    },
    dietaryRestrictions: [],
    favoriteMenuItems: ['lunch-1', 'lunch-4'],
    communicationPreferences: {
      emailNotifications: true,
      smsNotifications: true,
      marketingEmails: false,
    },
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockAttendees: Attendee[] = [
  {
    id: 'att-1',
    orderId: 'order-123',
    name: 'Alice Johnson',
    email: 'alice@acme.com',
    dietaryRestrictions: ['gluten-free'],
    hasSelectedLunch: true,
    lunchSelectionId: 'ls-1',
    invitedAt: new Date(),
    selectedAt: new Date(),
  },
  {
    id: 'att-2',
    orderId: 'order-123',
    name: 'Bob Williams',
    email: 'bob@acme.com',
    hasSelectedLunch: true,
    lunchSelectionId: 'ls-2',
    invitedAt: new Date(),
    selectedAt: new Date(),
  },
  {
    id: 'att-3',
    orderId: 'order-123',
    name: 'Carol Davis',
    email: 'carol@acme.com',
    dietaryRestrictions: ['vegetarian'],
    hasSelectedLunch: false,
    invitedAt: new Date(),
  },
];
