import {Customer} from "@/types/customer.types.ts";
import {Product} from "@/types/product.types.ts";
import {User} from "@/types/auth.types.ts";

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED'
}

export interface OrderItem {
  id?: number;
  productId: number;
  product?: Product;
  quantity: number;
  unitPrice: number;
  total: number;
  sku?: string;
  barcode?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  user:User,
  customerId: number;
  customer: Customer;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  updatedBy?: number;
}

export interface CreateOrderRequest {
  customerId: number;
  items: Array<{
    productId: number;
    quantity: number;
    unitPrice: number;
  }>;
  notes?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  subtotal: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount: number;
}

export interface UpdateOrderRequest {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  items?: Array<{
    id?: number;
    productId: number;
    quantity: number;
    unitPrice: number;
  }>;
  notes?: string;
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
}