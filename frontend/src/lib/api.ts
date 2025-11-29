import axios, {AxiosError, AxiosResponse} from 'axios';
import {User, Role, Permission} from '../types/user.types';
import {Product, CreateProductRequest, ProductCategory, Order} from '../types/product.types';

import {toast} from 'sonner';
import {MediaFile, UploadResponse} from "@/types/media-library.ts";
import {logFormData, validateBackendCompatibility, sanitizeForBackend} from './debug-helpers';
import {CreateUnitDto, Unit, UpdateUnitDto} from "@/types/unit.types.ts";
import {CreateOrderRequest, OrderStatus, UpdateOrderRequest} from "@/types/order.types";
import {
    CreatePaymentRequest,
    Payment,
    PaymentFilterParams, PaymentMethod,
    PaymentStatus, PaymentSummary,
    UpdatePaymentRequest
} from "@/types/payment.types.ts";
import {PageResponse} from "@/types/api.ts";
import {Warehouse} from "@/types/warehouse.ts";
import {Customer} from "@/types/customer.types";
import {AuditLog, AuditFilterParams, Page} from '@/types/audit.types';

const API_URL = 'http://localhost:8080';
const API_BASE = '/api';
const API_VERSION = '/v1';
const API_BASE_URL = `${API_URL}${API_BASE}${API_VERSION}`;

console.log('API Base URL:', API_BASE_URL);
export type SpringPage<T> = {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number; // current page index (0-based)
};

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for CORS with credentials
});


