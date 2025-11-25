import { User } from './user.types';

export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  notes?: string;
  metadata?: Record<string, any>;
  processedAt?: string;
  refundedAmount?: number;
  refundReason?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  updatedBy?: User;
  order?: {
    id: number;
    orderNumber: string;
    customerName?: string;
    totalAmount: number;
    status: string;
  };
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  CANCELLED = 'CANCELLED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED',
  PROCESSING = 'PROCESSING',
  REQUIRES_ACTION = 'REQUIRES_ACTION',
  REQUIRES_CAPTURE = 'REQUIRES_CAPTURE',
  REQUIRES_CONFIRMATION = 'REQUIRES_CONFIRMATION',
  REQUIRES_PAYMENT_METHOD = 'REQUIRES_PAYMENT_METHOD'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  PAYPAL = 'PAYPAL',
  STRIPE = 'STRIPE',
  SQUARE = 'SQUARE',
  APPLE_PAY = 'APPLE_PAY',
  GOOGLE_PAY = 'GOOGLE_PAY',
  GIFT_CARD = 'GIFT_CARD',
  STORE_CREDIT = 'STORE_CREDIT',
  CHECK = 'CHECK',
  MONEY_ORDER = 'MONEY_ORDER',
  CRYPTOCURRENCY = 'CRYPTOCURRENCY',
  OTHER = 'OTHER'
}

export interface PaymentMethodInfo {
  method: PaymentMethod;
  label: string;
  icon?: string;
  description?: string;
  requiresOnlineProcessing: boolean;
  supportedCurrencies?: string[];
  minAmount?: number;
  maxAmount?: number;
  fees?: {
    fixed?: number;
    percentage?: number;
  };
}

export interface CreatePaymentRequest {
  orderId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  notes?: string;
  metadata?: Record<string, any>;
  processOnline?: boolean;
  savePaymentMethod?: boolean;
  paymentMethodId?: string; // For saved payment methods
  paymentIntentId?: string; // For payment intents
  currency?: string;
  customerId?: string;
}

export interface UpdatePaymentRequest {
  amount?: number;
  paymentMethod?: PaymentMethod;
  status?: PaymentStatus;
  transactionId?: string;
  notes?: string;
  metadata?: Record<string, any>;
  refundedAmount?: number;
  refundReason?: string;
}

export interface ProcessRefundRequest {
  paymentId: number;
  amount?: number;
  reason?: string;
  notes?: string;
  refundToOriginalPaymentMethod?: boolean;
  metadata?: Record<string, any>;
}

export interface PaymentFilterParams {
  query?: string;
  orderId?: number;
  orderNumber?: string;
  customerId?: string;
  customerName?: string;
  status?: PaymentStatus | PaymentStatus[];
  paymentMethod?: PaymentMethod | PaymentMethod[];
  minAmount?: number;
  maxAmount?: number;
  startDate?: string | Date;
  endDate?: string | Date;
  sortBy?: 'createdAt' | 'updatedAt' | 'amount' | 'status';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  size?: number;
  includeOrderDetails?: boolean;
  includeCustomerDetails?: boolean;
}

export interface PaymentSummary {
  totalPayments: number;
  totalAmount: number;
  successfulPayments: number;
  successfulAmount: number;
  pendingPayments: number;
  pendingAmount: number;
  failedPayments: number;
  failedAmount: number;
  refundedPayments: number;
  refundedAmount: number;
  partiallyRefundedPayments: number;
  partiallyRefundedAmount: number;
  paymentMethodBreakdown: Array<{
    method: PaymentMethod;
    count: number;
    amount: number;
    percentage: number;
  }>;
  statusBreakdown: Array<{
    status: PaymentStatus;
    count: number;
    amount: number;
    percentage: number;
  }>;
  dailyStats: Array<{
    date: string;
    count: number;
    amount: number;
  }>;
  currency: string;
  lastUpdated: string;
}

export interface PaymentAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  onClick: (payment: Payment) => void | Promise<void>;
  disabled?: boolean | ((payment: Payment) => boolean);
  hidden?: boolean | ((payment: Payment) => boolean);
  confirm?: {
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
  };
}

export interface PaymentNotification {
  id: string;
  paymentId: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface PaymentWebhookEvent {
  id: string;
  type: string;
  data: {
    id: string;
    object: string;
    [key: string]: any;
  };
  created: number;
  pendingWebhooks: number;
  request: {
    id?: string;
    idempotencyKey?: string;
  };
  apiVersion: string;
  livemode: boolean;
}
