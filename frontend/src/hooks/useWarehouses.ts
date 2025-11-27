import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import {
  Warehouse,
  WarehouseFilterParams,
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
} from '../types/warehouse';
import { ApiError, PageResponse } from '../types/api';
import warehouseService from '../services/warehouseService';

// Warehouse option type for dropdowns
export type WarehouseOption = {
  value: number;
  label: string;
};

export const useWarehouses = (initialParams: WarehouseFilterParams = {}) => {
  const navigate = useNavigate();
  const { isAuthenticated, refreshToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AxiosError<ApiError> | null>(null);
  const [warehousesData, setWarehousesData] = useState<PageResponse<Warehouse>>({
    data: [],
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrevious: false,
  });

  // Handle API errors including token expiration
  const handleApiError = useCallback(async (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      // Token might be expired, try to refresh
      const refreshed = await refreshToken();
      if (!refreshed) {
        // If refresh fails, redirect to login
        toast.error('Your session has expired. Please log in again.');
        navigate('/login');
      }
    }
    throw error;
  }, [navigate, refreshToken]);

  // Fetch all warehouses with pagination and filters
  const fetchWarehouses = useCallback(async (params: WarehouseFilterParams = {}) => {
    // if (!isAuthenticated) {
    //   navigate('/login');
    //   return { data: [], currentPage: 1, totalPages: 0, totalItems: 0, hasNext: false, hasPrevious: false };
    // }

    setIsLoading(true);
    setError(null);
    try {
      const response = await warehouseService.getWarehouses(params);
      setWarehousesData(response);
      return response;
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      return handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, navigate, handleApiError]);

  // Fetch a single warehouse by ID
  const fetchWarehouse = useCallback(async (id: number) => {
    if (!id) throw new Error('Warehouse ID is required');
    if (!isAuthenticated) {
      navigate('/login');
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await warehouseService.getWarehouse(id);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      return handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, navigate, handleApiError]);

  const createWarehouse = useCallback(async (warehouse: CreateWarehouseRequest) => {
    if (!isAuthenticated) {
      navigate('/login');
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await warehouseService.createWarehouse(warehouse);
      toast.success('Warehouse created successfully');
      await fetchWarehouses(initialParams);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      return handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, navigate, fetchWarehouses, initialParams, handleApiError]);

  const updateWarehouse = useCallback(async (id: number, warehouse: UpdateWarehouseRequest) => {
    if (!isAuthenticated) {
      navigate('/login');
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await warehouseService.updateWarehouse(id, warehouse);
      toast.success('Warehouse updated successfully');
      await fetchWarehouses(initialParams);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      return handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, navigate, fetchWarehouses, initialParams, handleApiError]);

  const deleteWarehouse = useCallback(async (id: number) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await warehouseService.deleteWarehouse(id);
      toast.success('Warehouse deleted successfully');
      await fetchWarehouses(initialParams);
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      return handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, navigate, fetchWarehouses, initialParams, handleApiError]);

  const toggleStatus = useCallback(async (id: number, isActive: boolean) => {
    if (!isAuthenticated) {
      navigate('/login');
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await warehouseService.toggleStatus(id, isActive);
      toast.success(`Warehouse ${isActive ? 'activated' : 'deactivated'} successfully`);
      await fetchWarehouses(initialParams);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      return handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, navigate, fetchWarehouses, initialParams, handleApiError]);

  const setDefaultWarehouse = useCallback(async (id: number) => {
    if (!isAuthenticated) {
      navigate('/login');
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await warehouseService.setDefaultWarehouse(id);
      toast.success('Default warehouse updated successfully');
      await fetchWarehouses(initialParams);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      return handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, navigate, fetchWarehouses, initialParams, handleApiError]);

  const getWarehouseOptions = useCallback(async (): Promise<WarehouseOption[]> => {
    if (!isAuthenticated) {
      navigate('/login');
      return [];
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await warehouseService.getWarehouses({ page: 1, size: 100 });
      return response.data.map((warehouse: Warehouse) => ({
        value: warehouse.id,
        label: warehouse.name,
      }));
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      handleApiError(error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, navigate, handleApiError]);

  // Initial data load
  useEffect(() => {
    fetchWarehouses(initialParams);
  }, [fetchWarehouses, initialParams]);

  return {
    warehouses: warehousesData.data,
    pagination: {
      currentPage: warehousesData.currentPage,
      totalPages: warehousesData.totalPages,
      totalItems: warehousesData.totalItems,
      hasNext: warehousesData.hasNext,
      hasPrevious: warehousesData.hasPrevious,
    },
    isLoading,
    error,
    fetchWarehouses,
    fetchWarehouse,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    toggleStatus,
    setDefaultWarehouse,
    getWarehouseOptions,
  };
};

export default useWarehouses;
