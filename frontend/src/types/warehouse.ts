import { BaseEntity } from './base';

export interface Warehouse extends BaseEntity {
  id: number;
  name: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWarehouseRequest {
  name: string;
  isDefault?: boolean;
}

export interface UpdateWarehouseRequest extends Partial<CreateWarehouseRequest> {
  isActive?: boolean;
}

export interface WarehouseFilterParams {
  search?: string;
  isActive?: boolean;
  isDefault?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
