import React, { useEffect, useState } from 'react';
import { auditApi } from '@/lib/api';
import { AuditFilterParams, AuditLog } from '@/types/audit.types';
import { AuditFilters } from '@/components/audit/AuditFilters';
import { AuditLogList } from '@/components/audit/AuditLogList';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const AuditLogsPage: React.FC = () => {
  const [filters, setFilters] = useState<AuditFilterParams>({});
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await auditApi.getAll(filters);
      if (Array.isArray(res)) {
        setLogs(res);
      } else {
        setLogs(res.content);
      }
    } catch (e) {
      console.error('Failed to load audit logs', e);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  const onExport = async () => {
    try {
      await auditApi.export(filters, 'csv');
    } catch (e) {
      console.error('Export failed', e);
      toast.error('Export failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Audit Logs</h1>
        <Button variant="outline" onClick={onExport}>Export CSV</Button>
      </div>
      <AuditFilters initial={filters} onChange={setFilters} />
      {loading ? (
        <div className="flex justify-center p-6">Loading...</div>
      ) : (
        <AuditLogList data={logs} />
      )}
    </div>
  );
};

export default AuditLogsPage;
