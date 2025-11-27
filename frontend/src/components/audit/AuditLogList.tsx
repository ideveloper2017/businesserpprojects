import React, { useMemo } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { AuditLog } from '@/types/audit.types';

interface Props {
  data: AuditLog[];
}

export const AuditLogList: React.FC<Props> = ({ data }) => {
  const columns: ColumnDef<AuditLog>[] = useMemo(() => [
    { accessorKey: 'timestamp', header: 'Date/Time', cell: ({ row }) => new Date(row.original.timestamp).toLocaleString() },
    { accessorKey: 'actorName', header: 'Actor', cell: ({ row }) => row.original.actorName || row.original.actorId || '-' },
    { accessorKey: 'action', header: 'Action' },
    { accessorKey: 'resource', header: 'Resource' },
    { accessorKey: 'status', header: 'Status' },
    { accessorKey: 'ip', header: 'IP' },
    { accessorKey: 'userAgent', header: 'User Agent', cell: ({ row }) => <span className="truncate inline-block max-w-[240px]" title={row.original.userAgent}>{row.original.userAgent || '-'}</span> },
    { accessorKey: 'details', header: 'Details', cell: ({ row }) => <span className="truncate inline-block max-w-[240px]" title={row.original.details}>{row.original.details || '-'}</span> },
  ], []);

  return (
    <DataTable<AuditLog, any>
      columns={columns}
      data={data}
      pageSize={10}
    />
  );
};
