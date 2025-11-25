export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiError extends Error {
  response?: {
    status: number;
    data: {
      message: string;
      errors?: Record<string, string[]>;
      timestamp: string;
      path: string;
    };
  };
}

export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}
