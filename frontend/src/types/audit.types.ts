export type AuditStatus = 'SUCCESS' | 'FAILURE' | 'INFO' | 'WARNING';

export interface AuditLog {
  id: number;
  timestamp: string; // ISO string
  actorId?: number;
  actorName?: string;
  action: string;
  resource?: string;
  resourceId?: string | number;
  status?: AuditStatus;
  ip?: string;
  userAgent?: string;
  details?: string;
}

export interface AuditFilterParams {
  search?: string;
  actor?: string;
  action?: string;
  resource?: string;
  status?: AuditStatus;
  startDate?: string; // ISO
  endDate?: string;   // ISO
  page?: number;
  size?: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}
