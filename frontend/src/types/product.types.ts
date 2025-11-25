// Re-export all types from product.types
export * from './product.types';
export * from './user.types';
export * from './product.types';
export * from './media-library';

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  quantityInStock: number;
  categoryId?: number;
  unitId?: number;
  sku: string;
  costPrice: number;
  barcode?: string;
  active?: boolean;
}

export interface UpdateProductRequest {
  name: string;
  description?: string;
  price: number;
  quantityInStock: number;
  categoryId?: number;
  unitId?: number;
}

export interface ProductCategory {
  id: number;
  name: string;
  description: string | null;
  parent_id: number | null;
  active: boolean;
  subCategories: ProductCategory[];
  productCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  costPrice: number;
  barcode?: string;
  description?: string;
  price: number;
  quantityInStock: number;
  category?: ProductCategory;
  categoryId?: number;
  unit_id?: number;
  units?: {
    id: number;
    name: string;
    code: string;
  };
  images?: string[];
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
// Customer types
export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  email?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Order types
export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  customerId: number;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// Inventory types
export interface InventoryItem {
  id: number;
  productId: number;
  productName: string;
  inStock: number;
  reserved: number;
  available: number;
  lowStockThreshold: number;
  lastRestocked: string;
}

// Dashboard types
export interface SalesSummary {
  daily: number;
  weekly: number;
  monthly: number;
  annual: number;
}

export interface InventorySummary {
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
}

export interface CustomerSummary {
  totalCustomers: number;
  newCustomersThisMonth: number;
}
