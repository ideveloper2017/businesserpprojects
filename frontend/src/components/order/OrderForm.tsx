import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Order, OrderItem, OrderStatus } from '@/types/order.types';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { Plus, Trash2 } from 'lucide-react';
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {Customer} from "@/lib/api.ts";

const formSchema = z.object({
  customerId: z.number().min(1, 'Customer is required'),
  status: z.enum(['pending', 'completed', 'cancelled'] as const),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      id: z.number().optional(),
      productId: z.number().min(1, 'Product is required'),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
      unitPrice: z.number().min(0, 'Price must be a positive number'),
    })
  ).min(1, 'At least one item is required'),
});

type OrderFormValues = z.infer<typeof formSchema>;

interface OrderFormProps {
  order?: Order;
  onSubmit: (data: OrderFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export interface OrderFormRef {
  resetForm: () => void;
}

export const OrderForm = forwardRef<OrderFormRef, OrderFormProps>(({ order, onSubmit, onCancel, isSubmitting }, ref) => {
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const { products = [], fetchProducts, isLoading: isLoadingProducts } = useProducts();
  const { fetchCustomers } = useCustomers();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    const data = await fetchCustomers();
    if (data) {
      setCustomers(data);
    }
  };
  // Fetch products on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        await fetchProducts();
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    
    loadProducts();
  }, [fetchProducts]);

  // Expose resetForm method to parent
  useImperativeHandle(ref, () => ({
    resetForm: () => {
      form.reset({
        customerId: undefined,
        status: 'pending',
        notes: '',
        items: []
      });
      setSelectedProductId('');
      setQuantity('1');
      setUnitPrice('');
    }
  }));

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: order?.customerId || undefined,
      status: (order?.status as OrderStatus) || 'pending',
      notes: order?.notes || '',
      items: order?.items?.map(item => ({
        id: item.id,
        producotId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })) || [],
    },
  });

  const items = form.watch('items');
  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const addItem = () => {
    if (!selectedProductId || !quantity || !unitPrice) return;
    
    const product = products.find(p => p.id === Number(selectedProductId));
    if (!product) return;

    const newItem = {
      productId: Number(selectedProductId),
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
    };

    const currentItems = form.getValues('items');
    form.setValue('items', [...currentItems, newItem]);
    
    // Reset form
    setSelectedProductId('');
    setQuantity('1');
    setUnitPrice('');
  };

  const removeItem = (index: number) => {
    const currentItems = [...items];
    currentItems.splice(index, 1);
    form.setValue('items', currentItems);
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === Number(productId));
    if (product) {
      setUnitPrice(product.price.toString());
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit(onSubmit)();
      }} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field?.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {`${customer.firstName} ${customer.lastName}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Order Items</h3>
          
          <div className="grid grid-cols-12 gap-4 items-end">
            <div className="col-span-5">
              <label className="text-sm font-medium">Product</label>
              {isLoadingProducts ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={selectedProductId.toString()}
                  onValueChange={(value) => {
                    setSelectedProductId(Number(value));
                    handleProductSelect(value);
                  }}
                  disabled={isSubmitting || isLoadingProducts}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name}
                      </SelectItem>
                    ))}
                    {products?.length === 0 && (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No products available
                      </div>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="col-span-2">
              <label className="text-sm font-medium">Quantity</label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="col-span-3">
              <label className="text-sm font-medium">Unit Price</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="col-span-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                disabled={!selectedProductId || !quantity || !unitPrice || isSubmitting}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
          
          <div className="border rounded-md">
            <div className="bg-gray-50 px-4 py-2 border-b flex justify-between font-medium">
              <span>Product</span>
              <span className="text-right">Total</span>
            </div>
            <div className="divide-y">
              {items.map((item, index) => {
                const product = products.find(p => p.id === item.productId);
                const itemTotal = item.quantity * item.unitPrice;
                
                return (
                  <div key={index} className="px-4 py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{product?.name || 'Unknown Product'}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} × {Number(item.unitPrice)}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-4">{itemTotal}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        disabled={isSubmitting}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              
              {items.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-500">
                  No items added yet
                </div>
              )}
            </div>
            
            <div className="border-t px-4 py-3 bg-gray-50 flex justify-between font-medium">
              <span>Total</span>
              <span>{totalAmount}</span>
            </div>
          </div>
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Any special instructions or notes for this order..."
                    className="min-h-[100px]"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Order'}
          </Button>
        </div>
      </form>
    </Form>
  );
});

OrderForm.displayName = 'OrderForm';
