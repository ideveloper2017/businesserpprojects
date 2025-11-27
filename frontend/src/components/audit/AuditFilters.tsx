import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuditFilterParams, AuditStatus } from '@/types/audit.types';

interface Props {
  initial?: AuditFilterParams;
  onChange: (filters: AuditFilterParams) => void;
}

const statuses: AuditStatus[] = ['SUCCESS', 'FAILURE', 'INFO', 'WARNING'];

export const AuditFilters: React.FC<Props> = ({ initial, onChange }) => {
  const [filters, setFilters] = useState<AuditFilterParams>({
    search: initial?.search || '',
    actor: initial?.actor || '',
    action: initial?.action || '',
    resource: initial?.resource || '',
    status: initial?.status,
    startDate: initial?.startDate,
    endDate: initial?.endDate,
  });

  const apply = () => onChange(filters);
  const reset = () => {
    const cleared: AuditFilterParams = {};
    setFilters(cleared);
    onChange(cleared);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
      <div className="space-y-1">
        <Label htmlFor="search">Search</Label>
        <Input id="search" value={filters.search || ''} onChange={(e)=>setFilters({...filters, search: e.target.value})} placeholder="search text"/>
      </div>
      <div className="space-y-1">
        <Label htmlFor="actor">Actor</Label>
        <Input id="actor" value={filters.actor || ''} onChange={(e)=>setFilters({...filters, actor: e.target.value})} placeholder="user or id"/>
      </div>
      <div className="space-y-1">
        <Label htmlFor="action">Action</Label>
        <Input id="action" value={filters.action || ''} onChange={(e)=>setFilters({...filters, action: e.target.value})} placeholder="e.g. LOGIN"/>
      </div>
      <div className="space-y-1">
        <Label htmlFor="resource">Resource</Label>
        <Input id="resource" value={filters.resource || ''} onChange={(e)=>setFilters({...filters, resource: e.target.value})} placeholder="e.g. USER"/>
      </div>
      <div className="space-y-1">
        <Label htmlFor="status">Status</Label>
        <select id="status" className="border rounded h-10 px-2 bg-background" value={filters.status || ''} onChange={(e)=>setFilters({...filters, status: (e.target.value || undefined) as AuditStatus | undefined})}>
          <option value="">All</option>
          {statuses.map(s => (<option key={s} value={s}>{s}</option>))}
        </select>
      </div>
      <div className="flex items-end space-x-2">
        <Button variant="outline" onClick={reset}>Clear</Button>
        <Button onClick={apply}>Apply</Button>
      </div>
      <div className="space-y-1 md:col-span-3">
        <Label>Date Range</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input type="date" value={filters.startDate?.slice(0,10) || ''} onChange={(e)=>setFilters({...filters, startDate: e.target.value ? new Date(e.target.value).toISOString() : undefined})}/>
          <Input type="date" value={filters.endDate?.slice(0,10) || ''} onChange={(e)=>setFilters({...filters, endDate: e.target.value ? new Date(e.target.value).toISOString() : undefined})}/>
        </div>
      </div>
    </div>
  );
};
