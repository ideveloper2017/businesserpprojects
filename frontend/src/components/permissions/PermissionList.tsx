import React, { useEffect, useMemo, useState } from 'react';
import { permissionApi } from '@/lib/api';
import { Permission } from '@/types/user.types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';

const PermissionList: React.FC<{ onEdit: (permission: Permission) => void }> = ({ onEdit }) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const selectedPermissionIds = useMemo(() => {
    return Object.keys(rowSelection)
      .filter((key) => (rowSelection as any)[key])
      .map((key) => {
        const index = Number(key);
        const row = permissions[index];
        return row?.id;
      })
      .filter((id): id is number => typeof id === 'number');
  }, [rowSelection, permissions]);

  // Selection handled by DataTable via rowSelection

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await permissionApi.getAll();
      setPermissions(response.data);
    } catch (error) {
      toast.error('Failed to fetch permissions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this permission?')) return;

    try {
      await permissionApi.delete(id);
      setPermissions(permissions.filter(permission => permission.id !== id));
      setRowSelection({});
      toast.success('Permission deleted successfully');
    } catch (error) {
      toast.error('Failed to delete permission');
      console.error(error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPermissionIds.length === 0) {
      toast.info('No permissions selected');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedPermissionIds.length} selected permission(s)?`)) return;

    try {
      let successCount = 0;
      let failCount = 0;

      // Process deletions sequentially to handle errors individually
      for (const permissionId of selectedPermissionIds) {
        try {
          await permissionApi.delete(permissionId);
          successCount++;
        } catch (error) {
          failCount++;
          console.error(`Error deleting permission ID ${permissionId}:`, error);
        }
      }

      // Update the UI and notify the user
      if (successCount > 0) {
        setPermissions(permissions.filter(permission => !selectedPermissionIds.includes(permission.id)));
        setRowSelection({});
        toast.success(`Successfully deleted ${successCount} permission(s)`);
      }

      if (failCount > 0) {
        toast.error(`Failed to delete ${failCount} permission(s)`);
      }

      // Refresh the list
      fetchPermissions();
    } catch (error) {
      toast.error('An error occurred during bulk deletion');
      console.error('Error during bulk deletion:', error);
    }
  };

  const columns: ColumnDef<Permission>[] = useMemo(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(val) => table.toggleAllPageRowsSelected(!!val)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(val) => row.toggleSelected(!!val)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Name' },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => row.original.description || '-',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(row.original)}>Edit</Button>
          <Button variant="destructive" size="sm" onClick={() => handleDelete(row.original.id)}>Delete</Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ], [onEdit]);

  if (loading) {
    return <div className="flex justify-center p-4">Loading permissions...</div>;
  }

  return (
    <div className="space-y-4">
      {selectedPermissionIds.length > 0 && (
        <div className="flex justify-between items-center py-2">
          <span className="text-sm">{selectedPermissionIds.length} permission(s) selected</span>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>Delete Selected</Button>
        </div>
      )}
      <DataTable<Permission, any>
        columns={columns}
        data={permissions}
        pageSize={10}
        rowSelection={rowSelection}
        onRowSelectionChange={(updater) => setRowSelection(updater)}
      />
    </div>
  );
}
;

export default PermissionList;
