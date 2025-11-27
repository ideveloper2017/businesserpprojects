import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { OrderForm, OrderFormRef } from '@/components/order/OrderForm';
import { useOrders } from '@/hooks/useOrders';
import { OrderFormValues } from '@/components/order/OrderForm';
import { useAuth } from '@/hooks/useAuth';

export function CreateOrderPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createOrder } = useOrders();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const formRef = useRef<OrderFormRef>(null);

  const handleSubmit = async (data: OrderFormValues) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create an order',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        customerId: data.customerId,
        status: data.status,
        notes: data.notes || undefined,
        items: data.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };

      const response = await createOrder(orderData);

      if (response?.error) {
        throw new Error(response.error);
      }

      toast({
        title: 'Success',
        description: 'Order created successfully!',
      });

      // Navigate to the order details page
      setOrderCreated(true);
      if (formRef.current) {
        formRef.current.resetForm();
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <Button
              variant="outline"
              onClick={() => navigate('/orders')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          {orderCreated && (
            <Button
              variant="outline"
              onClick={() => {
                setOrderCreated(false);
                if (formRef.current) {
                  formRef.current.resetForm();
                }
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          )}
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">
              {orderCreated ? 'New Order' : 'Create New Order'}
            </h1>
            <p className="text-muted-foreground">
              Add a new order to the system
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
            <OrderForm
                ref={formRef}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/orders')}
                isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
  );
}