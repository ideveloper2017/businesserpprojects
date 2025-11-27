import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useWarehouses } from '@/hooks/useWarehouses';
import { formatDate } from '@/utils/formatters';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const WarehouseList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const {
    warehouses: warehousesData = [],
    pagination = { currentPage: 1, totalPages: 1, totalItems: 0, hasNext: false, hasPrevious: false },
    isLoading,
    error,
    fetchWarehouses,
    deleteWarehouse,
  } = useWarehouses();

  const warehouses = Array.isArray(warehousesData) ? warehousesData : [];

  // Memoize the loadWarehouses function
  const loadWarehouses = useCallback(async () => {
    try {
      await fetchWarehouses({
        page,
        size: pageSize,
        search: searchTerm || undefined,
      });
    } catch (err) {
      console.error('Error loading warehouses:', err);
      toast.error('Failed to load warehouses');
    }
  }, [page, searchTerm, pageSize, fetchWarehouses]);

  // Load warehouses when component mounts or dependencies change
  useEffect(() => {
    loadWarehouses();
  }, [loadWarehouses]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  }, []);

  const handleDelete = useCallback(
      async (id: number) => {
        if (window.confirm('Are you sure you want to delete this warehouse?')) {
          try {
            await deleteWarehouse(id);
            toast.success('Warehouse deleted successfully');
            await loadWarehouses(); // Refresh after deletion
          } catch (err) {
            console.error('Error deleting warehouse:', err);
            toast.error('Failed to delete warehouse');
          }
        }
      },
      [deleteWarehouse, loadWarehouses]
  );

  if (isLoading && page === 1) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="text-red-500 p-4">
          Error loading warehouses: {error.message}
        </div>
    );
  }

  if (warehouses.length === 0 && !isLoading) {
    return (
        <div className="container mx-auto py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold">Warehouses</h1>
            <div className="flex w-full md:w-auto gap-2">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search warehouses..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={handleSearch}
                />
              </div>
              <Button onClick={() => navigate('/warehouses/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Add Warehouse
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center h-64 rounded-md border">
            <p className="text-muted-foreground mb-4">No warehouses found</p>
            <Button onClick={() => navigate('/warehouses/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Warehouse
            </Button>
          </div>
        </div>
    );
  }

  return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Warehouses</h1>
          <div className="flex w-full md:w-auto gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                  type="search"
                  placeholder="Search warehouses..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={handleSearch}
              />
            </div>
            <Button onClick={() => navigate('/warehouses/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Warehouse
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warehouses.length > 0 ? (
                  warehouses.map((warehouse) => (
                      <TableRow key={warehouse.id}>
                        <TableCell className="font-medium">{warehouse.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Switch checked={warehouse.isActive} disabled className="mr-2" />
                            <span>{warehouse.isActive ? 'Active' : 'Inactive'}</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(warehouse.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/warehouses/${warehouse.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(warehouse.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                  ))
              ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                      No warehouses found
                    </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between px-2 mt-4">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{' '}
            <span className="font-medium">{Math.min(page * pageSize, pagination.totalItems)}</span>{' '}
            of <span className="font-medium">{pagination.totalItems}</span> warehouses
          </div>
          <div className="flex items-center space-x-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevious || isLoading}
            >
              Previous
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNext || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
  );
};

export default WarehouseList;