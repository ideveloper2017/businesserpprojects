import { BaseEntity } from './base';

export enum PurchaseStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  ORDERED = 'ORDERED',
  RECEIVED = 'RECEIVED',
  PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
  PAID = 'PAID',
}

export interface PurchaseItem {
  id?: number;
  productId: number;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  receivedQuantity?: number;
}

export interface Purchase extends BaseEntity {
  id: number;
  invoiceNumber: string;
  supplierId: number;
  supplierName: string;
  warehouseId: number;
  warehouseName: string;
  purchaseDate: string;
  notes?: string;
  subTotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: PurchaseStatus;
  isPaid: boolean;
  isReceived: boolean;
  paymentDueDate?: string;
  items: PurchaseItem[];
  payments?: Payment[];
}

export interface Payment {
  id: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface PurchaseFilterParams {
  page?: number;
  size?: number;
  status?: PurchaseStatus;
  supplierId?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreatePurchaseRequest {
  invoiceNumber: string;
  supplierId: number;
  warehouseId: number;
  purchaseDate: string;
  notes?: string;
  subTotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  paymentDueDate?: string;
  items: Array<{
    productId: number;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    discount: number;
    total: number;
  }>;
}

export interface UpdatePurchaseRequest {
  invoiceNumber?: string;
  supplierId?: number;
  warehouseId?: number;
  purchaseDate?: string;
  notes?: string;
  subTotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
  paidAmount?: number;
  paymentDueDate?: string;
  status?: string;
}
