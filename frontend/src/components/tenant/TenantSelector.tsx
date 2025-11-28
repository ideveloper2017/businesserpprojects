import { useEffect, useMemo, useState } from 'react';

import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

export function TenantSelector() {
  const [tenantId, setTenantId] = useState<string>('');

  const tenants = useMemo(() => {
    const envTenants = (import.meta as any).env?.VITE_TENANTS;
    if (envTenants) {
      try {
        const parsed = JSON.parse(envTenants);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (err) {
        return envTenants.split(',').map((item: string) => item.trim()).filter(Boolean);
      }
      return envTenants.split(',').map((item: string) => item.trim()).filter(Boolean);
    }
    return ['default', 'demo', 'enterprise'];
  }, []);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('tenantId') : '';
    const fallback = (import.meta as any).env?.VITE_DEFAULT_TENANT_ID || '';
    const initial = saved || fallback || tenants[0] || 'default';
    setTenantId(initial);
  }, []);

  const handleSelect = (value: string) => {
    setTenantId(value);
    if (typeof window !== 'undefined') {
      if (value) {
        localStorage.setItem('tenantId', value);
      } else {
        localStorage.removeItem('tenantId');
      }
      window.location.reload();
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs text-muted-foreground">Tenant</label>
      <Select value={tenantId} onValueChange={handleSelect}>
        <SelectTrigger className="w-full text-sm">
          <SelectValue placeholder="Select tenant" />
        </SelectTrigger>
        <SelectContent>
          {tenants.map((tenant: string) => (
            <SelectItem key={tenant} value={tenant}>
              {tenant}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
