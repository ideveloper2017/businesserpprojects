import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft, Edit, Trash2, Star, Package, Clock, Check, X } from 'lucide-react';
import warehouseService from '@/services/warehouseService';
import { Warehouse } from '@/types/warehouse';
import { useConfirm } from '@/hooks/use-confirm';

export default function WarehouseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [settingDefault, setSettingDefault] = useState(false);
  
  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'This action cannot be undone. This will permanently delete the warehouse and all its inventory data.'
  );

  useEffect(() => {
    const loadWarehouse = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await warehouseService.getWarehouse(parseInt(id));
        setWarehouse(response.data);
      } catch (error) {
        console.error('Failed to load warehouse:', error);
        toast({
          title: 'Error',
          description: 'Failed to load warehouse data',
          variant: 'destructive',
        });
        navigate('/warehouses');
      } finally {
        setLoading(false);
      }
    };

    loadWarehouse();
  }, [id, navigate, toast]);

  const handleDelete = async () => {
    if (!id) return;
    
    if (await confirm()) {
      try {
        setDeleting(true);
        await warehouseService.deleteWarehouse(parseInt(id));
        toast({
          title: 'Success',
          description: 'Warehouse deleted successfully',
        });
        navigate('/warehouses');
      } catch (error) {
        console.error('Failed to delete warehouse:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete warehouse',
          variant: 'destructive',
        });
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleToggleStatus = async () => {
    if (!id || !warehouse) return;
    
    try {
      setTogglingStatus(true);
      await warehouseService.toggleStatus(parseInt(id), !warehouse.isActive);
      setWarehouse({
        ...warehouse,
        isActive: !warehouse.isActive,
      });
      toast({
        title: 'Success',
        description: `Warehouse ${warehouse.isActive ? 'deactivated' : 'activated'} successfully`,
      });
    } catch (error) {
      console.error('Failed to toggle warehouse status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update warehouse status',
        variant: 'destructive',
      });
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleSetDefault = async () => {
    if (!id || !warehouse) return;
    
    try {
      setSettingDefault(true);
      await warehouseService.setDefaultWarehouse(parseInt(id));
      setWarehouse({
        ...warehouse,
        isDefault: true,
      });
      toast({
        title: 'Success',
        description: 'Default warehouse updated successfully',
      });
    } catch (error) {
      console.error('Failed to set default warehouse:', error);
      toast({
        title: 'Error',
        description: 'Failed to set default warehouse',
        variant: 'destructive',
      });
    } finally {
      setSettingDefault(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center space-x-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Loading warehouse details...</span>
        </div>
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="container mx-auto py-6">
        <p>Warehouse not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate('/warehouses')}
          className="px-0"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Warehouses
        </Button>
        
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/warehouses/${warehouse.id}/edit`)}
            disabled={deleting || togglingStatus}
          >
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button
            variant="outline"
            onClick={handleToggleStatus}
            disabled={deleting || togglingStatus || settingDefault}
          >
            {togglingStatus ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : warehouse.isActive ? (
              <X className="mr-2 h-4 w-4" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            {warehouse.isActive ? 'Deactivate' : 'Activate'}
          </Button>
          {!warehouse.isDefault && (
            <Button
              variant="outline"
              onClick={handleSetDefault}
              disabled={settingDefault || togglingStatus}
            >
              {settingDefault ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Star className="mr-2 h-4 w-4" />
              )}
              Set as Default
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting || togglingStatus || settingDefault}
          >
            {deleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  {warehouse.name}
                  {warehouse.isDefault && (
                    <Badge variant="outline" className="text-amber-500 border-amber-500">
                      <Star className="h-3.5 w-3.5 mr-1 fill-amber-500" />
                      Default
                    </Badge>
                  )}
                  <Badge variant={warehouse.isActive ? 'default' : 'secondary'}>
                    {warehouse.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </CardTitle>
                <CardDescription>Warehouse Details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Warehouse Name</h3>
                <p>{warehouse.name}</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <div>
                  <Badge variant={warehouse.isActive ? 'default' : 'secondary'}>
                    {warehouse.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Default Warehouse</h3>
                <div>
                  {warehouse.isDefault ? (
                    <Badge variant="outline" className="text-amber-500 border-amber-500">
                      <Star className="h-3.5 w-3.5 mr-1 fill-amber-500" />
                      Default
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">No</span>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                <p>{new Date(warehouse.createdAt).toLocaleString()}</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                <p>{new Date(warehouse.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Summary</CardTitle>
            <CardDescription>Overview of items in this warehouse</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="p-3 rounded-full bg-primary/10">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
                  <X className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <ConfirmDialog />
    </div>
  );
}
