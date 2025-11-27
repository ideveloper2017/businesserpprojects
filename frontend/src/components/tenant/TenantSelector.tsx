import { useEffect, useState } from 'react';

export function TenantSelector() {
  const [tenantId, setTenantId] = useState<string>('');

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('tenantId') : '';
    const fallback = (import.meta as any).env?.VITE_DEFAULT_TENANT_ID || '';
    setTenantId(saved || fallback || 'default');
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTenantId(value);
  };

  const apply = () => {
    if (typeof window !== 'undefined') {
      if (tenantId) {
        localStorage.setItem('tenantId', tenantId);
      } else {
        localStorage.removeItem('tenantId');
      }
      window.location.reload();
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs text-muted-foreground">Tenant</label>
      <div className="flex gap-2">
        <input
          className="flex-1 px-2 py-1 text-sm rounded-md border"
          placeholder="Enter tenant id"
          value={tenantId}
          onChange={handleChange}
        />
        <button
          type="button"
          className="px-2 py-1 text-sm rounded-md bg-primary text-primary-foreground"
          onClick={apply}
        >
          Apply
        </button>
      </div>
    </div>
  );
}
