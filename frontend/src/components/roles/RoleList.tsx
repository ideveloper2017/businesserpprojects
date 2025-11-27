import React, { useEffect, useMemo, useState } from 'react';
import { roleApi } from '@/lib/api';
import { Role } from '@/types/user.types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';

const RoleList: React.FC<{ onEdit: (role: Role) => void }> = ({ onEdit }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const selectedRoleIds = useMemo(() => {
    return Object.keys(rowSelection)
      .filter((key) => (rowSelection as any)[key])
      .map((key) => {
        const index = Number(key);
        const row = roles[index];
        return row?.id;
      })
      .filter((id): id is number => typeof id === 'number');
  }, [rowSelection, roles]);

  // Selection handled by DataTable via rowSelection

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await roleApi.getAll();
      setRoles(response.data);
    } catch (error) {
      toast.error('Failed to fetch roles');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      await roleApi.delete(id);
      setRoles(roles.filter(role => role.id !== id));
      setRowSelection({});
      toast.success('Role deleted successfully');
    } catch (error) {
      toast.error('Failed to delete role');
      console.error(error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRoleIds.length === 0) {
      toast.info('No roles selected');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedRoleIds.length} selected role(s)?`)) return;

    try {
      let successCount = 0;
      let failCount = 0;

      // Process deletions sequentially to handle errors individually
      for (const roleId of selectedRoleIds) {
        try {
          await roleApi.delete(roleId);
          successCount++;
        } catch (error) {
          failCount++;
          console.error(`Error deleting role ID ${roleId}:`, error);
        }
      }

      // Update the UI and notify the user
      if (successCount > 0) {
        setRoles(roles.filter(role => !selectedRoleIds.includes(role.id)));
        setRowSelection({});
        toast.success(`Successfully deleted ${successCount} role(s)`);
      }

      if (failCount > 0) {
        toast.error(`Failed to delete ${failCount} role(s)`);
      }

      // Refresh the list
      fetchRoles();
    } catch (error) {
      toast.error('An error occurred during bulk deletion');
      console.error('Error during bulk deletion:', error);
    }
  };

  const columns: ColumnDef<Role>[] = useMemo(() => [
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
      id: 'permissionsCount',
      header: 'Permissions',
      cell: ({ row }) => `${(row.original.permissionIds || []).length} permissions`,
      enableSorting: false,
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
    return <div className="flex justify-center p-4">Loading roles...</div>;
  }

  return (
    <div className="space-y-4">
      {selectedRoleIds.length > 0 && (
        <div className="flex justify-between items-center py-2">
          <span className="text-sm">{selectedRoleIds.length} role(s) selected</span>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>Delete Selected</Button>
        </div>
      )}
      <DataTable<Role, any>
        columns={columns}
        data={roles}
        pageSize={10}
        rowSelection={rowSelection}
        onRowSelectionChange={(updater) => setRowSelection(updater)}
      />
    </div>
  );
};

export default RoleList;
