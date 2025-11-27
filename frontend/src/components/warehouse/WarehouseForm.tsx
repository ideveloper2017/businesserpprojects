import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useWarehouses } from '@/hooks/useWarehouses';
import { toast } from 'sonner';
import {Warehouse} from "@/types/warehouse";

const warehouseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().optional()
});

type WarehouseFormValues = z.infer<typeof warehouseSchema>;

const WarehouseForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { fetchWarehouse, createWarehouse, updateWarehouse, isLoading } = useWarehouses();
  const [warehouseData, setWarehouseData] = useState<Warehouse | null>(null);

  // Fetch warehouse data when in edit mode
  useEffect(() => {
    const loadWarehouse = async () => {
      if (isEditMode && id) {
        try {
          const data = await fetchWarehouse(parseInt(id));
          setWarehouseData(data);
        } catch (error) {
          console.error('Failed to fetch warehouse:', error);
        }
      }
    };

    loadWarehouse();
  }, [isEditMode, id, fetchWarehouse]);

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: '',
      isDefault: false,
      isActive: true,
    },
  });

  // Set form values when in edit mode
  useEffect(() => {
    if (!isEditMode || !warehouseData) return;
    
    const { name, isActive } = warehouseData;
    const formValues = {
      name,
      isActive,
      isDefault: false, // Always set to false to prevent multiple defaults
    };
    
    // Only reset if values have changed
    const currentValues = form.getValues();
    if (JSON.stringify(currentValues) !== JSON.stringify(formValues)) {
      form.reset(formValues);
    }
  }, [isEditMode, warehouseData, form]);

  const onSubmit = async (data: WarehouseFormValues) => {
    try {
      if (isEditMode && id) {
        await updateWarehouse(parseInt(id), data);
        toast('Warehouse updated successfully');
      } else {
        await createWarehouse(data);
        toast('Warehouse created successfully');
      }
      // Navigation is handled by the success callback in the hook
    } catch (error) {
      console.error('Error in form submission:', error);
      // Error is already handled by the hook
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {isEditMode ? 'Edit Warehouse' : 'Add New Warehouse'}
        </h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Warehouse Name *
              </label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Enter warehouse name"
              />
              {form.formState.errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={form.watch('isActive')}
                onCheckedChange={(checked) =>
                  form.setValue('isActive', checked)
                }
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Active
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/warehouses')}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={form.formState.isSubmitting || isLoading}
            className="min-w-[150px]"
          >
            {form.formState.isSubmitting || isLoading
              ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </div>
              ) : isEditMode 
                ? 'Update Warehouse' 
                : 'Create Warehouse'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export { WarehouseForm };
