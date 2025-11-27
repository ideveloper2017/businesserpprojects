import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { OrderForm } from '@/components/order';
import { useOrders } from '@/hooks/useOrders';
import { Order, OrderFormValues } from '@/types';

export function EditOrderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fetchOrderById, updateOrder } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      if (!id) return;
      
      try {
        const orderData = await fetchOrderById(Number(id));
        setOrder(orderData);
      } catch (error) {
        console.error('Failed to load order:', error);
        toast({
          title: 'Error',
          description: 'Failed to load order details.',
          variant: 'destructive',
        });
        navigate('/orders');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [id, fetchOrderById, navigate, toast]);

  const handleSubmit = async (data: OrderFormValues) => {
    if (!id || !order) return;
    
    setIsSubmitting(true);
    
    try {
      await updateOrder(Number(id), {
        customerId: data.customerId,
        status: data.status,
        notes: data.notes,
        items: data.items.map(item => ({
          id: item.id, // Keep the same ID for existing items
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });
      
      toast({
        title: 'Success',
        description: 'Order updated successfully!',
      });
      
      navigate(`/orders/${id}`);
    } catch (error) {
      console.error('Failed to update order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <p>Order not found</p>
        <Button onClick={() => navigate('/orders')} className="mt-4">
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <Button
        variant="outline"
        onClick={() => navigate(`/orders/${id}`)}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Order
      </Button>
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Edit Order #{order.id}</h1>
          <p className="text-muted-foreground">
            Update order details
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <OrderForm
            order={order}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/orders/${id}`)}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
