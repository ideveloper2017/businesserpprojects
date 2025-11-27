import { useState, useCallback } from 'react';
import { useCart } from './useCart';
import { orderApi } from '@/lib/api';
import { CreateOrderRequest, Order, OrderStatus, PaymentStatus } from '@/types/order.types';

export const usePosOrders = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const { items: cartItems, clearCart } = useCart();

  const createOrder = useCallback(async (customerId?: number, notes?: string) => {
    if (cartItems.length === 0) {
      throw new Error('Корзина пуста. Добавьте товары перед оформлением заказа.');
    }

    setIsLoading(true);
    setError(null);

    try {
      const orderRequest: CreateOrderRequest = {
        customerId,
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
          discountAmount: 0, // Можно добавить скидки позже
          taxAmount: 0, // Можно добавить налоги позже
        })),
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        customerNotes: notes,
      };

      const response = await orderApi.createOrder(orderRequest);
      
      // Очищаем корзину после успешного создания заказа
      if (response) {
        clearCart();
        setCurrentOrder(response);
      }
      
      return response;
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [cartItems, clearCart]);

  const saveAsDraft = useCallback(async (customerId?: number, notes?: string) => {
    if (cartItems.length === 0) {
      throw new Error('Корзина пуста. Добавьте товары для сохранения черновика.');
    }

    setIsLoading(true);
    setError(null);

    try {
      const orderRequest: CreateOrderRequest = {
        customerId,
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
          discountAmount: 0,
          taxAmount: 0,
        })),
        status: OrderStatus.DRAFT,
        paymentStatus: PaymentStatus.PENDING,
        customerNotes: notes ? `[Черновик] ${notes}` : 'Черновик заказа',
      };

      const response = await orderApi.createOrder(orderRequest);
      
      if (response) {
        clearCart();
        setCurrentOrder(response);
      }
      
      return response;
    } catch (err) {
      console.error('Error saving draft order:', err);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [cartItems, clearCart]);

  return {
    createOrder,
    saveAsDraft,
    currentOrder,
    isLoading,
    error,
  };
};
