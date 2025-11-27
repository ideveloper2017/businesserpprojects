import { useState, useCallback, useMemo } from 'react';
import { paymentApi } from '@/lib/api';
import { 
  Payment, 
  CreatePaymentRequest, 
  UpdatePaymentRequest, 
  PaymentFilterParams 
} from '@/types/payment.types';

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Calculate summary data
  const summaryData = useMemo(() => {
    return payments.reduce(
      (acc, payment) => {
        acc.totalPayments++;
        acc.totalAmount += payment.amount;
        
        if (payment.status === 'COMPLETED') {
          acc.successfulPayments++;
        } else if (payment.status === 'FAILED') {
          acc.failedPayments++;
        }
        
        return acc;
      },
      { totalPayments: 0, totalAmount: 0, successfulPayments: 0, failedPayments: 0 }
    );
  }, [payments]);

  // Fetch all payments with optional filters
  const fetchPayments = useCallback(async (params?: PaymentFilterParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await paymentApi.getAll(params);
      setPayments(data);
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch a single payment by ID
  const fetchPayment = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await paymentApi.getById(id);
      setPayment(data);
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new payment
  const createPayment = useCallback(async (paymentData: CreatePaymentRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await paymentApi.create(paymentData);
      setPayments(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update an existing payment
  const updatePayment = useCallback(async (id: number, paymentData: UpdatePaymentRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await paymentApi.update(id, paymentData);
      setPayments(prev => 
        prev.map(p => p.id === id ? { ...p, ...data } : p)
      );
      if (payment?.id === id) {
        setPayment(data);
      }
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [payment]);

  // Delete a payment
  const deletePayment = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await paymentApi.delete(id);
      setPayments(prev => prev.filter(p => p.id !== id));
      if (payment?.id === id) {
        setPayment(null);
      }
      return true;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [payment]);

  // Process a refund
  const processRefund = useCallback(async (paymentId: number, amount?: number, notes?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await paymentApi.refund(paymentId, amount, notes);
      setPayments(prev => 
        prev.map(p => p.id === paymentId ? { ...p, ...data } : p)
      );
      if (payment?.id === paymentId) {
        setPayment(data);
      }
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [payment]);

  // Update payment status
  const updatePaymentStatus = useCallback(async (id: number, status: string, notes?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await paymentApi.updateStatus(id, status, notes);
      setPayments(prev => 
        prev.map(p => p.id === id ? { ...p, ...data } : p)
      );
      if (payment?.id === id) {
        setPayment(data);
      }
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [payment]);

  // Get payments by order ID
  const getPaymentsByOrderId = useCallback(async (orderId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await paymentApi.getByOrderId(orderId);
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    payments,
    payment,
    isLoading,
    error,
    summaryData,
    fetchPayments,
    fetchPayment,
    createPayment,
    updatePayment,
    deletePayment,
    processRefund,
    updatePaymentStatus,
    getPaymentsByOrderId,
  };
};
