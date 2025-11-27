import { Warehouse, CreateWarehouseRequest, UpdateWarehouseRequest, WarehouseFilterParams } from '../types/warehouse';
import { ApiResponse, PageResponse } from '../types/api';
import api from "@/lib/api";

const API_BASE_URL = '/warehouses';

export const warehouseService = {
  // Create a new warehouse
  async createWarehouse(data: CreateWarehouseRequest): Promise<ApiResponse<Warehouse>> {
    const response = await api.post<ApiResponse<Warehouse>>(API_BASE_URL, data);
    return response.data;
  },

  // Get a warehouse by ID
  async getWarehouse(id: number): Promise<ApiResponse<Warehouse>> {
    const response = await api.get<ApiResponse<Warehouse>>(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  // Update a warehouse
  async updateWarehouse(
    id: number,
    data: UpdateWarehouseRequest
  ): Promise<ApiResponse<Warehouse>> {
    const response = await api.put<ApiResponse<Warehouse>>(
      `${API_BASE_URL}/${id}`,
      data
    );
    return response.data;
  },

  // Delete a warehouse
  async deleteWarehouse(id: number): Promise<void> {
    await api.delete(`${API_BASE_URL}/${id}`);
  },

  // Get all warehouses with pagination and filtering
  async getWarehouses(
    params: WarehouseFilterParams = {}
  ): Promise<PageResponse<Warehouse>> {
    const response = await api.get<PageResponse<Warehouse>>(API_BASE_URL, {
      params,
    });
    return response.data;
  },

  // Toggle warehouse status
  async toggleStatus(id: number, isActive: boolean): Promise<ApiResponse<Warehouse>> {
    const response = await api.patch<ApiResponse<Warehouse>>(
      `${API_BASE_URL}/${id}/status`,
      { isActive }
    );
    return response.data;
  },

  // Set default warehouse
  async setDefaultWarehouse(id: number): Promise<ApiResponse<Warehouse>> {
    const response = await api.patch<ApiResponse<Warehouse>>(
      `${API_BASE_URL}/${id}/set-default`
    );
    return response.data;
  },
};

export default warehouseService;