async function apiRequest<T>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
    retryCount = 0,
    customHeaders: Record<string, string> = {}
): Promise<ApiResponse<T>> {
    // Проверяем, является ли запрос multipart/form-data
    const isFormData = data instanceof FormData;
    if (isFormData) {
        console.log(`[API] Processing FormData request to ${url}`);
        logFormData(data, `${method} ${url} Request`);
    }
    const maxRetries = 2;
    const retryDelay = 1000; // 1 second

    console.log(`[API] Request: ${method} ${url}`, data ? {requestData: data} : '');

    // Set default headers
    const headers: Record<string, string> = {
        'Accept': 'application/json',
        ...customHeaders,
    };


    // Don't set Content-Type for FormData, let the browser set it with the correct boundary
    if (!(data instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }


    // Attach tenant header if available
    const tenantId = (typeof window !== 'undefined' ? localStorage.getItem('tenantId') : null) || (import.meta as any).env?.VITE_DEFAULT_TENANT_ID;
    if (tenantId && !headers['X-Tenant-ID']) {
        headers['X-Tenant-ID'] = tenantId;
    }


    try {
        console.log(`[API] Sending ${method} request to ${url} with data:`, data);
        const response = await api.request<ApiResponse<T>>({
            url,
            method,
            data,
            headers,
            // Let axios handle FormData automatically
            transformRequest: [(data, headers) => {
                if (data instanceof FormData) {

                    delete headers['Content-Type'];
                    return data;
                }
                return data;
            }],
            validateStatus: (status) => status < 500, // Don't throw for server errors
        });

        console.log(`[API] Response for ${method} ${url}:`, {
            status: response.status,
            data: response.data
        });

        // If unauthorized, try to refresh token and retry
        if (response.status === 401 && retryCount < maxRetries) {
            console.log('[API] Unauthorized, attempting to refresh token...');
            try {
                await refreshToken();
                // Wait a bit before retrying
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                return apiRequest<T>(url, method, data, retryCount + 1);
            } catch (refreshError) {
                console.error('[API] Token refresh failed:', refreshError);
                // If refresh fails, log out the user
                logout();
            }
        }

        // For other error statuses, check if we should retry
        if (response.status >= 400 && response.status < 500 && retryCount < maxRetries) {
            console.log(`[API] Retrying ${method} ${url} (attempt ${retryCount + 1} of ${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return apiRequest<T>(url, method, data, retryCount + 1);
        }

        // If we have an error response, log it and throw
        if (!response.data || response.status >= 400) {
            // Подробно логируем весь ответ для диагностики
            const errorDetails = {
                status: response.status,
                statusText: response.statusText,
                request: {
                    method,
                    url,
                    data: data,
                },
                response: {
                    data: response.data,
                    headers: response.headers
                }
            };

            console.error(`[API] Request failed: ${method} ${url}`, errorDetails);

            let errorMessage = 'Неизвестная ошибка';

            // Handle different error response formats
            if (response.data) {
                if (typeof response.data === 'string') {
                    errorMessage = response.data;
                } else if (response.data.message) {
                    errorMessage = response.data.message;
                } else if (response.data.error) {
                    errorMessage = response.data.error;
                } else if (response.data.detail) {
                    errorMessage = response.data.detail;
                } else if (response.data.title) {
                    errorMessage = response.data.title;
                } else {
                    errorMessage = JSON.stringify(response.data);
                }
            } else {
                errorMessage = `${response.status} ${response.statusText || 'Unknown Error'}`;
            }

            const error = new Error(errorMessage);
            error.name = `API Error (${response.status})`;
            error['response'] = response;
            error['request'] = {method, url, data};

            throw error;
        }

        return response.data;

    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorData = error.response?.data || {};
            let errorMessage;

            // Выводим подробную информацию об ошибке для диагностики
            console.error(`[API] Axios error in ${method} ${url}:`, {
                status: error.response?.status,
                statusText: error.response?.statusText,
                headers: error.response?.headers,
                data: error.response?.data,
                requestData: data
            });

            // Специальная обработка ошибки Bad Request
            if (error.response?.status === 400) {
                console.error('[API] Bad Request Error:', errorData);

                if (errorData.detail && typeof errorData.detail === 'string') {
                    errorMessage = errorData.detail;
                } else if (errorData.title && typeof errorData.title === 'string') {
                    errorMessage = errorData.title;
                } else if (typeof errorData === 'object') {
                    // Проверяем разные возможные форматы ошибки
                    errorMessage = errorData.message || errorData.error ||
                        errorData.errorMessage || errorData.errorCode ||
                        JSON.stringify(errorData) || 'Некорректный запрос';
                } else {
                    errorMessage = typeof errorData === 'string' ? errorData : 'Некорректный запрос';
                }
            } else if (typeof errorData === 'object') {
                errorMessage = errorData.message || errorData.error || error.message;
            } else if (typeof errorData === 'string') {
                try {
                    const parsedError = JSON.parse(errorData);
                    errorMessage = parsedError.message || parsedError.error || error.message;
                } catch {
                    errorMessage = errorData || error.message;
                }
            } else {
                errorMessage = error.message;
            }

            console.error(`[API] Request failed (${method} ${url}):`, {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                error: errorMessage,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers,
                },
                request: error.request ? 'Present' : 'Not present'
            });

            // Create a more detailed error object
            const apiError = new Error(errorMessage) as any;
            apiError.status = error.response?.status;
            apiError.data = error.response?.data;
            apiError.originalError = error;
            throw apiError;

        } else {
            console.error(`[API] Request failed (${method} ${url}):`, error);
            throw error;
        }
    }
}

// User API
export const userApi = {
    getAll: (): Promise<ApiResponse<User[]>> => apiRequest<User[]>('/users'),
    getById: (id: number) => api.get<ApiResponse<User>>(`/users/${id}`),
    create: (user: Omit<User, 'id'>) => api.post<User>('/users', user),
    update: (id: number, user: Omit<User, 'id'>) => api.put<User>(`/users/${id}`, user),
    delete: (id: number) => api.delete(`/users/${id}`),
    assignRoles: (userId: number, roleIds: number[]) =>
        api.post<User>(`/users/${userId}/roles`, {roleIds}),
    removeRoles: (userId: number, roleIds: number[]) =>
        api.delete<User>(`/users/${userId}/roles`, {data: {roleIds}}),
};

// Role API
export const roleApi = {
    getAll: () => apiRequest<Role[]>('/roles'),
    getById: (id: number) => apiRequest<Role>(`/roles/${id}`),
    create: (role: Omit<Role, 'id'>) => api.post<Role>('/roles', role),
    update: (id: number, role: Omit<Role, 'id'>) => api.put<Role>(`/roles/${id}`, role),
    delete: (id: number) => api.delete(`/roles/${id}`),
    assignPermissions: (roleId: number, permissionIds: number[]) =>
        api.post<Role>(`/roles/${roleId}/permissions`, {permissionIds}),
    removePermissions: (roleId: number, permissionIds: number[]) =>
        api.delete<Role>(`/roles/${roleId}/permissions`, {data: {permissionIds}}),
};

// Product API
export const productApi = {
    getAll: () => api.get<Product[]>('/products'),
    search: async (params?: { query?: string; type?: 'RAW_MATERIAL' | 'FINISHED_GOOD' | 'SEMI_FINISHED' | 'PACKAGING'; page?: number; size?: number; }): Promise<any[]> => {
        const res = await api.get<any>('/products', { params });
        const data: any = res.data;
        // Try to normalize: ApiResponse<Page> | Page | array
        if (data && typeof data === 'object') {
            if ('data' in data && data.data && typeof data.data === 'object' && 'content' in data.data) return data.data.content || [];
            if ('content' in data) return data.content || [];
            if (Array.isArray(data)) return data;
        }
        return [];
    },
    getByType: async (type: 'RAW_MATERIAL' | 'FINISHED_GOOD' | 'SEMI_FINISHED' | 'PACKAGING', size: number = 100): Promise<any[]> => {
        return productApi.search({ type, page: 0, size });
    },
    getById: (id: number) => api.get<Product>(`/products/${id}`),
    create: async (data: CreateProductRequest): Promise<AxiosResponse<Product, any>> => {
        try {
            console.log('[productApi] Creating product with data:', data);
            const requestData = {
                sku: data.sku,
                name: data.name,
                description: data.description || null,
                price: data.price,
                costPrice: data.costPrice,
                quantityInStock: data.quantityInStock || 0,
                barcode: data.barcode || null,
                categoryId: data.categoryId || null,
                active: data.active ?? true
            };
            console.log('[productApi] Sending product data:', requestData);
            return await api.post<Product>('/products', data);
        } catch (error) {
            console.error('[productApi] Error creating product:', error);
            throw error; // Re-throw to let the caller handle it
        }
    },
    update: async (id: number, data: any): Promise<AxiosResponse<Product>> => {
        try {
            console.log(`[productApi] Updating product with ID ${id}:`, data);

            // Check if there are any files to upload or images to delete
            const hasFileUploads = data.images?.some((img: any) => img instanceof File);
            const hasImagesToDelete = Array.isArray(data.imageIdsToDelete) && data.imageIdsToDelete.length > 0;

            // Handle file uploads with FormData if needed
            if (hasFileUploads || hasImagesToDelete) {
                const formData = new FormData();

                // Add all product fields to form data
                for (const [key, value] of Object.entries(data)) {
                    if (value === undefined || value === null) continue;

                    // Handle image files and URLs
                    if (key === 'images' && Array.isArray(value)) {
                        value.forEach((item: any, index: number) => {
                            if (item instanceof File) {
                                formData.append(`images`, item);
                            } else if (typeof item === 'string') {
                                formData.append('existingImages', item);
                            }
                        });
                    }
                    // Handle image IDs to delete
                    else if (key === 'imageIdsToDelete' && Array.isArray(value) && value.length > 0) {
                        formData.append('imageIdsToDelete', JSON.stringify(value));
                    }
                    // Handle category ID
                    else if (key === 'categoryId' && value) {
                        formData.append('categoryId', String(value));
                    }
                    // Handle other primitive values
                    else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                        formData.append(key, String(value));
                    } else if (value && typeof value === 'object') {
                        // Stringify object values
                        formData.append(key, JSON.stringify(value));
                    }
                }

                // Log FormData for debugging
                console.log('[productApi] Sending FormData with keys:', Array.from(formData.keys()));

                return await api.put<Product>(`/products/${id}`, formData, 0, {
                    'Content-Type': 'multipart/form-data'
                });
            }
            // Handle JSON data (no file upload)
            else {
                // Remove fields that shouldn't be in the JSON payload
                const {images, imageIdsToDelete, ...jsonData} = data;
                console.log('[productApi] Sending JSON data:', jsonData);
                return await api.put<Product>(`/products/${id}`, jsonData);
            }
        } catch (error) {
            console.error(`[productApi] Error updating product ${id}:`, error);
            throw error;
        }
    },
    delete: async (id: number): Promise<ApiResponse<{ success: boolean }>> => {
        try {
            console.log(`[productApi] Deleting product with ID: ${id}`);
            return await apiRequest<{ success: boolean }>(`/products/${id}`, 'DELETE');
        } catch (error) {
            console.error(`[productApi] Error deleting product ${id}:`, error);
            throw error;
        }
    },
};

// Category API
export const categoryApi = {
    getAll: () => api.get<ProductCategory[]>('/categories'),
    getCategoryTree: async (includeInactive: boolean = false) => await api.get<ProductCategory>(`/categories/tree`, {params: {includeInactive}}),
    getById: (id: number) => api.get<ProductCategory>(`/categories/${id}`),
    create: (data: ProductCategory) => {
        console.log('[categoryApi] Creating category with data:', data);
        if (!data.name) {
            console.error('[categoryApi] Missing required field: name');
            throw new Error('Category name is required');
        }
        // Валидация совместимости с бэкендом
        validateBackendCompatibility(data, 'CreateCategoryRequest');
        // Создаем правильный объект запроса для бэкенда
        const requestData = sanitizeForBackend({
            name: data.name,
            description: data.description,
            parentCategoryId: data.parentId
        });
        return api.post<ProductCategory>('/categories', requestData);
    },
    update: (id: number, data: ProductCategory) => {
        console.log(`[categoryApi] Updating category with ID ${id}:`, data);

        // Создаем правильный объект запроса для бэкенда
        const requestData: ProductCategory = {
            name: data.name,
            description: data.description,
            parentId: data.parentId,
            active: data.active
        };

        return api.put<ProductCategory>(`/categories/${id}`, requestData);
    },
    delete: (id: number) => {
        console.log(`[categoryApi] Deleting category with ID: ${id}`);
        return apiRequest<{ success: boolean }>(`/categories/${id}`, 'DELETE');
    },
    // Дополнительный метод для проверки, был ли запрос успешно обработан
    checkRequestStatus: () => {
        console.log('[categoryApi] Checking API connectivity');
        return apiRequest<{ success: boolean }>('/categories/status', 'GET');
    },
};

// Permission API
export const permissionApi = {
    getAll: () => apiRequest<Permission[]>('/permissions'),
    getById: (id: number) => apiRequest<Permission>(`/permissions/${id}`),
    create: (permission: Omit<Permission, 'id'>) => api.post<Permission>('/permissions', permission),
    update: (id: number, permission: Omit<Permission, 'id'>) =>
        api.put<Permission>(`/permissions/${id}`, permission),
    delete: (id: number) => api.delete(`/permissions/${id}`),
};

// Audit API
export const auditApi = {
    getAll: async (params?: AuditFilterParams): Promise<Page<AuditLog> | AuditLog[]> => {
        const res = await api.get('/admin/audit/logs', {params});
        const data: any = res.data;
        if (data && typeof data === 'object') {
            if ('data' in data && Array.isArray(data.data)) return data.data;
            if ('content' in data && Array.isArray(data.content)) return data as Page<AuditLog>;
        }
        return data as AuditLog[];
    },
    export: async (params?: AuditFilterParams, format: 'csv' | 'xlsx' = 'csv') => {
        const res = await api.get('/audit/logs/export', {params: {...params, format}, responseType: 'blob'});
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        return true;
    },
};

export const mediaApi = {
    // Create a new directory
    createDirectory: async (name: string, parentPath: string = ''): Promise<CommonApiResponse<{
        message: string;
        success: boolean
    }>> => {
        try {
            const response = await apiRequest<{ success: boolean; message: string }>(
                '/media/directories',
                'POST',
                {name, parentPath}
            );
            toast.success('Directory created successfully');
            return response;
        } catch (error) {
            console.error('Error creating directory:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to create directory';
            toast.error(errorMessage);
            throw error;
        }
    },

    // Get all media files
    getAll: async (): Promise<MediaFile[]> => {
        try {
            // First try to use the API request helper
            try {
                const response = await apiRequest<MediaFile[]>('/media');
                if (response && 'data' in response && Array.isArray(response.data)) {
                    return response.data;
                }
                if (response && 'success' in response && !response.success) {
                    throw new Error(response.error || 'Failed to fetch media files');
                }
            } catch (apiError) {
                console.warn('API request helper failed, trying direct axios call:', apiError);
                // Fallback to direct axios call
                const response = await api.get<MediaFile[]>('/media');
                return Array.isArray(response.data) ? response.data : [];
            }

            // If we get here, the response format wasn't as expected
            // console.error('Unexpected response format from /media');
            return [];
        } catch (error) {
            console.error('Error in mediaApi.getAll:', error);
            // Return empty array instead of throwing to prevent UI breakage
            return [];
        }
    },

    // Upload a file
    upload: async (file: File, directory: string = ''): Promise<UploadResponse> => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            if (directory) {
                formData.append('directory', directory);
            }

            try {
                // First try with the API request helper
                const response = await apiRequest<MediaApiResponse<UploadResponse>>(
                    '/media/upload',
                    'POST',
                    formData
                );

                if (response && 'data' in response) {
                    return response.data as UploadResponse;
                }

                if (response && 'success' in response && !response.success) {
                    throw new Error(response.error || 'Failed to upload file');
                }
            } catch (apiError) {
                console.warn('API request helper failed, trying direct axios call:', apiError);
                // Fallback to direct axios call
                const response = await api.post<UploadResponse>('/media/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                return response.data;
            }

            // If we get here, the response format wasn't as expected
            throw new Error('Unexpected response format from server');
        } catch (error) {
            console.error('Error in mediaApi.upload:', error);
            throw error;
        }
    },

    // Delete a file
    delete: async (id: number): Promise<void> => {
        try {
            try {
                // First try with the API request helper
                const response = await apiRequest<MediaApiResponse<void>>(
                    `/media/${id}`,
                    'DELETE'
                );

                if (response && 'success' in response && !response.success) {
                    throw new Error(response.error || 'Failed to delete file');
                }
            } catch (apiError) {
                console.warn('API request helper failed, trying direct axios call:', apiError);
                // Fallback to direct axios call
                await api.delete(`/media/${id}`);
            }
        } catch (error) {
            console.error('Error in mediaApi.delete:', error);
            throw error;
        }
    },

    // Get file URL
    getFileUrl: (filePath?: string): string => {
        if (!filePath) {
            console.warn('No file path provided to getFileUrl');
            return ''; // Return empty string or a placeholder image URL
        }
        // Remove any leading slashes to prevent double slashes in the URL
        const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
        return `${API_BASE_URL}/media/download/${cleanPath}`;
    },
};

export const unitApi = {
    // Get all units
    getAll: async (): Promise<AxiosResponse<Unit[]>> => {
        console.log('Fetching all units...');
        try {
            const response = await api.get<Unit[]>('/units');
            console.log('Units response:', response.data);
            return response?.data;
        } catch (error) {
            console.error('Error fetching units:', error);
            throw error;
        }
    },
    // Get unit by ID
    getById: async (id: number): Promise<AxiosResponse<Unit>> => {
        console.log(`Fetching unit with ID: ${id}`);
        return api.get<Unit>(`/units/${id}`);
    },
    // Create new unit
    create: async (data: CreateUnitDto): Promise<AxiosResponse<Unit>> => {
        console.log('Creating unit:', data);
        return api.post<Unit>('/units', data);
    },
    // Update unit
    update: async (id: number, data: UpdateUnitDto): Promise<AxiosResponse<Unit>> => {
        console.log(`Updating unit ${id}:`, data);
        return api.put(`/units/${id}`, data);
    },
    // Delete unit
    delete: async (id: number): Promise<AxiosResponse<void>> => {
        console.log(`Deleting unit with ID: ${id}`);
        return api.delete(`/units/${id}`);
    },
    // Toggle unit status
    toggleStatus: async (id: number, active: boolean): Promise<AxiosResponse<Unit>> => {
        console.log(`Toggling status for unit ${id} to ${active ? 'active' : 'inactive'}`);
        return api.patch(`/units/${id}/status?active=${active}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}

export const orderApi = {
    // Get all orders with optional filters
    getOrders: async (params?: {
        status?: OrderStatus;
        customerId?: number;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
    }): Promise<Order[]> => {
        try {
            console.log('Fetching orders with params:', params);
            const res = await api.get<Order[]>('/orders', {params});
            // Проверяем формат ответа: может быть массив или объект с полем data
            if (res.data && typeof res.data === 'object' && 'data' in res.data && Array.isArray(res.data.data)) {
                console.log(`Received ${res.data.data.length} orders from API`);
                return res.data.data;
            } else if (Array.isArray(res.data)) {
                console.log(`Received ${res.data.length} orders from API (direct array)`);
                return res.data;
            } else {
                console.error('Unexpected response format from /orders endpoint:', res.data);
                return [];
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    },

    // Get order by ID
    getOrderById: async (id: number): Promise<Order> => {
        const res = await api.get<Order>(`/orders/${id}`);
        return (res.data as any)?.data ?? res.data;
    },

    // Create new order
    createOrder: async (data: CreateOrderRequest): Promise<Order> => {
        const res = await api.post<ApiResponse<Order>>('/orders', data);
        return (res.data as any)?.data ?? res.data;
    },

    // Update order
    updateOrder: async (id: number, data: UpdateOrderRequest): Promise<Order> => {
        const res = await api.put<ApiResponse<Order>>(`/orders/${id}`, data);
        return (res.data as any)?.data ?? res.data;
    },

    // Update order status
    updateOrderStatus: async (id: number, status: OrderStatus): Promise<Order> => {
        const res = await api.patch<ApiResponse<Order>>(`/orders/${id}/status`, {status});
        return (res.data as any)?.data ?? res.data;
    },

    // Delete order
    deleteOrder: async (id: number): Promise<void> => {
        await api.delete(`/orders/${id}`);
    },

    // Fetch available order statuses
    getOrderStatuses: async (): Promise<OrderStatus[]> => {
        const res = await api.get<OrderStatus[]>('/orders/statuses');
        return (res.data as any)?.data ?? res.data;
    },
};

export const paymentApi = {
    getAll: async (params?: PaymentFilterParams) => {
        try {
            const response = await api.get<Payment[]>('/payments', {
                params: {
                    ...params,
                    // Convert dates to ISO strings if they exist
                    startDate: params?.startDate?.toISOString(),
                    endDate: params?.endDate?.toISOString()
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching payments:', error);
            throw error;
        }
    },

    getById: async (id: number) => {
        try {
            const response = await api.get<Payment>(`payments/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching payment ${id}:`, error);
            throw error;
        }
    },

    create: async (data: CreatePaymentRequest) => {
        try {
            const response = await api.post<Payment>("/payments", data);
            return response.data;
        } catch (error) {
            console.error('Error creating payment:', error);
            throw error;
        }
    },

    update: async (id: number, data: UpdatePaymentRequest) => {
        try {
            const response = await api.put<Payment>(`payments/${id}`, data);
            return response.data;
        } catch (error) {
            console.error(`Error updating payment ${id}:`, error);
            throw error;
        }
    },

    /**
     * Delete a payment (soft delete)
     */
    delete: async (id: number) => {
        try {
            await api.delete(`payments/${id}`);
        } catch (error) {
            console.error(`Error deleting payment ${id}:`, error);
            throw error;
        }
    },

    /**
     * Get payments by order ID
     */
    getByOrderId: async (orderId: number) => {
        try {
            const response = await api.get<Payment[]>(`payments/order/${orderId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching payments for order ${orderId}:`, error);
            throw error;
        }
    },

    /**
     * Process a full or partial refund
     */
    refund: async (paymentId: number, amount?: number, notes?: string) => {
        try {
            const response = await api.post<Payment>(
                `payments/${paymentId}/refund`,
                {
                    amount,
                    notes: notes || 'Refund processed',
                    processedAt: new Date().toISOString()
                }
            );
            return response.data;
        } catch (error) {
            console.error(`Error processing refund for payment ${paymentId}:`, error);
            throw error;
        }
    },

    /**
     * Update payment status
     */
    updateStatus: async (id: number, status: PaymentStatus, notes?: string) => {
        try {
            const response = await api.patch<Payment>(
                `/orders/${id}/status`,
                {
                    status,
                    notes: notes || `Status updated to ${status}`,
                    updatedAt: new Date().toISOString()
                }
            );
            return response.data;
        } catch (error) {
            console.error(`Error updating status for payment ${id}:`, error);
            throw error;
        }
    },

    /**
     * Get payment summary (total amount, counts by status, etc.)
     */
    getSummary: async (params?: Omit<PaymentFilterParams, 'page' | 'limit'>) => {
        try {
            const response = await api.get<PaymentSummary>(`/orders/summary`, {
                params: {
                    ...params,
                    startDate: params?.startDate?.toISOString(),
                    endDate: params?.endDate?.toISOString()
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching payment summary:', error);
            throw error;
        }
    },

    /**
     * Get available payment methods
     */
    getPaymentMethods: async () => {
        try {
            // In a real app, this would come from the server
            // For now, we'll return a static list
            return Object.values(PaymentMethod);
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            throw error;
        }
    },

    /**
     * Export payments to CSV/Excel
     */
    exportPayments: async (params?: PaymentFilterParams) => {
        try {
            const response = await api.get(`/orders/export`, {
                params: {
                    ...params,
                    startDate: params?.startDate?.toISOString(),
                    endDate: params?.endDate?.toISOString(),
                    format: 'csv' // or 'xlsx'
                },
                responseType: 'blob'
            });

            // Create a download link and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `payments-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            return true;
        } catch (error) {
            console.error('Error exporting payments:', error);
            throw error;
        }
    }
};


// Customer interfaces

// Warehouse API
export const warehouseApi = {
    // Get all warehouses with optional pagination and filters
    getAll: async (params?: {
        page?: number;
        size?: number;
        search?: string;
        isActive?: boolean;
    }) =>
        await api.get<PageResponse<Warehouse>>('/warehouses', undefined, undefined, params),

    // Get warehouse by ID
    getById: (id: number): Promise<ApiResponse<Warehouse>> =>
        apiRequest<Warehouse>(`/warehouses/${id}`),

    // Create new warehouse
    create: async (warehouse: Omit<Warehouse, 'id'>) =>
        await api.post<Warehouse>('/warehouses', warehouse),

    // Update existing warehouse
    update: async (id: number, warehouse: Partial<Warehouse>) =>
        await api.put<Warehouse>(`/warehouses/${id}`, warehouse),

    // Delete warehouse
    delete: (id: number): Promise<ApiResponse<void>> =>
        apiRequest<void>(`/warehouses/${id}`, 'DELETE'),

    // Toggle warehouse active status
    toggleStatus: (id: number, isActive: boolean): Promise<ApiResponse<Warehouse>> =>
        apiRequest<Warehouse>(`/warehouses/${id}/status`, 'PATCH', {isActive}),

    // Set warehouse as default
    setAsDefault: (id: number): Promise<ApiResponse<Warehouse>> =>
        apiRequest<Warehouse>(`/warehouses/${id}/set-default`, 'PATCH'),

    // Get warehouse options for dropdowns
    getOptions: (): Promise<ApiResponse<Array<{ value: number; label: string }>>> =>
        apiRequest<Array<{ value: number; label: string }>>('/warehouses/options')
};

// Manufacturing API
export type RecipeItemDto = {
    productId: number;
    quantity: number;
    uom: string;
    lossPercent: number;
};

export type RecipeDto = {
    id?: number;
    name: string;
    productId: number;
    outputQuantity: number;
    yield: number;
    laborCost: number;
    overheadCost: number;
    estimatedCost: number;
    totalProduced?: number;
    totalOrders?: number;
    completedOrders?: number;
    completionPercentage?: number;
    items: RecipeItemDto[];
};

export type CreateRecipeRequest = RecipeDto & { version?: string };

export type CreateProductionOrderRequest = {
    recipeId: number;
    workCenter: string;
    plannedQuantity: number;
};

export type ProductionOrderDto = {
    id?: number;
    status: string;
    recipeId: number;
    workCenter: string;
    plannedQuantity: number;
    producedQuantity: number;
};

export type IssueItemDto = {
    productId: number;
    quantity: number;
    batchNumber?: string | null;
    expiryDate?: string | null;
};

export type IssueMaterialsRequest = { items: IssueItemDto[] };

export type OutputItemDto = {
    productId: number;
    quantity: number;
    batchNumber?: string | null;
    expiryDate?: string | null;
};

export type ReceiveOutputRequest = { items: OutputItemDto[] };

export const manufacturingApi = {
    // Recipes
    createRecipe: async (data: CreateRecipeRequest): Promise<RecipeDto> => {
        const payload = {
            ...data,
            version: data.version ?? 'v1',
            yield: data.yield ?? 1,
            laborCost: data.laborCost ?? 0,
            overheadCost: data.overheadCost ?? 0,
        };
        const res = await api.post<ApiResponse<RecipeDto>>('/manufacturing/recipes', payload);
        return (res.data as any)?.data ?? (res.data as any);
    },
    listRecipes: async (): Promise<RecipeDto[]> => {
        const res = await api.get<ApiResponse<RecipeDto[]>>('/manufacturing/recipes');
        const d: any = res.data;
        return d?.data ?? d;
    },
    getRecipe: async (id: number): Promise<RecipeDto> => {
        const res = await api.get<ApiResponse<RecipeDto>>(`/manufacturing/recipes/${id}`);
        const d: any = res.data;
        return d?.data ?? d;
    },
    updateRecipe: async (id: number, data: CreateRecipeRequest): Promise<RecipeDto> => {
        const payload = {
            ...data,
            version: data.version ?? 'v1',
            yield: data.yield ?? 1,
            laborCost: data.laborCost ?? 0,
            overheadCost: data.overheadCost ?? 0,
        };
        const res = await api.put<ApiResponse<RecipeDto>>(`/manufacturing/recipes/${id}`, payload);
        const d: any = res.data;
        return d?.data ?? d;
    },
    deleteRecipe: async (id: number): Promise<boolean> => {
        const res = await api.delete<ApiResponse<void>>(`/manufacturing/recipes/${id}`);
        return !!((res.data as any)?.success ?? true);
    },
    addCompletedQuantity: async (id: number, amount: number): Promise<RecipeDto> => {
        const res = await api.post<ApiResponse<RecipeDto>>(`/manufacturing/recipes/${id}/completed`, { amount });
        const d: any = res.data;
        return d?.data ?? d;
    },
    duplicateRecipe: async (id: number): Promise<RecipeDto> => {
        const res = await api.post<ApiResponse<RecipeDto>>(`/manufacturing/recipes/${id}/duplicate`);
        const d: any = res.data;
        return d?.data ?? d;
    },

    // Production orders
    createOrder: async (data: CreateProductionOrderRequest): Promise<ProductionOrderDto> => {
        const res = await api.post<ApiResponse<ProductionOrderDto>>('/manufacturing/orders', data);
        return (res.data as any)?.data ?? (res.data as any);
    },
    getOrder: async (id: number): Promise<ProductionOrderDto> => {
        const res = await api.get<ApiResponse<ProductionOrderDto>>(`/manufacturing/orders/${id}`);
        const d: any = res.data;
        return d?.data ?? d;
    },
    changeOrderStatus: async (id: number, status: string): Promise<ProductionOrderDto> => {
        const res = await api.put<ApiResponse<ProductionOrderDto>>(`/manufacturing/orders/${id}/status`, undefined, {params: {status}});
        const d: any = res.data;
        return d?.data ?? d;
    },
    listOrders: async (): Promise<ProductionOrderDto[]> => {
        const res = await api.get<ApiResponse<ProductionOrderDto[]>>('/manufacturing/orders');
        const d: any = res.data;
        return d?.data ?? d;
    },
    listOrdersPage: async (params: {
        page?: number;
        size?: number;
        status?: string;
        from?: string;
        to?: string;
    }): Promise<SpringPage<ProductionOrderDto>> => {
        const res = await api.get<ApiResponse<SpringPage<ProductionOrderDto>>>('/manufacturing/orders/page', {params});
        const d: any = res.data;
        return d?.data ?? d;
    },

    // Issue / Output
    issueMaterials: async (id: number, data: IssueMaterialsRequest): Promise<boolean> => {
        const res = await api.post<ApiResponse<void>>(`/manufacturing/orders/${id}/issue`, data);
        return !!res.data;
    },
    receiveOutput: async (id: number, data: ReceiveOutputRequest): Promise<boolean> => {
        const res = await api.post<ApiResponse<void>>(`/manufacturing/orders/${id}/output`, data);
        return !!res.data;
    },
};

export const customerApi = {
// Customer API functions
    getCustomers: async (): Promise<ApiResponse<Customer[]>> => {
        const res = await api.get<ApiResponse<Customer[]>>('/customers');
        return res.data;
    },

    getCustomerById: async(id: number): Promise<ApiResponse<Customer>> => {
        const res = await api.get<ApiResponse<Customer>>(`/customers/${id}`);
        return res.data;
    },

    createCustomer: async(customer: Customer): Promise<ApiResponse<Customer>> => {
        const res = await api.post<ApiResponse<Customer>>('/customers', customer);
        return res.data;
    },

    updateCustomer: async(id: number, customer: Customer): Promise<ApiResponse<Customer>> =>{
        return apiRequest<Customer>(`/customers/${id}`, 'PUT', customer);
    },

    deleteCustomer: async(id: number): Promise<ApiResponse<void>> =>{
        return apiRequest<void>(`/customers/${id}`, 'DELETE');
    },

    searchCustomers: async(query: string):Promise<ApiResponse<Customer>> =>{
        return api.get<ApiResponse<Customer>>(`/customers/search?q=${encodeURIComponent(query)}`).then((data) => {
            return data?.data;
        });
    }
};




// Add request interceptor to include auth token in requests
api.interceptors.request.use(
    (config) => {
        // Skip adding token for auth endpoints
        if (config.url?.includes('/auth/')) {
            return config;
        }

        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn('No token found for request:', config.url);
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is not 401 or it's a retry request, reject
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        // If we're already refreshing the token, add to queue
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({resolve, reject});
            })
                .then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                })
                .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const {accessToken, refreshToken} = await refreshAccessToken();

            // Update tokens in storage
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            // Process queued requests
            processQueue(null, accessToken);

            // Retry the original request
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
        } catch (error) {
            // If refresh fails, clear tokens and redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(error);
        } finally {
            isRefreshing = false;
        }
    }
);

// Track active requests to show loading state
let activeRequests = 0;

// Add request interceptor to show loading state
api.interceptors.request.use(
    (config) => {
        activeRequests++;
        if (activeRequests === 1) {
            // Show loading indicator on first request
            const loadingElement = document.getElementById('global-loading');
            if (loadingElement) {
                loadingElement.style.display = 'flex';
            }
        }
        return config;
    },
    (error) => {
        activeRequests--;
        return Promise.reject(error);
    }
);

// Store the current refresh token request to prevent multiple refresh attempts
let refreshTokenPromise: Promise<JwtResponse> | null = null;

// Add response interceptor to handle token expiration and server status
api.interceptors.response.use(
    (response) => {
        activeRequests--;
        if (activeRequests <= 0) {
            // Hide loading indicator when all requests are done
            const loadingElement = document.getElementById('global-loading');
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
        }
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Decrement active requests counter
        activeRequests = Math.max(0, activeRequests - 1);

        // Skip if there's no response (network error, etc.)
        if (!error.response) {
            console.error('Network error:', error);
            if (activeRequests <= 0) {
                const loadingElement = document.getElementById('global-loading');
                if (loadingElement) loadingElement.style.display = 'none';
            }
            toast.error('Serverga ulanib bo\'lmadi. Iltimos, internet aloqasini tekshiring.');
            return Promise.reject(error);
        }

        console.log('API Error:', {
            status: error.response.status,
            url: originalRequest?.url,
            method: originalRequest?.method,
            isRetry: originalRequest?._retry,
            isAuthRequest: originalRequest?.url?.includes('/auth/')
        });

        // Don't process the error if it's already been processed or if it's a refresh token request
        if (error.response.status === 401 && originalRequest?.url?.includes('/auth/refresh-token')) {
            console.error('Refresh token failed, logging out...');
            // If refresh token fails, logout the user
            logout();
            return Promise.reject(error);
        }

        // Handle 401 Unauthorized with token refresh
        if (error.response.status === 401 && originalRequest && !originalRequest._retry) {
            console.log('Attempting token refresh...');
            originalRequest._retry = true;

            try {
                // Try to refresh the token
                const {token} = await refreshToken();
                console.log('Token refresh successful, retrying original request...');

                if (token) {
                    // Update the authorization header
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    // Retry the original request
                    return api(originalRequest);
                } else {
                    throw new Error('No token received from refresh');
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                // If refresh fails, logout the user
                logout();
                return Promise.reject(refreshError);
            }
        }

        // Hide loading indicator when all requests are done
        if (activeRequests <= 0) {
            const loadingElement = document.getElementById('global-loading');
            if (loadingElement) loadingElement.style.display = 'none';
        }

        // Handle network errors (server offline)
        if (!error.response) {
            toast.error('Serverga ulanib bo\'lmadi. Iltimos, internet aloqasini tekshiring.');
            return Promise.reject(error);
        }

        // Show error message from server if available
        const errorMessage = error.response.data?.message || 'Xatolik yuz berdi';
        if (error.response.status !== 401) { // Don't show error for 401 as we handle it above
            toast.error(errorMessage);
        }

        return Promise.reject(error);
    }
);

// Authentication services
export interface LoginRequest {
    username: string;
    password: string;
}

export interface JwtResponse {
    token: string;
    refreshToken: string;
    expiresIn: number;
}

export interface CommonApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

// Using CommonApiResponse as ApiResponse for consistency with backend
export type ApiResponse<T> = CommonApiResponse<T>;

interface AuthResponse {
    token?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
    data?: {
        token?: string;
        accessToken?: string;
        refreshToken?: string;
        expiresIn?: number;
    };
    success?: boolean;
    message?: string;
}

export async function login(credentials: LoginRequest): Promise<JwtResponse> {
    try {
        console.log('Starting login process...');
        console.log('Sending login request to:', `${API_BASE_URL}/auth/login`);
        console.log('Credentials:', {
            ...credentials,
            password: credentials.password ? '***' : 'undefined'
        });

        // Clear any existing tokens before login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpiresAt');

        // Create a clean axios instance for the login request
        const loginApi = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true, // Important for CORS with credentials
            timeout: 10000 // 10 seconds timeout
        });

        console.log('Making login request...');
        const response = await loginApi.post<AuthResponse>(
            `${API_BASE}${API_VERSION}/auth/signin`,
            credentials
        );

        console.log('Login response received:', {
            status: response.status,
            statusText: response.statusText,
            data: response.data
        });

        // Extract tokens from different possible response structures
        const responseData = response.data;
        const token = responseData.token || responseData.accessToken || responseData.data?.token || responseData.data?.accessToken;
        const refreshToken = responseData.refreshToken || responseData.data?.refreshToken;
        const expiresIn = responseData.expiresIn || responseData.data?.expiresIn || 3600; // Default to 1 hour

        if (!token) {
            console.error('No token found in response:', responseData);
            throw new Error('Authentication failed: No token received from server');
        }

        // Create the auth data object
        const authData: JwtResponse = {
            token,
            refreshToken: refreshToken || '',
            expiresIn
        };

        console.log('Storing auth data...');
        storeAuthData(authData);

        // Set default authorization header for subsequent requests
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        console.log('Login process completed successfully');
        return authData;
    } catch (error) {
        console.error('Login error:', error);

        // Clear any partial auth data on error
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpiresAt');

        if (axios.isAxiosError(error)) {
            console.error('Axios error details:', {
                message: error.message,
                code: error.code,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers,
                    data: error.config?.data
                },
                response: error.response ? {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data
                } : 'No response',
                request: error.request ? 'Request was made but no response received' : 'No request was made'
            });

            let errorMessage = 'Authentication failed';
            if (error.code === 'ECONNABORTED') {
                errorMessage = 'Request timeout. Please check your internet connection.';
            } else if (!error.response) {
                errorMessage = 'Cannot connect to server. Please check your internet connection or try again later.';
            } else if (error.response.status === 401) {
                errorMessage = 'Invalid username or password';
            } else if (error.response.data?.message) {
                errorMessage = error.response.data.message;
            } else {
                errorMessage = error.message || 'An unknown error occurred';
            }

            throw new Error(errorMessage);
        }

        throw error instanceof Error
            ? error
            : new Error('An unexpected error occurred during login');
    }
}

export async function refreshToken(): Promise<JwtResponse> {
    console.log('Starting token refresh...');

    // If we already have a refresh request in progress, return that promise
    if (refreshTokenPromise) {
        console.log('Using existing refresh token request');
        return refreshTokenPromise;
    }

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        console.error('No refresh token available');
        logout();
        throw new Error('No refresh token available');
    }

    refreshTokenPromise = new Promise(async (resolve, reject) => {
        try {
            console.log('Sending refresh token request...');
            const response = await axios.post<CommonApiResponse<JwtResponse>>(
                `/auth/refresh-token`,
                {refreshToken},
                {
                    skipAuthRefresh: true, // Prevent infinite refresh loops
                    headers: {
                        'X-Skip-Auth': 'true' // Additional header to identify refresh requests
                    }
                }
            );

            console.log('Refresh token response:', response.data);

            if (response.data.success && response.data.data) {
                console.log('Token refresh successful, updating tokens...');
                // Update tokens in localStorage
                storeAuthData(response.data.data);
                resolve(response.data.data);
            } else {
                const errorMsg = response.data.message || 'Token refresh failed';
                console.error('Token refresh failed:', errorMsg);
                throw new Error(errorMsg);
            }
        } catch (error) {
            console.error('Error during token refresh:', error);
            // Clear tokens on refresh failure
            logout();
            reject(error);
        } finally {
            refreshTokenPromise = null;
        }
    });

    return refreshTokenPromise;
}

function storeAuthData(authData: JwtResponse) {
    localStorage.setItem('token', authData.token);
    localStorage.setItem('refreshToken', authData.refreshToken);
    // Store expiration time (current time + expiresIn seconds)
    const expiresAt = Date.now() + (authData.expiresIn * 1000);
    localStorage.setItem('tokenExpiresAt', expiresAt.toString());
}


export function logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiresAt');
    window.location.href = '/login';
}

export function getToken(): string | null {
    return localStorage.getItem('token');
}

export async function isAuthenticated(): Promise<boolean> {
    const token = getToken();
    if (!token) return false;

    // Check if token is expired
    const expiresAt = localStorage.getItem('tokenExpiresAt');
    const isExpired = expiresAt && parseInt(expiresAt) < Date.now();

    if (!isExpired) return true;

    // If token is expired, try to refresh it
    try {
        await refreshToken();
        return true;
    } catch (error) {
        console.error('Failed to refresh token:', error);
        logout();
        return false;
    }
}

// src/lib/api.ts

export const refreshAccessToken = async (): Promise<{ accessToken: string; refreshToken: string }> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    const response = await api.post('/auth/refresh-token', {}, {
        headers: {
            'Authorization': `Bearer ${refreshToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    return data.data; // { accessToken, refreshToken, expiresIn }
};
export default api;
