import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { OrderDetails } from '@/components/order';
import { useOrders } from '@/hooks/useOrders';
import { Order } from '@/types';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fetchOrderById, updateOrderStatus, loading } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);

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
      }
    };

    loadOrder();
  }, [id, fetchOrderById, navigate, toast]);

  const handleStatusChange = async (newStatus: Order['status']) => {
    if (!order || !id) return;
    
    try {
      await updateOrderStatus(Number(id), newStatus);
      setOrder({ ...order, status: newStatus });
      toast({
        title: 'Success',
        description: `Order status updated to ${newStatus}.`,
      });
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = async () => {
    // Implement email functionality
    toast({
      title: 'Email Sent',
      description: 'Order details have been sent to the customer.',
    });
  };

  const handleDownload = () => {
    // Implement download functionality
    toast({
      title: 'Download Started',
      description: 'Order details are being downloaded.',
    });
  };

  if (loading || !order) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <Button
        variant="outline"
        onClick={() => navigate('/orders')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Orders
      </Button>
      
      <OrderDetails 
        order={order} 
        onPrint={handlePrint}
        onEmail={handleEmail}
        onDownload={handleDownload}
        onBack={() => navigate('/orders')}
      />
      
      <div className="mt-6 flex justify-end space-x-4">
        {order.status === 'pending' && (
          <>
            <Button
              variant="outline"
              onClick={() => handleStatusChange('cancelled')}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Cancel Order
            </Button>
            <Button
              onClick={() => handleStatusChange('completed')}
            >
              Mark as Completed
            </Button>
          </>
        )}
        
        {order.status === 'completed' && (
          <Button
            variant="outline"
            onClick={() => handleStatusChange('cancelled')}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            Cancel Order
          </Button>
        )}
        
        {order.status === 'cancelled' && (
          <Button
            onClick={() => handleStatusChange('pending')}
          >
            Reactivate Order
          </Button>
        )}
      </div>
    </div>
  );
}
