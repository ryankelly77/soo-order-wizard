import type { Order, OrderStatus } from './order.types';
import type { MenuItem, BreakfastPackage, SnackPackage, MenuCategory, DietaryTag } from './menu.types';
import type { User } from './user.types';

// Admin Dashboard Stats
export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  ordersToday: number;
  averageOrderValue: number;
  topSellingItems: TopSellingItem[];
}

export interface TopSellingItem {
  itemId: string;
  itemName: string;
  totalQuantity: number;
  totalRevenue: number;
}

// Admin Order Management
export interface AdminOrder extends Order {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  dateFrom?: Date;
  dateTo?: Date;
  customerId?: string;
  searchTerm?: string;
}

export interface OrdersResponse {
  orders: AdminOrder[];
  total: number;
  page: number;
  pageSize: number;
}

// Admin Menu Management
export interface MenuItemFormData {
  name: string;
  description: string;
  category: MenuCategory;
  price: number;
  imageUrl?: string;
  dietaryTags: DietaryTag[];
  allergens: string[];
  servingSize?: string;
  isAvailable: boolean;
  isPopular?: boolean;
  displayOrder?: number;
  calories?: number;
  preparationTime?: number;
}

export interface BreakfastPackageFormData {
  name: string;
  type: 'continental' | 'hot' | 'premium';
  description: string;
  pricePerPerson: number;
  minimumHeadCount: number;
  includedItems: string[];
  imageUrl?: string;
  isAvailable: boolean;
}

export interface SnackPackageFormData {
  name: string;
  type: 'basic' | 'premium' | 'custom';
  description: string;
  pricePerPerson: number;
  minimumHeadCount: number;
  includedItems: string[];
  imageUrl?: string;
  isAvailable: boolean;
}

// Admin User with additional fields
export interface AdminUser extends User {
  isAdmin: boolean;
  orderCount: number;
  totalSpent: number;
  lastOrderDate?: Date;
}

// API Response types
export interface AdminMenuResponse {
  menuItems: MenuItem[];
  breakfastPackages: BreakfastPackage[];
  snackPackages: SnackPackage[];
}

export interface AdminStatsResponse {
  stats: AdminStats;
  generatedAt: Date;
}

// Table sorting and pagination
export interface TableSort {
  column: string;
  direction: 'asc' | 'desc';
}

export interface TablePagination {
  page: number;
  pageSize: number;
}

export interface TableState {
  sort?: TableSort;
  pagination: TablePagination;
  filters?: Record<string, unknown>;
}
