import React, { useEffect, useMemo, useState } from 'react';
import { userApi } from '../../lib/api';
import { User } from '../../types/user.types';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { Checkbox } from '../ui/checkbox';
import { DataTable } from '../ui/data-table';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';

interface UserListProps {
  onEdit: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({ onEdit }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const selectedUserIds = useMemo(() => {
    return Object.keys(rowSelection)
      .filter((key) => (rowSelection as any)[key])
      .map((key) => {
        const index = Number(key);
        const row = users[index];
        return row?.id;
      })
      .filter((id): id is number => typeof id === 'number');
  }, [rowSelection, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userApi.getAll();
      if (response.data) {
        setUsers(response.data);
      } else {
        console.error('Unexpected API response format:', response);
        toast.error('Received unexpected data format from server');
      }
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await userApi.delete(id);
      if (response.data?.success) {
        setUsers(users.filter(user => user.id !== id));
        setRowSelection({});
        toast.success('User deleted successfully');
      } else {
        throw new Error(response.data?.error || 'Failed to delete user');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
      toast.error(errorMessage);
      console.error('Error deleting user:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUserIds.length === 0) {
      toast.info('No users selected');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedUserIds.length} selected user(s)?`)) return;

    try {
      let successCount = 0;
      let failCount = 0;

      // Process deletions sequentially to handle errors individually
      for (const userId of selectedUserIds) {
        try {
          const response = await userApi.delete(userId);
          if (response.data?.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
          console.error(`Error deleting user ID ${userId}:`, error);
        }
      }

      // Update the UI and notify the user
      if (successCount > 0) {
        setUsers(users.filter(user => !selectedUserIds.includes(user.id)));
        setRowSelection({});
        toast.success(`Successfully deleted ${successCount} user(s)`);
      }

      if (failCount > 0) {
        toast.error(`Failed to delete ${failCount} user(s)`);
      }

      // Refresh the list
      fetchUsers();
    } catch (error) {
      toast.error('An error occurred during bulk deletion');
      console.error('Error during bulk deletion:', error);
    }
  };

  const columns: ColumnDef<User>[] = useMemo(() => [
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
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'username',
      header: 'Username',
    },
    {
      id: 'fullName',
      header: 'Full Name',
      cell: ({ row }) => `${row.original.firstName ?? ''} ${row.original.lastName ?? ''}`.trim(),
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded text-xs ${row.original.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {row.original.active ? 'Active' : 'Inactive'}
        </span>
      ),
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
    return <div className="flex justify-center p-4">Loading users...</div>;
  }

  return (
    <div className="space-y-4">
      {selectedUserIds.length > 0 && (
        <div className="flex justify-between items-center py-2">
          <span className="text-sm">{selectedUserIds.length} user(s) selected</span>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>Delete Selected</Button>
        </div>
      )}
      <DataTable<User, any>
        columns={columns}
        data={users}
        pageSize={10}
        rowSelection={rowSelection}
        onRowSelectionChange={(updater) => setRowSelection(updater)}
      />
    </div>
  );
};

export default UserList;