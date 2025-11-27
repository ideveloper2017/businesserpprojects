import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWarehouses } from '@/hooks/useWarehouses';
import { formatDate } from '@/utils/formatters';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

export const WarehouseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useWarehouse, deleteWarehouse } = useWarehouses();

  const { data: warehouseData, isLoading } = useWarehouse(parseInt(id || '0'));
  const warehouse = warehouseData?.data;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this warehouse?')) {
      try {
        await deleteWarehouse.mutateAsync(parseInt(id || '0'));
        navigate('/warehouses');
      } catch (error) {
        console.error('Error deleting warehouse:', error);
      }
    }
  };

  if (isLoading) {
    return <div>Loading warehouse details...</div>;
  }

  if (!warehouse) {
    return <div>Warehouse not found</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="px-0"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Warehouses
        </Button>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/warehouses/${id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Warehouse Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
              <p className="text-base">{warehouse.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Code</h3>
              <p className="text-base">{warehouse.code}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Status
              </h3>
              <div className="flex items-center">
                <div
                  className={`h-2 w-2 rounded-full mr-2 ${
                    warehouse.isActive ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                />
                <span>{warehouse.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {warehouse.address && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Address
                </h3>
                <p className="text-base whitespace-pre-line">
                  {warehouse.address}
                </p>
              </div>
            )}
            {warehouse.phone && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Phone
                </h3>
                <p className="text-base">{warehouse.phone}</p>
              </div>
            )}
            {warehouse.email && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Email
                </h3>
                <p className="text-base">{warehouse.email}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Created At
            </h3>
            <p className="text-base">
              {formatDate(warehouse.createdAt, 'PPpp')}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Last Updated
            </h3>
            <p className="text-base">
              {formatDate(warehouse.updatedAt, 'PPpp')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
