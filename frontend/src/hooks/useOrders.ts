import { useState, useCallback } from 'react';
import { Order, OrderStatus } from '@/types/order.types';
import { orderApi } from '@/lib/api';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order>();
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);

  const mapOrderDto = (dto: any): Order => ({
    id: dto.id,
    orderNumber: dto.orderNumber,
    customerId: dto.user?.id,
    customer: dto.customer,
    user: dto.user,
    items: dto.items.map((it: any) => ({
      productId: it.productId,
      product: it.product,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      total: it.totalPrice,
    })),
    status: dto.status,
    paymentStatus: dto.paymentStatus,
    subtotal: dto.subtotal,
    taxAmount: dto.taxAmount,
    discountAmount: dto.discountAmount,
    totalAmount: dto.totalAmount,
    notes: dto.customerNotes,
    createdAt: dto.orderDate,
    updatedAt: dto.orderDate,
  });

  // Fetch orders with filters
  const fetchOrders = useCallback(async (params: {
    status?: OrderStatus;
    customerId?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    search?: string;
    size?: number;
  } = { page: 0, limit: 10 }) => {
    console.log('fetchOrders called with params:', params);
    setLoading(true);
    setError(null);
    try {
      // Собираем параметры для запроса
      const queryParams = {
        startDate: params.startDate,
        endDate: params.endDate,
        status: params.status,
        customerId: params.customerId,
        page: params.page || 0,
        limit: params.limit || 10,
        search: params.search
      };

      console.log('Sending request to API with params:', queryParams);
      const list = await orderApi.getOrders(queryParams);
      console.log('Received orders from API:', list);

      if (Array.isArray(list)) {
        const transformed = list.map(mapOrderDto);
        console.log(`Transformed ${transformed.length} orders`);
        setOrders(transformed);
        setTotal(transformed.length);
        return transformed;
      } else {
        console.error('Expected array of orders but got:', list);
        setOrders([]);
        setTotal(0);
        return [];
      }
    } catch (err) {
      console.error('Error in fetchOrders:', err);
      setError(err as Error);
      setOrders([]);
      setTotal(0);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch order by ID
  const fetchOrderById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const order = await orderApi.getOrderById(id);
      setCurrentOrder(order);
      return order;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new order
  const createOrder = useCallback(async (data: Parameters<typeof orderApi.createOrder>[0]) => {
    setLoading(true);
    setError(null);
    try {
      const newOrder = await orderApi.createOrder(data);
      setOrders(prev => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update order
  const updateOrder = useCallback(async (id: number, data: Parameters<typeof orderApi.updateOrder>[1]) => {
    setLoading(true);
    setError(null);
    try {
      const updatedOrder = await orderApi.updateOrder(id, data);
      setOrders(prev => 
        prev.map(order => order.id === id ? updatedOrder : order)
      );
      if (currentOrder?.id === id) {
        setCurrentOrder(updatedOrder);
      }
      return updatedOrder;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentOrder]);

  // Update order status
  const updateOrderStatus = useCallback(async (id: number, status: OrderStatus) => {
    setLoading(true);
    setError(null);
    try {
      const updatedOrder = await orderApi.updateOrderStatus(id, status);
      setOrders(prev => 
        prev.map(order => order.id === id ? updatedOrder : order)
      );
      if (currentOrder?.id === id) {
        setCurrentOrder(updatedOrder);
      }
      return updatedOrder;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentOrder]);

  // Delete order
  const deleteOrder = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await orderApi.deleteOrder(id);
      setOrders(prev => prev.filter(order => order.id !== id));
      if (currentOrder?.id === id) {
        setCurrentOrder(null);
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentOrder]);

  // Fetch order statuses
  const fetchOrderStatuses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const statusList = await orderApi.getOrderStatuses();
      setStatuses(statusList);
      return statusList;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    orders,
    total,
    currentOrder,
    loading,
    error,
    fetchOrders,
    fetchOrderById,
    createOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    fetchOrderStatuses,
  };
};
