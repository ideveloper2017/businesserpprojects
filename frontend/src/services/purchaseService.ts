import axios from 'axios';
import { Purchase, PurchaseStatus } from '../types/purchase';
import { ApiResponse, PageResponse } from '../types/api';

const API_BASE_URL = '/api/v1/purchases';

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

export const purchaseService = {
  // Create a new purchase
  async createPurchase(data: CreatePurchaseRequest): Promise<ApiResponse<Purchase>> {
    const response = await axios.post<ApiResponse<Purchase>>(API_BASE_URL, data);
    return response.data;
  },

  // Get a purchase by ID
  async getPurchase(id: number): Promise<ApiResponse<Purchase>> {
    const response = await axios.get<ApiResponse<Purchase>>(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  // Get all purchases with pagination and filtering
  async getPurchases(
    params: {
      page?: number;
      size?: number;
      status?: PurchaseStatus;
      supplierId?: number;
      startDate?: string;
      endDate?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<PageResponse<Purchase>> {
    const response = await axios.get<PageResponse<Purchase>>(API_BASE_URL, { params });
    return response.data;
  },

  // Update a purchase
  async updatePurchase(
    id: number,
    data: UpdatePurchaseRequest
  ): Promise<ApiResponse<Purchase>> {
    const response = await axios.put<ApiResponse<Purchase>>(
      `${API_BASE_URL}/${id}`,
      data
    );
    return response.data;
  },

  // Delete a purchase
  async deletePurchase(id: number): Promise<void> {
    await axios.delete(`${API_BASE_URL}/${id}`);
  },

  // Update purchase status
  async updateStatus(
    id: number,
    status: PurchaseStatus
  ): Promise<ApiResponse<Purchase>> {
    const response = await axios.patch<ApiResponse<Purchase>>(
      `${API_BASE_URL}/${id}/status`,
      null,
      { params: { status } }
    );
    return response.data;
  },

  // Record a payment for a purchase
  async recordPayment(
    id: number,
    amount: number,
    notes?: string
  ): Promise<ApiResponse<Purchase>> {
    const response = await axios.post<ApiResponse<Purchase>>(
      `${API_BASE_URL}/${id}/payments`,
      null,
      { params: { amount, notes } }
    );
    return response.data;
  },

  // Mark purchase as received
  async markAsReceived(
    id: number,
    notes?: string
  ): Promise<ApiResponse<Purchase>> {
    const response = await axios.post<ApiResponse<Purchase>>(
      `${API_BASE_URL}/${id}/receive`,
      null,
      { params: { notes } }
    );
    return response.data;
  },
};

export default purchaseService;
