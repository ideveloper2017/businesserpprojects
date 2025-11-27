import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Order, OrderStatus } from '@/types/order.types';
import { useOrders } from '@/hooks/useOrders';
import { OrderList } from '@/components/order';
import { useToast } from '@/components/ui/toast';

export function OrdersPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { 
    orders, 
    total, 
    loading, 
    error, 
    fetchOrders,
    fetchOrderStatuses,
    deleteOrder
  } = useOrders();

  useEffect(() => {
    setErrorMessage(null);
    console.log('OrdersPage: Fetching orders with status filter:', statusFilter);
    fetchOrders({
      status: statusFilter === 'all' ? undefined : statusFilter,
      search: searchTerm || undefined,
    })
    .catch(err => {
      console.error('Failed to fetch orders:', err);
      setErrorMessage('Не удалось загрузить заказы. Проверьте соединение с сервером.');
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось получить данные с сервера. Пожалуйста, проверьте подключение.',
        variant: 'destructive',
      });
    });

    fetchOrderStatuses()
    .catch(err => {
      console.error('Failed to fetch order statuses:', err);
    });
  }, [statusFilter, searchTerm, fetchOrders, fetchOrderStatuses, toast]);

  const handleCreateOrder = () => {
    navigate('/orders/new');
  };

  const handleViewOrder = (order: Order) => {
    navigate(`/orders/${order.id}`);
  };

  const handleEditOrder = (order: Order) => {
    navigate(`/orders/${order.id}/edit`);
  };

  const handleDeleteOrder = async (order: Order) => {
    if (!window.confirm(`Are you sure you want to delete order #${order.id}?`)) {
      return;
    }
    
    try {
      await deleteOrder(order.id);
      await fetchOrders({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchTerm || undefined,
      });
      
      toast({
        title: 'Order deleted',
        description: `Order #${order.id} has been deleted.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Failed to delete order:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete order. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = 
      searchTerm === '' ||
      order.id.toString().includes(searchTerm) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  // Calculate summary statistics
  const summary = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    completed: orders.filter(o => o.status === 'COMPLETED').length,
    cancelled: orders.filter(o => o.status === 'CANCELLED').length,
    totalRevenue: orders
      .filter(o => o.status === 'COMPLETED')
      .reduce((sum, order) => sum + order.totalAmount, 0),
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track your orders
          </p>
        </div>

      </div>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
          <strong className="font-bold">Ошибка! </strong>
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
            <p className="text-xs text-muted-foreground">
              All time orders
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summary.pending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting fulfillment
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.completed}</div>
            <p className="text-xs text-muted-foreground">
              Successfully fulfilled
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summary.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From completed orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderList
            orders={filteredOrders}
            isLoading={loading}
            onViewOrder={handleViewOrder}
            onEditOrder={handleEditOrder}
            onDeleteOrder={handleDeleteOrder}
            onCreateOrder={handleCreateOrder}
          />
        </CardContent>
      </Card>
    </div>
  );
}
